-- ================================================================
-- DR OPS - Deploy das 5 Migrations Pendentes
-- Executar no SQL Editor: supabase.com/dashboard/project/iaffbkzmckgvrfmlybsr/sql/new
--
-- INSTRUCOES: Execute CADA BLOCO separadamente (um de cada vez)
-- Copie do BEGIN ao COMMIT de cada migration e execute.
-- Se der erro, NAO prossiga para o proximo bloco.
-- ================================================================


-- ================================================================
-- MIGRATION 1/5: Add screenshot_url to spied_offers
-- Story: BD-2.1 prep
-- Risco: ZERO (IF NOT EXISTS)
-- ================================================================

ALTER TABLE spied_offers
  ADD COLUMN IF NOT EXISTS screenshot_url TEXT;


-- ================================================================
-- MIGRATION 2/5: Fix Storage RLS + Legacy Table RLS (BD-0.1)
-- Fixa policies permissivas demais no storage
-- Adiciona RLS nas 6 tabelas legacy sem policies
-- Risco: BAIXO (DROP IF EXISTS + CREATE)
-- ================================================================

-- Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload creatives" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- Drop previous workspace-scoped policies (idempotent)
DROP POLICY IF EXISTS "Users can upload spy assets to own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can read spy assets from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can update spy assets in own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete spy assets from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload creatives to own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can read creatives from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can update creatives in own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete creatives from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents to own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can read documents from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can update documents in own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents from own workspace" ON storage.objects;

-- SPY-ASSETS BUCKET
CREATE POLICY "Users can upload spy assets to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read spy assets from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update spy assets in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete spy assets from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

-- CREATIVES BUCKET
CREATE POLICY "Users can upload creatives to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read creatives from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update creatives in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete creatives from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

-- DOCUMENTS BUCKET
CREATE POLICY "Users can upload documents to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read documents from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
  )
);

-- LEGACY TABLE RLS: arsenal_dorks
ALTER TABLE arsenal_dorks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view arsenal_dorks from own workspace" ON arsenal_dorks;
DROP POLICY IF EXISTS "Users can insert arsenal_dorks in own workspace" ON arsenal_dorks;
DROP POLICY IF EXISTS "Users can update arsenal_dorks in own workspace" ON arsenal_dorks;
DROP POLICY IF EXISTS "Users can delete arsenal_dorks in own workspace" ON arsenal_dorks;

CREATE POLICY "Users can view arsenal_dorks from own workspace"
ON arsenal_dorks FOR SELECT TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert arsenal_dorks in own workspace"
ON arsenal_dorks FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update arsenal_dorks in own workspace"
ON arsenal_dorks FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete arsenal_dorks in own workspace"
ON arsenal_dorks FOR DELETE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

-- LEGACY TABLE RLS: arsenal_footprints
ALTER TABLE arsenal_footprints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view arsenal_footprints from own workspace" ON arsenal_footprints;
DROP POLICY IF EXISTS "Users can insert arsenal_footprints in own workspace" ON arsenal_footprints;
DROP POLICY IF EXISTS "Users can update arsenal_footprints in own workspace" ON arsenal_footprints;
DROP POLICY IF EXISTS "Users can delete arsenal_footprints in own workspace" ON arsenal_footprints;

CREATE POLICY "Users can view arsenal_footprints from own workspace"
ON arsenal_footprints FOR SELECT TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert arsenal_footprints in own workspace"
ON arsenal_footprints FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update arsenal_footprints in own workspace"
ON arsenal_footprints FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete arsenal_footprints in own workspace"
ON arsenal_footprints FOR DELETE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

-- LEGACY TABLE RLS: arsenal_keywords
ALTER TABLE arsenal_keywords ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view arsenal_keywords from own workspace" ON arsenal_keywords;
DROP POLICY IF EXISTS "Users can insert arsenal_keywords in own workspace" ON arsenal_keywords;
DROP POLICY IF EXISTS "Users can update arsenal_keywords in own workspace" ON arsenal_keywords;
DROP POLICY IF EXISTS "Users can delete arsenal_keywords in own workspace" ON arsenal_keywords;

CREATE POLICY "Users can view arsenal_keywords from own workspace"
ON arsenal_keywords FOR SELECT TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert arsenal_keywords in own workspace"
ON arsenal_keywords FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update arsenal_keywords in own workspace"
ON arsenal_keywords FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete arsenal_keywords in own workspace"
ON arsenal_keywords FOR DELETE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

-- LEGACY TABLE RLS: comparacao_batches
ALTER TABLE comparacao_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view comparacao_batches from own workspace" ON comparacao_batches;
DROP POLICY IF EXISTS "Users can insert comparacao_batches in own workspace" ON comparacao_batches;
DROP POLICY IF EXISTS "Users can update comparacao_batches in own workspace" ON comparacao_batches;
DROP POLICY IF EXISTS "Users can delete comparacao_batches in own workspace" ON comparacao_batches;

CREATE POLICY "Users can view comparacao_batches from own workspace"
ON comparacao_batches FOR SELECT TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert comparacao_batches in own workspace"
ON comparacao_batches FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update comparacao_batches in own workspace"
ON comparacao_batches FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete comparacao_batches in own workspace"
ON comparacao_batches FOR DELETE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

-- LEGACY TABLE RLS: import_batches
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view import_batches from own workspace" ON import_batches;
DROP POLICY IF EXISTS "Users can insert import_batches in own workspace" ON import_batches;
DROP POLICY IF EXISTS "Users can delete import_batches in own workspace" ON import_batches;

CREATE POLICY "Users can view import_batches from own workspace"
ON import_batches FOR SELECT TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert import_batches in own workspace"
ON import_batches FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete import_batches from own workspace"
ON import_batches FOR DELETE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

-- LEGACY TABLE RLS: trafego_historico
ALTER TABLE trafego_historico ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view trafego_historico from own workspace" ON trafego_historico;
DROP POLICY IF EXISTS "Users can insert trafego_historico in own workspace" ON trafego_historico;
DROP POLICY IF EXISTS "Users can update trafego_historico in own workspace" ON trafego_historico;
DROP POLICY IF EXISTS "Users can delete trafego_historico in own workspace" ON trafego_historico;

CREATE POLICY "Users can view trafego_historico from own workspace"
ON trafego_historico FOR SELECT TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert trafego_historico in own workspace"
ON trafego_historico FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can update trafego_historico in own workspace"
ON trafego_historico FOR UPDATE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));

CREATE POLICY "Users can delete trafego_historico from own workspace"
ON trafego_historico FOR DELETE TO authenticated
USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));


-- ================================================================
-- MIGRATION 3/5: Add Critical Database Indexes (BD-0.2)
-- Performance: 10-100x faster queries no radar e dashboard
-- Risco: ZERO (IF NOT EXISTS)
-- ================================================================

CREATE INDEX IF NOT EXISTS idx_offer_traffic_spied_offer
  ON offer_traffic_data(spied_offer_id);

CREATE INDEX IF NOT EXISTS idx_offer_traffic_composite
  ON offer_traffic_data(spied_offer_id, period_date DESC, source);

CREATE INDEX IF NOT EXISTS idx_spied_offers_status_vertical
  ON spied_offers(status, vertical, workspace_id);

CREATE INDEX IF NOT EXISTS idx_spied_offers_discovery_gin
  ON spied_offers USING GIN (to_tsvector('portuguese', COALESCE(discovery_query, '')));

CREATE INDEX IF NOT EXISTS idx_offer_domains_workspace
  ON offer_domains(workspace_id);

CREATE INDEX IF NOT EXISTS idx_offer_funnel_domain
  ON offer_funnel_steps(domain_id);

CREATE INDEX IF NOT EXISTS idx_ad_creatives_sources
  ON ad_creatives(competitor_id, spied_offer_id, library_id);


-- ================================================================
-- MIGRATION 4/5: Deprecate Legacy Tables (BD-2.4)
-- Backup + migra dados + DROP 5 tabelas legacy
-- Risco: MEDIO (destrutivo mas com backup)
-- IMPORTANTE: Verificar que migration 2 rodou antes desta
-- ================================================================

-- STEP 1: BACKUP
CREATE TABLE IF NOT EXISTS _backup_ad_bibliotecas AS SELECT * FROM ad_bibliotecas;
CREATE TABLE IF NOT EXISTS _backup_oferta_dominios AS SELECT * FROM oferta_dominios;
CREATE TABLE IF NOT EXISTS _backup_funil_paginas AS SELECT * FROM funil_paginas;
CREATE TABLE IF NOT EXISTS _backup_fontes_captura AS SELECT * FROM fontes_captura;
CREATE TABLE IF NOT EXISTS _backup_trafego_historico AS SELECT * FROM trafego_historico;

-- STEP 2: Add page_url to offer_ad_libraries
ALTER TABLE offer_ad_libraries ADD COLUMN IF NOT EXISTS page_url TEXT;

-- STEP 3: Add whois/hosting fields to offer_domains
ALTER TABLE offer_domains
  ADD COLUMN IF NOT EXISTS whois_registrar TEXT,
  ADD COLUMN IF NOT EXISTS whois_expiry DATE,
  ADD COLUMN IF NOT EXISTS hosting_provider TEXT,
  ADD COLUMN IF NOT EXISTS ip_address TEXT;

-- STEP 4: Migrate ad_bibliotecas data
UPDATE offer_ad_libraries oal
SET page_url = ab.pagina_url
FROM ad_bibliotecas ab
WHERE ab.pagina_url IS NOT NULL
  AND ab.pagina_url != ''
  AND (oal.library_url = ab.biblioteca_url OR oal.page_name = ab.pagina_nome);

-- STEP 5: Migrate oferta_dominios data
UPDATE offer_domains od
SET
  whois_registrar  = COALESCE(od.whois_registrar,  odo.whois_registrant),
  whois_expiry     = COALESCE(od.whois_expiry,      odo.whois_expira_em::DATE),
  hosting_provider = COALESCE(od.hosting_provider,  odo.hosting_provider),
  ip_address       = COALESCE(od.ip_address,        odo.ip_address)
FROM oferta_dominios odo
WHERE od.domain = odo.dominio
  AND (
    odo.whois_registrant IS NOT NULL
    OR odo.whois_expira_em IS NOT NULL
    OR odo.hosting_provider IS NOT NULL
    OR odo.ip_address IS NOT NULL
  );

-- STEP 6: DROP legacy tables
DROP TABLE IF EXISTS ad_bibliotecas CASCADE;
DROP TABLE IF EXISTS oferta_dominios CASCADE;
DROP TABLE IF EXISTS funil_paginas CASCADE;
DROP TABLE IF EXISTS fontes_captura CASCADE;
DROP TABLE IF EXISTS trafego_historico CASCADE;

-- STEP 7: Comments on backups
COMMENT ON TABLE _backup_ad_bibliotecas IS 'Backup de ad_bibliotecas antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
COMMENT ON TABLE _backup_oferta_dominios IS 'Backup de oferta_dominios antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
COMMENT ON TABLE _backup_funil_paginas IS 'Backup de funil_paginas antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
COMMENT ON TABLE _backup_fontes_captura IS 'Backup de fontes_captura antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
COMMENT ON TABLE _backup_trafego_historico IS 'Backup de trafego_historico antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';


-- ================================================================
-- MIGRATION 5/5: Materialized Views (BD-2.5)
-- Dashboard performance: sub-100ms queries
-- Risco: BAIXO (DROP IF EXISTS + CREATE)
-- REQUER: pg_cron extension habilitada (opcional, fallback manual)
-- ================================================================

DROP MATERIALIZED VIEW IF EXISTS mv_offer_traffic_summary;

CREATE MATERIALIZED VIEW mv_offer_traffic_summary AS
SELECT
  spied_offer_id,
  COUNT(DISTINCT domain) AS domain_count,
  SUM(visits) AS total_visits,
  MAX(period_date) AS latest_period,
  MIN(period_date) AS earliest_period,
  MAX(CASE WHEN period_type = 'monthly_sw' THEN visits END) AS latest_sw_visits,
  MAX(CASE WHEN period_type = 'monthly' THEN visits END) AS latest_sr_visits,
  AVG(visits) AS avg_monthly_visits
FROM offer_traffic_data
GROUP BY spied_offer_id;

CREATE UNIQUE INDEX idx_mv_traffic_summary_offer
  ON mv_offer_traffic_summary(spied_offer_id);

DROP MATERIALIZED VIEW IF EXISTS mv_dashboard_stats;

CREATE MATERIALIZED VIEW mv_dashboard_stats AS
SELECT
  workspace_id,
  COUNT(*) AS total_offers,
  COUNT(DISTINCT main_domain) AS unique_domains,
  SUM(CASE WHEN status = 'ativa' THEN 1 ELSE 0 END) AS active_offers,
  SUM(CASE WHEN status = 'potencial' THEN 1 ELSE 0 END) AS potential_offers,
  MAX(updated_at) AS last_updated
FROM spied_offers
GROUP BY workspace_id;

CREATE UNIQUE INDEX idx_mv_dashboard_stats_ws
  ON mv_dashboard_stats(workspace_id);

-- RLS on materialized views
ALTER TABLE mv_offer_traffic_summary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members view traffic summaries"
  ON mv_offer_traffic_summary FOR SELECT
  USING (
    spied_offer_id IN (
      SELECT id FROM spied_offers
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
      )
    )
  );

ALTER TABLE mv_dashboard_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workspace members view dashboard stats"
  ON mv_dashboard_stats FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

-- Grants
GRANT SELECT ON mv_offer_traffic_summary TO authenticated;
GRANT SELECT ON mv_dashboard_stats TO authenticated;

-- Initial refresh
REFRESH MATERIALIZED VIEW mv_offer_traffic_summary;
REFRESH MATERIALIZED VIEW mv_dashboard_stats;

-- pg_cron auto-refresh (optional - only if extension is enabled)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'refresh-mv-traffic-summary',
      '*/15 * * * *',
      'REFRESH MATERIALIZED VIEW CONCURRENTLY mv_offer_traffic_summary'
    );
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

COMMENT ON MATERIALIZED VIEW mv_offer_traffic_summary IS
  'Pre-calcula stats de trafego por oferta. Refresh: 15min via pg_cron. BD-2.5 (2026-02-20).';

COMMENT ON MATERIALIZED VIEW mv_dashboard_stats IS
  'Pre-calcula contadores de ofertas por workspace. Refresh: 15min via pg_cron. BD-2.5 (2026-02-20).';
