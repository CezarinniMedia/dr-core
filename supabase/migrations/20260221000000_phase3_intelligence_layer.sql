-- ============================================================
-- PHASE 3: Intelligence Layer
-- Vision Architecture | Data Engineer: Dara
-- QA Review: Quinn (fixes C1, C2, H1, H2, H3, M1, M2)
--
-- Conteudo:
--   1. Tabela spike_alerts (prerequisito para trigger)
--   2. Materialized Views (substitui BD-2.5 + nova spike detection)
--      - mv_dashboard_metrics  (substitui mv_dashboard_stats)
--      - mv_traffic_summary    (substitui mv_offer_traffic_summary)
--      - mv_spike_detection    (NOVA)
--   3. Backward-compatible views (C1+C2 fix)
--      - mv_dashboard_stats    (view → mv_dashboard_metrics)
--      - mv_offer_traffic_summary (view → mv_traffic_summary)
--   4. RPC Functions
--      - get_dashboard_metrics(workspace UUID)
--      - get_traffic_comparison(offer_ids UUID[], start_date DATE, end_date DATE)
--      - detect_spikes(threshold NUMERIC, lookback_days INT)
--      - bulk_upsert_traffic_data(records JSONB) — bulk import com skip_spike_check
--   5. Realtime trigger (com guarda para bulk import)
--      - fn_check_spike_on_traffic() + trg_spike_check
--      - pg_notify canal 'spike_alerts'
--
-- Tabelas base (nomes atuais, pre-rename):
--   spied_offers, offer_traffic_data, offer_domains
--
-- Rollback: ver secao DOWN MIGRATION no final do arquivo
-- ============================================================

-- Nota: Supabase CLI ja envolve migrations em transacao.
-- NAO usar BEGIN/COMMIT explicito (H3 fix).

-- ============================================================
-- 1. TABELA: spike_alerts
-- ============================================================

CREATE TABLE IF NOT EXISTS spike_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  spied_offer_id UUID NOT NULL REFERENCES spied_offers(id) ON DELETE CASCADE,

  domain TEXT NOT NULL,
  period_date DATE NOT NULL,
  previous_visits BIGINT,
  current_visits BIGINT,
  change_percent NUMERIC(8,2),

  alert_type TEXT NOT NULL DEFAULT 'spike'
    CHECK (alert_type IN ('spike', 'drop', 'new_entry', 'resurrection')),

  is_read BOOLEAN DEFAULT false,
  is_dismissed BOOLEAN DEFAULT false,

  detected_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- Dedup: um alerta por (oferta, dominio, periodo, tipo)
  CONSTRAINT unique_spike_alert UNIQUE (spied_offer_id, domain, period_date, alert_type)
);

CREATE INDEX IF NOT EXISTS idx_spike_alerts_workspace_unread
  ON spike_alerts(workspace_id, is_read) WHERE NOT is_dismissed;
CREATE INDEX IF NOT EXISTS idx_spike_alerts_offer
  ON spike_alerts(spied_offer_id);
CREATE INDEX IF NOT EXISTS idx_spike_alerts_detected
  ON spike_alerts(detected_at DESC);

ALTER TABLE spike_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members view spike alerts"
  ON spike_alerts FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Workspace members update spike alerts"
  ON spike_alerts FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id))
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

GRANT SELECT, UPDATE ON spike_alerts TO authenticated;

COMMENT ON TABLE spike_alerts IS
  'Alertas de spike/drop de trafego detectados automaticamente. Phase 3 Intelligence (2026-02-21).';

-- ============================================================
-- 2. MATERIALIZED VIEWS
-- ============================================================

-- ---- Limpar pg_cron jobs das MVs antigas (BD-2.5) ----
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('refresh-mv-traffic-summary');
    PERFORM cron.unschedule('refresh-mv-dashboard-stats');
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'pg_cron cleanup skipped: %', SQLERRM;
END $$;

-- ---- Drop MVs antigas (BD-2.5) ----
DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_stats CASCADE;
DROP MATERIALIZED VIEW IF EXISTS mv_offer_traffic_summary CASCADE;

-- ────────────────────────────────────────────────────────────
-- 2a. mv_dashboard_metrics
--     KPIs agregados por workspace para o Dashboard
--     Substitui: mv_dashboard_stats (BD-2.5)
-- ────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW mv_dashboard_metrics AS
SELECT
  so.workspace_id,

  -- Contadores de ofertas por status
  -- M2 fix: DYING e NEVER_SCALED tambem sao inativos
  COUNT(*) FILTER (WHERE so.status NOT IN ('DEAD', 'VAULT', 'DYING', 'NEVER_SCALED'))
                                                                    AS total_active_offers,
  COUNT(*) FILTER (WHERE so.status = 'HOT')                        AS hot_offers,
  COUNT(*) FILTER (WHERE so.status = 'SCALING')                    AS scaling_offers,
  COUNT(*) FILTER (WHERE so.status = 'ANALYZING')                  AS analyzing_offers,
  COUNT(*) FILTER (WHERE so.status = 'RADAR')                      AS radar_offers,
  COUNT(*) FILTER (WHERE so.status = 'CLONED')                     AS cloned_offers,
  COUNT(*)                                                          AS total_offers_all,

  -- Contadores de dominio e trafego
  (SELECT COUNT(DISTINCT od.domain)
   FROM offer_domains od
   WHERE od.workspace_id = so.workspace_id)                         AS total_domains,

  (SELECT COUNT(*)
   FROM offer_traffic_data otd
   WHERE otd.workspace_id = so.workspace_id)                        AS total_traffic_points,

  -- Spikes nos ultimos 30 dias
  (SELECT COUNT(*)
   FROM spike_alerts sa
   WHERE sa.workspace_id = so.workspace_id
     AND sa.detected_at >= now() - INTERVAL '30 days'
     AND sa.alert_type = 'spike')                                   AS spikes_last_30d,

  -- Spikes nao lidos
  (SELECT COUNT(*)
   FROM spike_alerts sa
   WHERE sa.workspace_id = so.workspace_id
     AND sa.is_read = false
     AND sa.is_dismissed = false)                                   AS unread_spikes,

  -- Timestamp de referencia
  MAX(so.updated_at)                                                AS last_offer_updated,
  now()                                                             AS refreshed_at

FROM spied_offers so
GROUP BY so.workspace_id;

CREATE UNIQUE INDEX idx_mv_dashboard_metrics_ws
  ON mv_dashboard_metrics(workspace_id);

-- NOTE: RLS nao e suportado em materialized views no PostgreSQL.
-- Acesso controlado via SECURITY DEFINER RPCs.
GRANT SELECT ON mv_dashboard_metrics TO authenticated;

COMMENT ON MATERIALIZED VIEW mv_dashboard_metrics IS
  'KPIs agregados por workspace: contadores de status, dominios, trafego, spikes. Refresh a cada 4h. Phase 3 (2026-02-21).';

-- ────────────────────────────────────────────────────────────
-- 2b. mv_traffic_summary
--     Trafego sumarizado por oferta/source
--     Substitui: mv_offer_traffic_summary (BD-2.5)
--     H1 fix: COALESCE(source) para NULLs,
--             IS NOT DISTINCT FROM nas subqueries
-- ────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW mv_traffic_summary AS
WITH base AS (
  SELECT
    otd.spied_offer_id,
    otd.workspace_id,
    COALESCE(otd.source, 'unknown') AS source,
    SUM(otd.visits)                  AS total_visits,
    MAX(otd.visits)                  AS peak_visits,
    AVG(otd.visits)::BIGINT          AS avg_visits,
    MIN(otd.period_date)             AS earliest_period,
    MAX(otd.period_date)             AS latest_period,
    COUNT(*)                         AS data_points,
    COUNT(DISTINCT otd.domain)       AS domain_count
  FROM offer_traffic_data otd
  WHERE otd.visits IS NOT NULL
  GROUP BY otd.spied_offer_id, otd.workspace_id, COALESCE(otd.source, 'unknown')
)
SELECT
  b.spied_offer_id,
  b.workspace_id,
  b.source,
  b.total_visits,
  b.peak_visits,
  b.avg_visits,
  b.earliest_period,
  b.latest_period,
  b.data_points,
  b.domain_count,
  -- Ultimo mes disponivel (para sparkline rapida)
  (SELECT otd2.visits
   FROM offer_traffic_data otd2
   WHERE otd2.spied_offer_id = b.spied_offer_id
     AND COALESCE(otd2.source, 'unknown') = b.source
   ORDER BY otd2.period_date DESC
   LIMIT 1)                          AS latest_visits,
  -- Penultimo mes (para calcular variacao)
  (SELECT otd3.visits
   FROM offer_traffic_data otd3
   WHERE otd3.spied_offer_id = b.spied_offer_id
     AND COALESCE(otd3.source, 'unknown') = b.source
   ORDER BY otd3.period_date DESC
   OFFSET 1 LIMIT 1)                AS previous_visits
FROM base b;

-- H1 fix: COALESCE garante que o unique index nao tem NULLs
CREATE UNIQUE INDEX idx_mv_traffic_summary_pk
  ON mv_traffic_summary(spied_offer_id, source);

-- NOTE: RLS nao e suportado em materialized views no PostgreSQL.
-- Acesso controlado via SECURITY DEFINER RPCs.
GRANT SELECT ON mv_traffic_summary TO authenticated;

COMMENT ON MATERIALIZED VIEW mv_traffic_summary IS
  'Trafego sumarizado por oferta/source: total, pico, media, ultimo, penultimo, periodos. Refresh a cada 6h. Phase 3 (2026-02-21).';

-- ────────────────────────────────────────────────────────────
-- 2c. mv_spike_detection
--     Deteccao de spikes: variacoes >100% mes-a-mes
--     NOVA (nao existia no BD-2.5)
-- ────────────────────────────────────────────────────────────

CREATE MATERIALIZED VIEW mv_spike_detection AS
WITH traffic_with_lag AS (
  SELECT
    otd.spied_offer_id,
    otd.workspace_id,
    otd.domain,
    COALESCE(otd.source, 'unknown') AS source,
    otd.period_date,
    otd.visits,
    LAG(otd.visits) OVER (
      PARTITION BY otd.spied_offer_id, otd.domain, COALESCE(otd.source, 'unknown')
      ORDER BY otd.period_date
    ) AS prev_visits
  FROM offer_traffic_data otd
  WHERE otd.period_date >= CURRENT_DATE - INTERVAL '12 months'
    AND otd.visits IS NOT NULL
)
SELECT
  twl.spied_offer_id,
  twl.workspace_id,
  twl.domain,
  twl.source,
  twl.period_date,
  twl.visits            AS current_visits,
  twl.prev_visits,
  CASE
    WHEN twl.prev_visits > 0 THEN
      ROUND(((twl.visits::NUMERIC - twl.prev_visits) / twl.prev_visits * 100), 1)
    ELSE NULL
  END                   AS change_percent,
  CASE
    WHEN twl.prev_visits IS NULL OR twl.prev_visits = 0 THEN 'new_entry'
    WHEN twl.visits > twl.prev_visits * 2 THEN 'spike'
    WHEN twl.visits < twl.prev_visits * 0.5 THEN 'drop'
    ELSE NULL
  END                   AS alert_type
FROM traffic_with_lag twl
WHERE
  -- Incluir: spikes (>100%), drops (>50%), new entries
  (twl.prev_visits > 0 AND twl.visits > twl.prev_visits * 2)
  OR (twl.prev_visits > 0 AND twl.visits < twl.prev_visits * 0.5)
  OR (twl.prev_visits IS NULL AND twl.visits > 0);

CREATE UNIQUE INDEX idx_mv_spike_detection_pk
  ON mv_spike_detection(spied_offer_id, domain, source, period_date);

-- NOTE: RLS nao e suportado em materialized views no PostgreSQL.
-- Acesso controlado via SECURITY DEFINER RPCs.
GRANT SELECT ON mv_spike_detection TO authenticated;

COMMENT ON MATERIALIZED VIEW mv_spike_detection IS
  'Deteccao de spikes/drops de trafego: variacoes >100% (spike) ou >50% queda (drop) mes-a-mes. Ultimos 12 meses. Phase 3 (2026-02-21).';

-- ---- Refresh inicial ----
REFRESH MATERIALIZED VIEW mv_dashboard_metrics;
REFRESH MATERIALIZED VIEW mv_traffic_summary;
REFRESH MATERIALIZED VIEW mv_spike_detection;

-- ============================================================
-- 3. BACKWARD-COMPATIBLE VIEWS (C1+C2 fix)
--    O frontend atual referencia os nomes antigos:
--    - Dashboard.tsx → mv_dashboard_stats
--    - useSpiedOffersTraffic.ts → mv_offer_traffic_summary
--    Criamos VIEWs regulares que mapeiam colunas antigas → novas.
--    Frontend continua funcionando; migracao gradual para novos nomes.
-- ============================================================

-- C1 fix: mv_dashboard_stats → mv_dashboard_metrics
-- Mapeia colunas antigas (total_offers, unique_domains, active_offers,
-- potential_offers, last_updated) para as novas.
CREATE OR REPLACE VIEW mv_dashboard_stats
WITH (security_invoker = true) AS
SELECT
  workspace_id,
  total_offers_all                     AS total_offers,
  total_domains::BIGINT                AS unique_domains,
  total_active_offers                  AS active_offers,
  analyzing_offers                     AS potential_offers,
  last_offer_updated                   AS last_updated
FROM mv_dashboard_metrics;

GRANT SELECT ON mv_dashboard_stats TO authenticated;

COMMENT ON VIEW mv_dashboard_stats IS
  'BACKWARD COMPAT: mapeia colunas antigas para mv_dashboard_metrics. Migrar frontend para get_dashboard_metrics() RPC. Phase 3 (2026-02-21).';

-- C2 fix: mv_offer_traffic_summary → mv_traffic_summary
-- O frontend espera UMA row por spied_offer_id (sem dimensao source).
-- Colunas esperadas: spied_offer_id, domain_count, total_visits,
--   latest_period, earliest_period, latest_sw_visits, latest_sr_visits,
--   avg_monthly_visits
CREATE OR REPLACE VIEW mv_offer_traffic_summary
WITH (security_invoker = true) AS
SELECT
  spied_offer_id,
  MAX(domain_count)::INT                                                                AS domain_count,
  SUM(total_visits)::BIGINT                                                             AS total_visits,
  MAX(latest_period)                                                                    AS latest_period,
  MIN(earliest_period)                                                                  AS earliest_period,
  MAX(CASE WHEN source IN ('monthly_sw', 'similarweb') THEN latest_visits END)::BIGINT  AS latest_sw_visits,
  MAX(CASE WHEN source IN ('monthly', 'semrush', 'semrush_csv') THEN latest_visits END)::BIGINT AS latest_sr_visits,
  AVG(avg_visits)::BIGINT                                                               AS avg_monthly_visits
FROM mv_traffic_summary
GROUP BY spied_offer_id;

GRANT SELECT ON mv_offer_traffic_summary TO authenticated;

COMMENT ON VIEW mv_offer_traffic_summary IS
  'BACKWARD COMPAT: agrega mv_traffic_summary por oferta (sem dimensao source). Mapeia colunas SW/SR legado. Phase 3 (2026-02-21).';

-- ============================================================
-- 4. RPC FUNCTIONS
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 4a. get_dashboard_metrics(p_workspace_id UUID)
--     Retorna KPIs do dashboard para um workspace
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_dashboard_metrics(p_workspace_id UUID)
RETURNS TABLE (
  total_active_offers BIGINT,
  hot_offers BIGINT,
  scaling_offers BIGINT,
  analyzing_offers BIGINT,
  radar_offers BIGINT,
  cloned_offers BIGINT,
  total_offers_all BIGINT,
  total_domains BIGINT,
  total_traffic_points BIGINT,
  spikes_last_30d BIGINT,
  unread_spikes BIGINT,
  last_offer_updated TIMESTAMPTZ,
  refreshed_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    m.total_active_offers,
    m.hot_offers,
    m.scaling_offers,
    m.analyzing_offers,
    m.radar_offers,
    m.cloned_offers,
    m.total_offers_all,
    m.total_domains,
    m.total_traffic_points,
    m.spikes_last_30d,
    m.unread_spikes,
    m.last_offer_updated,
    m.refreshed_at
  FROM mv_dashboard_metrics m
  WHERE m.workspace_id = p_workspace_id
    AND is_workspace_member(auth.uid(), p_workspace_id);
$$;

COMMENT ON FUNCTION get_dashboard_metrics(UUID) IS
  'Retorna KPIs do dashboard para um workspace. Leitura da MV pre-computada. Phase 3 (2026-02-21).';

-- ────────────────────────────────────────────────────────────
-- 4b. get_traffic_comparison(p_offer_ids UUID[], p_start DATE, p_end DATE)
--     Retorna dados de trafego para comparacao multi-dominio
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION get_traffic_comparison(
  p_offer_ids UUID[],
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  spied_offer_id UUID,
  offer_name TEXT,
  domain TEXT,
  source TEXT,
  period_date DATE,
  visits BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    otd.spied_offer_id,
    so.nome          AS offer_name,
    otd.domain,
    COALESCE(otd.source, 'unknown') AS source,
    otd.period_date,
    COALESCE(otd.visits, 0) AS visits
  FROM offer_traffic_data otd
  INNER JOIN spied_offers so ON so.id = otd.spied_offer_id
  WHERE otd.spied_offer_id = ANY(p_offer_ids)
    AND otd.period_date >= p_start_date
    AND otd.period_date <= p_end_date
    AND so.workspace_id IN (
      SELECT wm.workspace_id
      FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  ORDER BY otd.spied_offer_id, otd.domain, otd.period_date;
$$;

COMMENT ON FUNCTION get_traffic_comparison(UUID[], DATE, DATE) IS
  'Retorna dados de trafego para comparacao multi-dominio. Filtra por offer_ids e periodo. Phase 3 (2026-02-21).';

-- ────────────────────────────────────────────────────────────
-- 4c. detect_spikes(p_threshold NUMERIC, p_lookback_days INT)
--     Detecta spikes em tempo real (query direta, nao MV)
--     Threshold em porcentagem (ex: 100 = +100%)
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION detect_spikes(
  p_threshold NUMERIC DEFAULT 100,
  p_lookback_days INT DEFAULT 180
)
RETURNS TABLE (
  spied_offer_id UUID,
  offer_name TEXT,
  offer_status TEXT,
  workspace_id UUID,
  domain TEXT,
  source TEXT,
  period_date DATE,
  current_visits BIGINT,
  prev_visits BIGINT,
  change_percent NUMERIC(8,2),
  alert_type TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH traffic_lag AS (
    SELECT
      otd.spied_offer_id,
      otd.workspace_id,
      otd.domain,
      COALESCE(otd.source, 'unknown') AS source,
      otd.period_date,
      COALESCE(otd.visits, 0) AS visits,
      LAG(COALESCE(otd.visits, 0)) OVER (
        PARTITION BY otd.spied_offer_id, otd.domain, COALESCE(otd.source, 'unknown')
        ORDER BY otd.period_date
      ) AS prev_visits
    FROM offer_traffic_data otd
    WHERE otd.period_date >= CURRENT_DATE - make_interval(days => p_lookback_days)
      AND otd.workspace_id IN (
        SELECT wm.workspace_id
        FROM workspace_members wm
        WHERE wm.user_id = auth.uid()
      )
  )
  SELECT
    tl.spied_offer_id,
    so.nome              AS offer_name,
    so.status            AS offer_status,
    tl.workspace_id,
    tl.domain,
    tl.source,
    tl.period_date,
    tl.visits            AS current_visits,
    tl.prev_visits,
    CASE
      WHEN tl.prev_visits > 0 THEN
        ROUND(((tl.visits::NUMERIC - tl.prev_visits) / tl.prev_visits * 100), 1)
      ELSE NULL
    END                  AS change_percent,
    CASE
      WHEN tl.prev_visits IS NULL OR tl.prev_visits = 0 THEN 'new_entry'
      WHEN tl.visits::NUMERIC >= tl.prev_visits * (1 + p_threshold / 100) THEN 'spike'
      WHEN tl.visits::NUMERIC <= tl.prev_visits * (1 - p_threshold / 100) THEN 'drop'
      ELSE NULL
    END                  AS alert_type
  FROM traffic_lag tl
  INNER JOIN spied_offers so ON so.id = tl.spied_offer_id
  WHERE tl.prev_visits IS NOT NULL
    AND tl.prev_visits > 0
    AND (
      tl.visits::NUMERIC >= tl.prev_visits * (1 + p_threshold / 100)
      OR tl.visits::NUMERIC <= tl.prev_visits * (1 - p_threshold / 100)
    )
  ORDER BY
    CASE
      WHEN tl.prev_visits > 0 THEN ABS(tl.visits::NUMERIC - tl.prev_visits) / tl.prev_visits
      ELSE 0
    END DESC,
    tl.period_date DESC;
$$;

COMMENT ON FUNCTION detect_spikes(NUMERIC, INT) IS
  'Detecta spikes/drops de trafego em tempo real. threshold=porcentagem minima de variacao, lookback_days=janela de analise. Phase 3 (2026-02-21).';

-- ────────────────────────────────────────────────────────────
-- 4d. bulk_upsert_traffic_data(p_records JSONB)
--     RPC para importacao em massa com skip_spike_check
--     Evita ~56k queries do trigger em imports de 14k+ registros
--     O SET LOCAL garante que o trigger nao dispara durante o batch
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION bulk_upsert_traffic_data(p_records JSONB)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count INT;
BEGIN
  -- Verificar autenticacao
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Verificar que caller pertence a TODOS os workspaces dos registros
  -- EXCEPT detecta workspaces que o user NAO pertence (H1 QA fix)
  IF EXISTS (
    SELECT DISTINCT (r->>'workspace_id')::UUID
    FROM jsonb_array_elements(p_records) AS r
    WHERE r->>'workspace_id' IS NOT NULL
    EXCEPT
    SELECT wm.workspace_id
    FROM workspace_members wm
    WHERE wm.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Unauthorized: user is not a member of the target workspace';
  END IF;

  -- Desabilitar trigger de spike durante bulk import (H2 fix)
  -- SET LOCAL e automaticamente revertido no fim da transacao
  SET LOCAL app.skip_spike_check = 'true';

  WITH input AS (
    SELECT
      (r->>'spied_offer_id')::UUID AS spied_offer_id,
      (r->>'workspace_id')::UUID AS workspace_id,
      r->>'domain' AS domain,
      r->>'period_type' AS period_type,
      (r->>'period_date')::DATE AS period_date,
      (r->>'visits')::BIGINT AS visits,
      (r->>'unique_visitors')::BIGINT AS unique_visitors,
      (r->>'pages_per_visit')::NUMERIC AS pages_per_visit,
      (r->>'avg_visit_duration')::NUMERIC AS avg_visit_duration,
      (r->>'bounce_rate')::NUMERIC AS bounce_rate,
      r->>'source' AS source
    FROM jsonb_array_elements(p_records) AS r
  )
  INSERT INTO offer_traffic_data (
    spied_offer_id, workspace_id, domain, period_type, period_date,
    visits, unique_visitors, pages_per_visit, avg_visit_duration, bounce_rate, source
  )
  SELECT * FROM input
  ON CONFLICT (spied_offer_id, domain, period_type, period_date)
  DO UPDATE SET
    visits = EXCLUDED.visits,
    unique_visitors = EXCLUDED.unique_visitors,
    pages_per_visit = EXCLUDED.pages_per_visit,
    avg_visit_duration = EXCLUDED.avg_visit_duration,
    bounce_rate = EXCLUDED.bounce_rate,
    source = EXCLUDED.source;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMENT ON FUNCTION bulk_upsert_traffic_data(JSONB) IS
  'RPC para importacao em massa de trafego com skip_spike_check. Aceita JSONB array, faz upsert e retorna contagem. Phase 3 (2026-02-21).';

-- ============================================================
-- 5. REALTIME TRIGGER
--    Dispara ao inserir/atualizar trafego em offer_traffic_data
--    Compara com periodo anterior: se spike >100%, cria alerta
--    e notifica canal 'spike_alerts' via pg_notify
--
--    H2 fix: Guarda para bulk import. Setar antes de importar:
--      SET LOCAL app.skip_spike_check = 'true';
--    Isso desabilita o trigger durante o batch, evitando ~56k
--    queries adicionais em imports de 14k+ registros.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_check_spike_on_traffic()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_prev_visits BIGINT;
  v_change_pct  NUMERIC(8,2);
  v_alert_type  TEXT;
  v_offer_name  TEXT;
BEGIN
  -- H2 fix: Skip durante bulk import
  -- Usar: SET LOCAL app.skip_spike_check = 'true'; antes do batch
  IF current_setting('app.skip_spike_check', true) = 'true' THEN
    RETURN NEW;
  END IF;

  -- Buscar visitas do periodo anterior (mesmo dominio, mesma source)
  SELECT visits INTO v_prev_visits
  FROM offer_traffic_data
  WHERE spied_offer_id = NEW.spied_offer_id
    AND domain = NEW.domain
    AND source IS NOT DISTINCT FROM NEW.source
    AND period_date < NEW.period_date
  ORDER BY period_date DESC
  LIMIT 1;

  -- Sem dados anteriores = new_entry (apenas se trafego > 0)
  IF v_prev_visits IS NULL AND COALESCE(NEW.visits, 0) > 0 THEN
    v_alert_type := 'new_entry';
    v_change_pct := NULL;

  -- Periodo anterior zerado, agora com trafego = resurrection
  ELSIF COALESCE(v_prev_visits, 0) = 0 AND COALESCE(NEW.visits, 0) > 0 THEN
    v_alert_type := 'resurrection';
    v_change_pct := NULL;

  -- Calcular variacao percentual
  ELSIF v_prev_visits > 0 AND NEW.visits IS NOT NULL THEN
    v_change_pct := ROUND(((NEW.visits::NUMERIC - v_prev_visits) / v_prev_visits * 100), 1);

    IF v_change_pct >= 100 THEN
      v_alert_type := 'spike';
    ELSIF v_change_pct <= -50 THEN
      v_alert_type := 'drop';
    ELSE
      -- Variacao dentro do normal, nao gerar alerta
      RETURN NEW;
    END IF;

  ELSE
    -- Sem dados suficientes para comparar
    RETURN NEW;
  END IF;

  -- Inserir alerta (ON CONFLICT = idempotente, atualiza se ja existe)
  INSERT INTO spike_alerts (
    workspace_id, spied_offer_id, domain, period_date,
    previous_visits, current_visits, change_percent, alert_type
  ) VALUES (
    NEW.workspace_id, NEW.spied_offer_id, NEW.domain, NEW.period_date,
    v_prev_visits, NEW.visits, v_change_pct, v_alert_type
  )
  ON CONFLICT (spied_offer_id, domain, period_date, alert_type)
  DO UPDATE SET
    previous_visits = EXCLUDED.previous_visits,
    current_visits = EXCLUDED.current_visits,
    change_percent = EXCLUDED.change_percent,
    detected_at = now(),
    updated_at = now(),
    is_read = false;

  -- Notificar canal para Supabase Realtime
  SELECT nome INTO v_offer_name
  FROM spied_offers WHERE id = NEW.spied_offer_id;

  PERFORM pg_notify('spike_alerts', json_build_object(
    'type', v_alert_type,
    'offer_id', NEW.spied_offer_id,
    'offer_name', COALESCE(v_offer_name, ''),
    'domain', NEW.domain,
    'current_visits', NEW.visits,
    'previous_visits', v_prev_visits,
    'change_percent', v_change_pct,
    'period_date', NEW.period_date,
    'workspace_id', NEW.workspace_id
  )::TEXT);

  RETURN NEW;
END;
$$;

-- Trigger AFTER INSERT OR UPDATE para nao bloquear o insert original
DROP TRIGGER IF EXISTS trg_spike_check ON offer_traffic_data;

CREATE TRIGGER trg_spike_check
  AFTER INSERT OR UPDATE OF visits
  ON offer_traffic_data
  FOR EACH ROW
  EXECUTE FUNCTION fn_check_spike_on_traffic();

COMMENT ON FUNCTION fn_check_spike_on_traffic() IS
  'Trigger function: detecta spikes/drops ao inserir/atualizar trafego. Cria alerta em spike_alerts e notifica via pg_notify. Desabilitavel via SET LOCAL app.skip_spike_check = true. Phase 3 (2026-02-21).';

-- ============================================================
-- 6. GRANTS para RPC Functions
-- ============================================================

GRANT EXECUTE ON FUNCTION get_dashboard_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_traffic_comparison(UUID[], DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION detect_spikes(NUMERIC, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION bulk_upsert_traffic_data(JSONB) TO authenticated;

-- ============================================================
-- 7. pg_cron: Refresh automatico das MVs
-- ============================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN

    -- Dashboard metrics: a cada 4 horas
    PERFORM cron.schedule(
      'refresh-mv-dashboard-metrics',
      '0 */4 * * *',
      'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_metrics'
    );

    -- Traffic summary: a cada 6 horas
    PERFORM cron.schedule(
      'refresh-mv-traffic-summary',
      '0 */6 * * *',
      'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_traffic_summary'
    );

    -- Spike detection: a cada 2 horas
    PERFORM cron.schedule(
      'refresh-mv-spike-detection',
      '0 */2 * * *',
      'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_spike_detection'
    );

    RAISE NOTICE 'pg_cron: 3 jobs registrados para refresh das materialized views (Phase 3).';
  ELSE
    RAISE NOTICE 'pg_cron nao disponivel. Configure Edge Function para refresh automatico das MVs.';
  END IF;
END $$;

-- ============================================================
-- DOWN MIGRATION (referencia para rollback manual)
-- ============================================================
-- Para reverter completamente:
--
--   -- 1. Remover pg_cron jobs
--   SELECT cron.unschedule('refresh-mv-dashboard-metrics');
--   SELECT cron.unschedule('refresh-mv-traffic-summary');
--   SELECT cron.unschedule('refresh-mv-spike-detection');
--
--   -- 2. Remover trigger
--   DROP TRIGGER IF EXISTS trg_spike_check ON offer_traffic_data;
--   DROP FUNCTION IF EXISTS fn_check_spike_on_traffic();
--
--   -- 3. Remover RPC functions
--   DROP FUNCTION IF EXISTS get_dashboard_metrics(UUID);
--   DROP FUNCTION IF EXISTS get_traffic_comparison(UUID[], DATE, DATE);
--   DROP FUNCTION IF EXISTS detect_spikes(NUMERIC, INT);
--   DROP FUNCTION IF EXISTS bulk_upsert_traffic_data(JSONB);
--
--   -- 4. Remover views de compatibilidade
--   DROP VIEW IF EXISTS mv_dashboard_stats;
--   DROP VIEW IF EXISTS mv_offer_traffic_summary;
--
--   -- 5. Remover MVs
--   DROP MATERIALIZED VIEW IF EXISTS mv_spike_detection;
--   DROP MATERIALIZED VIEW IF EXISTS mv_traffic_summary;
--   DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_metrics;
--
--   -- 6. Remover tabela spike_alerts
--   DROP TABLE IF EXISTS spike_alerts;
--
--   -- 7. Restaurar MVs do BD-2.5 (re-executar 20260220220000)
-- ============================================================
