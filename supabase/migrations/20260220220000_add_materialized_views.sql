-- ============================================================
-- BD-2.5: Add Materialized Views for Dashboard Performance
-- Sprint 2 | EPIC-BD Brownfield Debt
--
-- Objetivo: Pre-calcular agregacoes pesadas (COUNT, SUM, MAX)
-- sobre 87k+ registros de trafego para sub-100ms no dashboard.
--
-- Views criadas:
--   1. mv_offer_traffic_summary  - stats de trafego por oferta
--   2. mv_dashboard_stats        - contadores por workspace
--
-- Refresh: pg_cron a cada 15 minutos (CONCURRENT - nao bloqueia leitura)
-- ============================================================

-- ============================================================
-- VIEW 1: Traffic Summary por Oferta
-- Usado por: SpyRadar, SpyOfferDetail (tab Trafego)
-- ============================================================

DROP MATERIALIZED VIEW IF EXISTS mv_offer_traffic_summary;

CREATE MATERIALIZED VIEW mv_offer_traffic_summary AS
SELECT
  spied_offer_id,
  COUNT(DISTINCT domain)                                        AS domain_count,
  SUM(visits)                                                   AS total_visits,
  MAX(period_date)                                              AS latest_period,
  MIN(period_date)                                              AS earliest_period,
  MAX(CASE WHEN period_type = 'monthly_sw' THEN visits END)    AS latest_sw_visits,
  MAX(CASE WHEN period_type = 'monthly'    THEN visits END)    AS latest_sr_visits,
  AVG(visits)                                                   AS avg_monthly_visits
FROM offer_traffic_data
GROUP BY spied_offer_id;

-- Unique index obrigatorio para REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_traffic_summary_offer
  ON mv_offer_traffic_summary(spied_offer_id);

-- ============================================================
-- VIEW 2: Dashboard Stats por Workspace
-- Usado por: Dashboard (substituindo COUNT queries ao vivo)
-- ============================================================

DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_stats;

CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT
  workspace_id,
  COUNT(*)                                                      AS total_offers,
  COUNT(DISTINCT main_domain)                                   AS unique_domains,
  SUM(CASE WHEN status = 'ativa'      THEN 1 ELSE 0 END)      AS active_offers,
  SUM(CASE WHEN status = 'potencial'  THEN 1 ELSE 0 END)      AS potential_offers,
  MAX(updated_at)                                               AS last_updated
FROM spied_offers
GROUP BY workspace_id;

-- Unique index obrigatorio para REFRESH CONCURRENTLY
CREATE UNIQUE INDEX idx_mv_dashboard_stats_ws
  ON mv_dashboard_stats(workspace_id);

-- ============================================================
-- GRANTS: Permitir consulta para usuarios autenticados
-- NOTE: RLS nao e suportado em materialized views no PostgreSQL.
-- Acesso controlado via SECURITY DEFINER RPCs (Phase 3+).
-- ============================================================

GRANT SELECT ON mv_offer_traffic_summary TO authenticated;
GRANT SELECT ON mv_dashboard_stats       TO authenticated;

-- ============================================================
-- INITIAL REFRESH: Popular as views apos criacao
-- ============================================================

REFRESH MATERIALIZED VIEW mv_offer_traffic_summary;
REFRESH MATERIALIZED VIEW mv_dashboard_stats;

-- ============================================================
-- REFRESH AUTOMATICO: pg_cron a cada 15 minutos
-- CONCURRENT = nao bloqueia leituras durante o refresh
--
-- Requer extensao pg_cron habilitada no Supabase Dashboard:
--   Database > Extensions > pg_cron (enable)
--
-- Se pg_cron nao estiver disponivel, usar Edge Function:
--   supabase/functions/refresh-materialized-views/
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Refresh traffic summary a cada 15 minutos
    PERFORM cron.schedule(
      'refresh-mv-traffic-summary',
      '*/15 * * * *',
      'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_offer_traffic_summary'
    );

    -- Refresh dashboard stats a cada 15 minutos (offset 2min para nao coincidir)
    PERFORM cron.schedule(
      'refresh-mv-dashboard-stats',
      '2,17,32,47 * * * *',
      'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_stats'
    );

    RAISE NOTICE 'pg_cron jobs registrados para refresh das materialized views.';
  ELSE
    RAISE NOTICE 'pg_cron nao disponivel. Configure Edge Function para refresh automatico.';
  END IF;
END $$;

-- ============================================================
-- COMENTARIOS DE CONTEXTO
-- ============================================================

COMMENT ON MATERIALIZED VIEW mv_offer_traffic_summary IS
  'Pre-calcula stats de trafego por oferta. Refresh: 15min via pg_cron. BD-2.5 (2026-02-20).';

COMMENT ON MATERIALIZED VIEW mv_dashboard_stats IS
  'Pre-calcula contadores de ofertas por workspace. Refresh: 15min via pg_cron. BD-2.5 (2026-02-20).';

-- ============================================================
-- DOWN MIGRATION (referencia para rollback manual)
-- ============================================================
-- Para reverter esta migration:
--
--   SELECT cron.unschedule('refresh-mv-traffic-summary');
--   SELECT cron.unschedule('refresh-mv-dashboard-stats');
--   DROP MATERIALIZED VIEW IF EXISTS mv_offer_traffic_summary;
--   DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_stats;
-- ============================================================
