ALTER TABLE spied_offers
  ADD COLUMN IF NOT EXISTS screenshot_url TEXT;
-- BD-0.1: Fix Storage RLS Policies + Add RLS to Legacy Tables
-- Date: 2026-02-20
-- Fix overly permissive storage policies from migration 20260209004023
-- Restore workspace-scoped isolation for spy-assets, creatives, documents
-- Also adds RLS to 6 legacy tables missing policies

-- ============================================
-- STORAGE BUCKET POLICIES - Restore Workspace Scoping
-- ============================================

-- Drop overly permissive policies (from 20260209004023)
DROP POLICY IF EXISTS "Authenticated users can upload spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload creatives" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- Drop any previous workspace-scoped policies (idempotent re-run)
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

-- ============================================
-- SPY-ASSETS BUCKET - Workspace-Scoped
-- Convention: {workspace_id}/{rest_of_path}
-- ============================================

CREATE POLICY "Users can upload spy assets to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read spy assets from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update spy assets in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete spy assets from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- CREATIVES BUCKET - Workspace-Scoped
-- ============================================

CREATE POLICY "Users can upload creatives to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read creatives from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update creatives in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete creatives from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- DOCUMENTS BUCKET - Workspace-Scoped
-- ============================================

CREATE POLICY "Users can upload documents to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read documents from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- LEGACY TABLE RLS - Add Missing Policies
-- Only applies if tables exist (they may not exist in remote)
-- ============================================

-- arsenal_dorks (conditional)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'arsenal_dorks') THEN
    ALTER TABLE arsenal_dorks ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view arsenal_dorks from own workspace" ON arsenal_dorks;
    DROP POLICY IF EXISTS "Users can insert arsenal_dorks in own workspace" ON arsenal_dorks;
    DROP POLICY IF EXISTS "Users can update arsenal_dorks in own workspace" ON arsenal_dorks;
    DROP POLICY IF EXISTS "Users can delete arsenal_dorks in own workspace" ON arsenal_dorks;
    CREATE POLICY "Users can view arsenal_dorks from own workspace" ON arsenal_dorks FOR SELECT TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can insert arsenal_dorks in own workspace" ON arsenal_dorks FOR INSERT TO authenticated WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can update arsenal_dorks in own workspace" ON arsenal_dorks FOR UPDATE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can delete arsenal_dorks in own workspace" ON arsenal_dorks FOR DELETE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
  END IF;
END $$;

-- arsenal_footprints (conditional)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'arsenal_footprints') THEN
    ALTER TABLE arsenal_footprints ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view arsenal_footprints from own workspace" ON arsenal_footprints;
    DROP POLICY IF EXISTS "Users can insert arsenal_footprints in own workspace" ON arsenal_footprints;
    DROP POLICY IF EXISTS "Users can update arsenal_footprints in own workspace" ON arsenal_footprints;
    DROP POLICY IF EXISTS "Users can delete arsenal_footprints in own workspace" ON arsenal_footprints;
    CREATE POLICY "Users can view arsenal_footprints from own workspace" ON arsenal_footprints FOR SELECT TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can insert arsenal_footprints in own workspace" ON arsenal_footprints FOR INSERT TO authenticated WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can update arsenal_footprints in own workspace" ON arsenal_footprints FOR UPDATE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can delete arsenal_footprints in own workspace" ON arsenal_footprints FOR DELETE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
  END IF;
END $$;

-- arsenal_keywords (conditional)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'arsenal_keywords') THEN
    ALTER TABLE arsenal_keywords ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view arsenal_keywords from own workspace" ON arsenal_keywords;
    DROP POLICY IF EXISTS "Users can insert arsenal_keywords in own workspace" ON arsenal_keywords;
    DROP POLICY IF EXISTS "Users can update arsenal_keywords in own workspace" ON arsenal_keywords;
    DROP POLICY IF EXISTS "Users can delete arsenal_keywords in own workspace" ON arsenal_keywords;
    CREATE POLICY "Users can view arsenal_keywords from own workspace" ON arsenal_keywords FOR SELECT TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can insert arsenal_keywords in own workspace" ON arsenal_keywords FOR INSERT TO authenticated WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can update arsenal_keywords in own workspace" ON arsenal_keywords FOR UPDATE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can delete arsenal_keywords in own workspace" ON arsenal_keywords FOR DELETE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
  END IF;
END $$;

-- comparacao_batches (conditional)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'comparacao_batches') THEN
    ALTER TABLE comparacao_batches ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view comparacao_batches from own workspace" ON comparacao_batches;
    DROP POLICY IF EXISTS "Users can insert comparacao_batches in own workspace" ON comparacao_batches;
    DROP POLICY IF EXISTS "Users can update comparacao_batches in own workspace" ON comparacao_batches;
    DROP POLICY IF EXISTS "Users can delete comparacao_batches in own workspace" ON comparacao_batches;
    CREATE POLICY "Users can view comparacao_batches from own workspace" ON comparacao_batches FOR SELECT TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can insert comparacao_batches in own workspace" ON comparacao_batches FOR INSERT TO authenticated WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can update comparacao_batches in own workspace" ON comparacao_batches FOR UPDATE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can delete comparacao_batches in own workspace" ON comparacao_batches FOR DELETE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
  END IF;
END $$;

-- import_batches (conditional)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'import_batches') THEN
    ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view import_batches from own workspace" ON import_batches;
    DROP POLICY IF EXISTS "Users can insert import_batches in own workspace" ON import_batches;
    DROP POLICY IF EXISTS "Users can delete import_batches in own workspace" ON import_batches;
    CREATE POLICY "Users can view import_batches from own workspace" ON import_batches FOR SELECT TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can insert import_batches in own workspace" ON import_batches FOR INSERT TO authenticated WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can delete import_batches in own workspace" ON import_batches FOR DELETE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
  END IF;
END $$;

-- trafego_historico (conditional)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trafego_historico') THEN
    ALTER TABLE trafego_historico ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Users can view trafego_historico from own workspace" ON trafego_historico;
    DROP POLICY IF EXISTS "Users can insert trafego_historico in own workspace" ON trafego_historico;
    DROP POLICY IF EXISTS "Users can update trafego_historico in own workspace" ON trafego_historico;
    DROP POLICY IF EXISTS "Users can delete trafego_historico in own workspace" ON trafego_historico;
    CREATE POLICY "Users can view trafego_historico from own workspace" ON trafego_historico FOR SELECT TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can insert trafego_historico in own workspace" ON trafego_historico FOR INSERT TO authenticated WITH CHECK (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can update trafego_historico in own workspace" ON trafego_historico FOR UPDATE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
    CREATE POLICY "Users can delete trafego_historico in own workspace" ON trafego_historico FOR DELETE TO authenticated USING (workspace_id IN (SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()));
  END IF;
END $$;
-- BD-0.2: Add Critical Database Indexes
-- Date: 2026-02-20
-- Performance optimization for 87k+ traffic records and 12k+ spied offers
-- Expected impact: 10-100x faster queries on radar and dashboard

-- ============================================
-- offer_traffic_data - CRITICAL INDEXES
-- ============================================

-- FK index MISSING - improves cascading deletes and lookups
CREATE INDEX IF NOT EXISTS idx_offer_traffic_spied_offer
  ON offer_traffic_data(spied_offer_id);

-- Composite index for most common queries (offer + period range + source)
-- Used by: radar queries, traffic intelligence, dashboard aggregations
CREATE INDEX IF NOT EXISTS idx_offer_traffic_composite
  ON offer_traffic_data(spied_offer_id, period_date DESC, source);

-- ============================================
-- spied_offers - FILTER OPTIMIZATION
-- ============================================

-- Status + vertical combo is the most common filter pair in radar
CREATE INDEX IF NOT EXISTS idx_spied_offers_status_vertical
  ON spied_offers(status, vertical, workspace_id);

-- Full-text search on discovery_query (Portuguese support)
-- Used for searching by keywords/footprints
CREATE INDEX IF NOT EXISTS idx_spied_offers_discovery_gin
  ON spied_offers USING GIN (to_tsvector('portuguese', COALESCE(discovery_query, '')));

-- ============================================
-- offer_domains - WORKSPACE ISOLATION
-- ============================================

-- Missing workspace index for filtered queries
CREATE INDEX IF NOT EXISTS idx_offer_domains_workspace
  ON offer_domains(workspace_id);

-- ============================================
-- offer_funnel_steps - NEW COLUMN INDEX
-- ============================================

-- domain_id FK added in schema - needs index
CREATE INDEX IF NOT EXISTS idx_offer_funnel_domain
  ON offer_funnel_steps(domain_id);

-- ============================================
-- ad_creatives - MULTI-SOURCE INDEXING
-- ============================================

-- Supports querying by competitor OR spied_offer OR library source
CREATE INDEX IF NOT EXISTS idx_ad_creatives_sources
  ON ad_creatives(competitor_id, spied_offer_id, library_id);
-- ============================================================
-- BD-2.4: Deprecate Legacy Database Tables
-- Sprint 2 | EPIC-BD Brownfield Debt
--
-- Estrategia:
--   1. Backup dados legacy em tabelas _backup (IF EXISTS)
--   2. Adicionar campos uteis nas tabelas modernas
--   3. Migrar dados das tabelas legacy para modernas (IF EXISTS)
--   4. DROP das tabelas legacy (IF EXISTS — safe)
--
-- DOWN: Restaurar tabelas legacy dos backups
-- ============================================================

-- ============================================================
-- STEP 1: BACKUP das tabelas legacy antes de qualquer DROP
-- (Condicional — tabelas podem nao existir no remote)
-- ============================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ad_bibliotecas') THEN
    CREATE TABLE IF NOT EXISTS _backup_ad_bibliotecas AS SELECT * FROM ad_bibliotecas;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'oferta_dominios') THEN
    CREATE TABLE IF NOT EXISTS _backup_oferta_dominios AS SELECT * FROM oferta_dominios;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'funil_paginas') THEN
    CREATE TABLE IF NOT EXISTS _backup_funil_paginas AS SELECT * FROM funil_paginas;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'fontes_captura') THEN
    CREATE TABLE IF NOT EXISTS _backup_fontes_captura AS SELECT * FROM fontes_captura;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'trafego_historico') THEN
    CREATE TABLE IF NOT EXISTS _backup_trafego_historico AS SELECT * FROM trafego_historico;
  END IF;
END $$;

-- ============================================================
-- STEP 2: Adicionar campos uteis em offer_ad_libraries
-- (pagina_url nao existe; page_name ja existe)
-- ============================================================

ALTER TABLE offer_ad_libraries
  ADD COLUMN IF NOT EXISTS page_url TEXT;

-- ============================================================
-- STEP 3: Adicionar campos uteis em offer_domains
-- (whois_registrar, whois_expiry, hosting_provider, ip_address)
-- ============================================================

ALTER TABLE offer_domains
  ADD COLUMN IF NOT EXISTS whois_registrar TEXT,
  ADD COLUMN IF NOT EXISTS whois_expiry    DATE,
  ADD COLUMN IF NOT EXISTS hosting_provider TEXT,
  ADD COLUMN IF NOT EXISTS ip_address      TEXT;

-- ============================================================
-- STEP 4: Migrar dados de ad_bibliotecas → offer_ad_libraries
-- (Condicional — tabela pode nao existir)
-- ============================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ad_bibliotecas') THEN
    UPDATE offer_ad_libraries oal
    SET    page_url = ab.pagina_url
    FROM   ad_bibliotecas ab
    WHERE  ab.pagina_url IS NOT NULL
      AND  ab.pagina_url != ''
      AND  (
        oal.library_url = ab.biblioteca_url
        OR oal.page_name = ab.pagina_nome
      );
  END IF;
END $$;

-- ============================================================
-- STEP 5: Migrar dados de oferta_dominios → offer_domains
-- (Condicional — tabela pode nao existir)
-- ============================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'oferta_dominios') THEN
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
  END IF;
END $$;

-- ============================================================
-- STEP 6: DROP tabelas legacy
-- (dados salvos nos backups acima — DROP IF EXISTS e seguro)
-- ============================================================

DROP TABLE IF EXISTS ad_bibliotecas CASCADE;
DROP TABLE IF EXISTS oferta_dominios CASCADE;
DROP TABLE IF EXISTS funil_paginas CASCADE;
DROP TABLE IF EXISTS fontes_captura CASCADE;
DROP TABLE IF EXISTS trafego_historico CASCADE;

-- ============================================================
-- STEP 7: Comentarios de contexto nos backups (condicional)
-- ============================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_backup_ad_bibliotecas') THEN
    COMMENT ON TABLE _backup_ad_bibliotecas IS 'Backup de ad_bibliotecas antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_backup_oferta_dominios') THEN
    COMMENT ON TABLE _backup_oferta_dominios IS 'Backup de oferta_dominios antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_backup_funil_paginas') THEN
    COMMENT ON TABLE _backup_funil_paginas IS 'Backup de funil_paginas antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_backup_fontes_captura') THEN
    COMMENT ON TABLE _backup_fontes_captura IS 'Backup de fontes_captura antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '_backup_trafego_historico') THEN
    COMMENT ON TABLE _backup_trafego_historico IS 'Backup de trafego_historico antes da deprecacao BD-2.4 (2026-02-20). Pode ser removido apos 30 dias.';
  END IF;
END $$;

-- ============================================================
-- DOWN MIGRATION (referencia para rollback manual)
-- ============================================================
-- Para reverter esta migration:
--
-- 1. Recriar tabelas originais a partir dos backups:
--    CREATE TABLE ad_bibliotecas AS SELECT * FROM _backup_ad_bibliotecas;
--    CREATE TABLE oferta_dominios AS SELECT * FROM _backup_oferta_dominios;
--    CREATE TABLE funil_paginas AS SELECT * FROM _backup_funil_paginas;
--    CREATE TABLE fontes_captura AS SELECT * FROM _backup_fontes_captura;
--    CREATE TABLE trafego_historico AS SELECT * FROM _backup_trafego_historico;
--
-- 2. Remover colunas adicionadas:
--    ALTER TABLE offer_ad_libraries DROP COLUMN IF EXISTS page_url;
--    ALTER TABLE offer_domains DROP COLUMN IF EXISTS whois_registrar;
--    ALTER TABLE offer_domains DROP COLUMN IF EXISTS whois_expiry;
--    ALTER TABLE offer_domains DROP COLUMN IF EXISTS hosting_provider;
--    ALTER TABLE offer_domains DROP COLUMN IF EXISTS ip_address;
--
-- 3. Remover backups (opcional apos validacao):
--    DROP TABLE _backup_ad_bibliotecas;
--    DROP TABLE _backup_oferta_dominios;
--    DROP TABLE _backup_funil_paginas;
--    DROP TABLE _backup_fontes_captura;
--    DROP TABLE _backup_trafego_historico;
-- ============================================================
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
  SUM(visits::BIGINT)                                           AS total_visits,
  MAX(period_date)                                              AS latest_period,
  MIN(period_date)                                              AS earliest_period,
  MAX(CASE WHEN period_type = 'monthly_sw' THEN visits::BIGINT END) AS latest_sw_visits,
  MAX(CASE WHEN period_type = 'monthly'    THEN visits::BIGINT END) AS latest_sr_visits,
  AVG(visits::BIGINT)                                              AS avg_monthly_visits
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
    SUM(otd.visits::BIGINT)          AS total_visits,
    MAX(otd.visits::BIGINT)          AS peak_visits,
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
-- ============================================================
-- PHASE 5: SAVED VIEWS
-- Filtros salvos para SpyRadar e outros modulos
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  module TEXT NOT NULL DEFAULT 'spy'
    CHECK (module IN ('spy', 'offers', 'creatives', 'avatar')),

  -- Configuracao serializada
  filters JSONB DEFAULT '{}'::jsonb,
  sort_config JSONB DEFAULT '{}'::jsonb,
  visible_columns TEXT[] DEFAULT '{}',

  is_default BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_saved_views_workspace ON saved_views(workspace_id, module);

-- RLS
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their workspace saved views"
  ON saved_views
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_saved_views_updated_at
  BEFORE UPDATE ON saved_views
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Only one default per module per workspace
CREATE UNIQUE INDEX idx_saved_views_default
  ON saved_views(workspace_id, module)
  WHERE is_default = true;
-- ============================================================
-- FIX B1: Add UPDATE RLS policy on import_batches
-- Without this, useUpdateImportJob calls fail silently
-- (Conditional — import_batches may not exist in remote)
-- ============================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'import_batches') THEN
    CREATE POLICY "Users can update import_batches in their workspace"
      ON import_batches
      FOR UPDATE
      USING (
        workspace_id IN (
          SELECT wm.workspace_id FROM workspace_members wm
          WHERE wm.user_id = auth.uid()
        )
      )
      WITH CHECK (
        workspace_id IN (
          SELECT wm.workspace_id FROM workspace_members wm
          WHERE wm.user_id = auth.uid()
        )
      );
  END IF;
END $$;
-- Performance RPCs — Fase 1 (docs/performance-diagnostic.md)
-- Eliminates full-table scans from frontend by moving aggregation to database

-- ============================================
-- 1.3: Index on workspace_members for RLS
-- The is_workspace_member() function queries (user_id, workspace_id) on every row.
-- UNIQUE(workspace_id, user_id) exists but index order is (ws, user).
-- This composite covers the RLS lookup pattern: WHERE user_id = $1 AND workspace_id = $2
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workspace_members_user_ws
  ON public.workspace_members(user_id, workspace_id);

-- ============================================
-- 1.1: get_latest_traffic_per_offer
-- Replaces useLatestTrafficPerOffer() which loaded ALL 87k+ records client-side
-- Uses DISTINCT ON to return only the most recent traffic record per offer
-- ============================================
CREATE OR REPLACE FUNCTION public.get_latest_traffic_per_offer(
  p_workspace_id UUID,
  p_period_type VARCHAR DEFAULT 'monthly'
)
RETURNS TABLE(
  spied_offer_id UUID,
  visits INT,
  period_date DATE,
  source VARCHAR
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (t.spied_offer_id)
    t.spied_offer_id,
    t.visits,
    t.period_date,
    t.source
  FROM offer_traffic_data t
  WHERE t.workspace_id = p_workspace_id
    AND t.period_type = p_period_type
  ORDER BY t.spied_offer_id, t.period_date DESC;
$$;

-- ============================================
-- 1.2: get_spied_offers_paginated
-- Replaces useSpiedOffers() which loaded ALL 12k+ records in parallel batches
-- Server-side pagination with filters + relation counts via subquery
-- ============================================
CREATE OR REPLACE FUNCTION public.get_spied_offers_paginated(
  p_workspace_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_statuses TEXT[] DEFAULT NULL,
  p_exclude_statuses TEXT[] DEFAULT NULL,
  p_vertical TEXT DEFAULT NULL,
  p_discovery_source TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_sort_column TEXT DEFAULT 'updated_at',
  p_sort_direction TEXT DEFAULT 'desc'
)
RETURNS TABLE(
  id UUID,
  nome VARCHAR,
  main_domain VARCHAR,
  status VARCHAR,
  vertical VARCHAR,
  subnicho VARCHAR,
  geo VARCHAR,
  priority INT,
  discovery_source VARCHAR,
  discovered_at DATE,
  product_name VARCHAR,
  product_ticket DECIMAL,
  product_currency VARCHAR,
  product_promise TEXT,
  notas TEXT,
  screenshot_url TEXT,
  traffic_trend VARCHAR,
  estimated_monthly_traffic INT,
  estimated_monthly_revenue DECIMAL,
  operator_name VARCHAR,
  checkout_provider VARCHAR,
  vsl_player VARCHAR,
  discovery_query TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  domain_count BIGINT,
  ad_library_count BIGINT,
  funnel_step_count BIGINT,
  creative_count BIGINT,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total BIGINT;
BEGIN
  -- Get total count with filters (for pagination metadata)
  SELECT COUNT(*) INTO v_total
  FROM spied_offers so
  WHERE so.workspace_id = p_workspace_id
    AND (p_statuses IS NULL OR so.status = ANY(p_statuses))
    AND (p_exclude_statuses IS NULL OR so.status != ALL(p_exclude_statuses))
    AND (p_vertical IS NULL OR so.vertical = p_vertical)
    AND (p_discovery_source IS NULL OR so.discovery_source = p_discovery_source)
    AND (p_search IS NULL OR (
      so.nome ILIKE '%' || p_search || '%'
      OR so.main_domain ILIKE '%' || p_search || '%'
      OR so.product_name ILIKE '%' || p_search || '%'
    ));

  RETURN QUERY
  SELECT
    so.id,
    so.nome,
    so.main_domain,
    so.status,
    so.vertical,
    so.subnicho,
    so.geo,
    so.priority,
    so.discovery_source,
    so.discovered_at,
    so.product_name,
    so.product_ticket,
    so.product_currency,
    so.product_promise,
    so.notas,
    so.screenshot_url,
    so.traffic_trend,
    so.estimated_monthly_traffic,
    so.estimated_monthly_revenue,
    so.operator_name,
    so.checkout_provider,
    so.vsl_player,
    so.discovery_query,
    so.created_at,
    so.updated_at,
    (SELECT COUNT(*) FROM offer_domains od WHERE od.spied_offer_id = so.id) AS domain_count,
    (SELECT COUNT(*) FROM offer_ad_libraries oal WHERE oal.spied_offer_id = so.id) AS ad_library_count,
    (SELECT COUNT(*) FROM offer_funnel_steps ofs WHERE ofs.spied_offer_id = so.id) AS funnel_step_count,
    (SELECT COUNT(*) FROM ad_creatives ac WHERE ac.spied_offer_id = so.id) AS creative_count,
    v_total AS total_count
  FROM spied_offers so
  WHERE so.workspace_id = p_workspace_id
    AND (p_statuses IS NULL OR so.status = ANY(p_statuses))
    AND (p_exclude_statuses IS NULL OR so.status != ALL(p_exclude_statuses))
    AND (p_vertical IS NULL OR so.vertical = p_vertical)
    AND (p_discovery_source IS NULL OR so.discovery_source = p_discovery_source)
    AND (p_search IS NULL OR (
      so.nome ILIKE '%' || p_search || '%'
      OR so.main_domain ILIKE '%' || p_search || '%'
      OR so.product_name ILIKE '%' || p_search || '%'
    ))
  ORDER BY
    CASE WHEN p_sort_column = 'updated_at' AND p_sort_direction = 'desc' THEN so.updated_at END DESC NULLS LAST,
    CASE WHEN p_sort_column = 'updated_at' AND p_sort_direction = 'asc' THEN so.updated_at END ASC NULLS LAST,
    CASE WHEN p_sort_column = 'nome' AND p_sort_direction = 'asc' THEN so.nome END ASC NULLS LAST,
    CASE WHEN p_sort_column = 'nome' AND p_sort_direction = 'desc' THEN so.nome END DESC NULLS LAST,
    CASE WHEN p_sort_column = 'created_at' AND p_sort_direction = 'desc' THEN so.created_at END DESC NULLS LAST,
    CASE WHEN p_sort_column = 'created_at' AND p_sort_direction = 'asc' THEN so.created_at END ASC NULLS LAST,
    so.updated_at DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ============================================
-- 1.4: get_traffic_intel_summary
-- Replaces fetchAllTrafficRows which scanned 87k+ records for TrafficIntelligenceView
-- Uses mv_traffic_summary materialized view instead of raw table
-- ============================================
CREATE OR REPLACE FUNCTION public.get_traffic_intel_summary(
  p_workspace_id UUID,
  p_period_type VARCHAR DEFAULT 'monthly'
)
RETURNS TABLE(
  spied_offer_id UUID,
  total_visits BIGINT,
  peak_visits BIGINT,
  avg_visits BIGINT,
  latest_visits BIGINT,
  previous_visits BIGINT,
  data_points BIGINT,
  domain_count BIGINT,
  earliest_period DATE,
  latest_period DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ts.spied_offer_id,
    ts.total_visits,
    ts.peak_visits,
    ts.avg_visits,
    ts.latest_visits,
    ts.previous_visits,
    ts.data_points,
    ts.domain_count,
    ts.earliest_period,
    ts.latest_period
  FROM mv_traffic_summary ts
  WHERE ts.workspace_id = p_workspace_id
    AND ts.source = CASE
      WHEN p_period_type = 'monthly_sw' THEN 'similarweb'
      WHEN p_period_type = 'monthly' THEN 'semrush'
      ELSE p_period_type
    END;
$$;
-- =====================================================
-- DEDUPLICATION: spied_offers by main_domain
-- Consolida ofertas duplicadas e adiciona UNIQUE constraint
--
-- COMO EXECUTAR: Copie e cole no Supabase SQL Editor
-- Projeto: iaffbkzmckgvrfmlybsr (Lovable)
-- =====================================================

-- =====================================================
-- STEP 1: Mapear duplicatas → keeper (mais antigo por workspace+domain)
-- =====================================================
CREATE TEMP TABLE dedup_map AS
WITH ranked AS (
  SELECT
    id,
    workspace_id,
    main_domain,
    LOWER(TRIM(main_domain)) AS domain_normalized,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY workspace_id, LOWER(TRIM(main_domain))
      ORDER BY created_at ASC
    ) AS rn
  FROM spied_offers
  WHERE main_domain IS NOT NULL
    AND TRIM(main_domain) <> ''
)
SELECT
  r.id AS duplicate_id,
  k.id AS keeper_id,
  r.workspace_id,
  r.main_domain
FROM ranked r
JOIN ranked k
  ON k.workspace_id = r.workspace_id
  AND k.domain_normalized = r.domain_normalized
  AND k.rn = 1
WHERE r.rn > 1;

-- Preview: quantas duplicatas serão consolidadas
DO $$
DECLARE
  dup_count INT;
  domain_count INT;
BEGIN
  SELECT COUNT(*), COUNT(DISTINCT LOWER(main_domain))
  INTO dup_count, domain_count
  FROM dedup_map;

  RAISE NOTICE '>>> % ofertas duplicadas encontradas em % domínios', dup_count, domain_count;
END $$;

-- =====================================================
-- STEP 2: Mover offer_traffic_data
-- Quando keeper E duplicata têm dados para o mesmo
-- (domain, period_type, period_date), manter o MAIOR visits.
-- Trata NULLs em visits e period_type corretamente.
-- Trata 3+ duplicatas sem non-determinism.
-- =====================================================

-- 2a: Atualizar keeper com MAX(visits) de todas as duplicatas quando maior
UPDATE offer_traffic_data k
SET visits = best.max_visits
FROM (
  SELECT
    d.keeper_id,
    t.domain,
    t.period_type,
    t.period_date,
    MAX(t.visits) AS max_visits
  FROM offer_traffic_data t
  JOIN dedup_map d ON t.spied_offer_id = d.duplicate_id
  GROUP BY d.keeper_id, t.domain, t.period_type, t.period_date
) best
WHERE k.spied_offer_id = best.keeper_id
  AND k.domain = best.domain
  AND k.period_type IS NOT DISTINCT FROM best.period_type
  AND k.period_date = best.period_date
  AND COALESCE(best.max_visits, 0) > COALESCE(k.visits, 0);

-- 2b: Entre duplicatas com mesma chave (sem keeper), manter apenas o de maior visits
--     Previne UNIQUE violation quando múltiplas duplicatas compartilham mesma chave
--     e o keeper NÃO tem registro para essa chave.
DELETE FROM offer_traffic_data t
WHERE t.spied_offer_id IN (SELECT duplicate_id FROM dedup_map)
  AND t.id NOT IN (
    SELECT DISTINCT ON (d.keeper_id, sub.domain, sub.period_type, sub.period_date) sub.id
    FROM offer_traffic_data sub
    JOIN dedup_map d ON sub.spied_offer_id = d.duplicate_id
    ORDER BY d.keeper_id, sub.domain, sub.period_type, sub.period_date,
             COALESCE(sub.visits, 0) DESC, sub.created_at ASC
  );

-- 2c: Deletar registros de duplicatas que conflitam com o keeper
--     (keeper já tem o melhor valor após 2a)
DELETE FROM offer_traffic_data t
USING dedup_map d
WHERE t.spied_offer_id = d.duplicate_id
  AND EXISTS (
    SELECT 1 FROM offer_traffic_data k
    WHERE k.spied_offer_id = d.keeper_id
      AND k.domain = t.domain
      AND k.period_type IS NOT DISTINCT FROM t.period_type
      AND k.period_date = t.period_date
  );

-- 2d: Reatribuir registros restantes (sem conflito) ao keeper
UPDATE offer_traffic_data t
SET spied_offer_id = d.keeper_id
FROM dedup_map d
WHERE t.spied_offer_id = d.duplicate_id;

-- =====================================================
-- STEP 3: Mover spike_alerts (se tabela existir)
-- =====================================================
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'spike_alerts') THEN
    -- Deletar conflitantes
    EXECUTE '
      DELETE FROM spike_alerts s
      USING dedup_map d
      WHERE s.spied_offer_id = d.duplicate_id
        AND EXISTS (
          SELECT 1 FROM spike_alerts k
          WHERE k.spied_offer_id = d.keeper_id
            AND k.domain = s.domain
            AND k.period_date = s.period_date
            AND k.alert_type = s.alert_type
        )';
    -- Reatribuir restantes
    EXECUTE '
      UPDATE spike_alerts s
      SET spied_offer_id = d.keeper_id
      FROM dedup_map d
      WHERE s.spied_offer_id = d.duplicate_id';

    RAISE NOTICE '>>> spike_alerts migrados';
  ELSE
    RAISE NOTICE '>>> spike_alerts não existe, pulando';
  END IF;
END $$;

-- =====================================================
-- STEP 4: Mover offer_domains (sem unique constraint)
-- =====================================================
UPDATE offer_domains o
SET spied_offer_id = d.keeper_id
FROM dedup_map d
WHERE o.spied_offer_id = d.duplicate_id;

-- =====================================================
-- STEP 5: Mover offer_ad_libraries (sem unique constraint)
-- =====================================================
UPDATE offer_ad_libraries o
SET spied_offer_id = d.keeper_id
FROM dedup_map d
WHERE o.spied_offer_id = d.duplicate_id;

-- =====================================================
-- STEP 6: Mover offer_funnel_steps (sem unique constraint)
-- =====================================================
UPDATE offer_funnel_steps o
SET spied_offer_id = d.keeper_id
FROM dedup_map d
WHERE o.spied_offer_id = d.duplicate_id;

-- =====================================================
-- STEP 7: Mover ad_creatives (sem unique constraint)
-- =====================================================
UPDATE ad_creatives o
SET spied_offer_id = d.keeper_id
FROM dedup_map d
WHERE o.spied_offer_id = d.duplicate_id;

-- =====================================================
-- STEP 7.5: Verificação de segurança antes do DELETE
-- =====================================================
DO $$
DECLARE
  orphan_traffic INT;
  orphan_domains INT;
  orphan_libraries INT;
  orphan_funnels INT;
  orphan_creatives INT;
BEGIN
  SELECT COUNT(*) INTO orphan_traffic FROM offer_traffic_data WHERE spied_offer_id IN (SELECT duplicate_id FROM dedup_map);
  SELECT COUNT(*) INTO orphan_domains FROM offer_domains WHERE spied_offer_id IN (SELECT duplicate_id FROM dedup_map);
  SELECT COUNT(*) INTO orphan_libraries FROM offer_ad_libraries WHERE spied_offer_id IN (SELECT duplicate_id FROM dedup_map);
  SELECT COUNT(*) INTO orphan_funnels FROM offer_funnel_steps WHERE spied_offer_id IN (SELECT duplicate_id FROM dedup_map);
  SELECT COUNT(*) INTO orphan_creatives FROM ad_creatives WHERE spied_offer_id IN (SELECT duplicate_id FROM dedup_map);

  RAISE NOTICE '>>> Verificação pré-DELETE:';
  RAISE NOTICE '>>>   traffic_data ainda em duplicatas: %', orphan_traffic;
  RAISE NOTICE '>>>   domains ainda em duplicatas: %', orphan_domains;
  RAISE NOTICE '>>>   libraries ainda em duplicatas: %', orphan_libraries;
  RAISE NOTICE '>>>   funnels ainda em duplicatas: %', orphan_funnels;
  RAISE NOTICE '>>>   creatives ainda em duplicatas: %', orphan_creatives;

  IF orphan_traffic > 0 OR orphan_domains > 0 OR orphan_libraries > 0 OR orphan_funnels > 0 OR orphan_creatives > 0 THEN
    RAISE EXCEPTION '>>> ABORTANDO: % registros órfãos seriam perdidos via CASCADE. Investigue antes de prosseguir.',
      orphan_traffic + orphan_domains + orphan_libraries + orphan_funnels + orphan_creatives;
  END IF;
END $$;

-- =====================================================
-- STEP 8: Deletar ofertas duplicadas
-- =====================================================
DELETE FROM spied_offers s
USING dedup_map d
WHERE s.id = d.duplicate_id;

-- =====================================================
-- STEP 9: Normalizar main_domain para lowercase
-- Garante que .in() case-sensitive no app funcione
-- =====================================================
UPDATE spied_offers
SET main_domain = LOWER(TRIM(main_domain))
WHERE main_domain IS NOT NULL
  AND main_domain <> LOWER(TRIM(main_domain));

-- =====================================================
-- STEP 10: Adicionar UNIQUE constraint (case-insensitive)
-- Previne futuras duplicatas por workspace + domínio
-- =====================================================
CREATE UNIQUE INDEX IF NOT EXISTS idx_spied_offers_unique_domain
  ON spied_offers (workspace_id, LOWER(TRIM(main_domain)))
  WHERE main_domain IS NOT NULL AND TRIM(main_domain) <> '';

-- =====================================================
-- STEP 11: Resumo final
-- =====================================================
DO $$
DECLARE
  remaining_offers INT;
  remaining_traffic INT;
BEGIN
  SELECT COUNT(*) INTO remaining_offers FROM spied_offers;
  SELECT COUNT(*) INTO remaining_traffic FROM offer_traffic_data;

  RAISE NOTICE '>>> Deduplicação completa!';
  RAISE NOTICE '>>> Ofertas restantes: %', remaining_offers;
  RAISE NOTICE '>>> Registros de tráfego: %', remaining_traffic;
END $$;

DROP TABLE dedup_map;
-- ============================================
-- OPTIMIZATION: get_spied_offers_paginated RPC
-- Date: 2026-03-01
-- Author: @data-engineer (Dara) + Lovable review
-- ============================================

-- ============================================
-- PART 1: Full-text search vector on spied_offers
-- ============================================
ALTER TABLE public.spied_offers
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      COALESCE(nome, '') || ' ' ||
      COALESCE(main_domain, '') || ' ' ||
      COALESCE(product_name, '')
    )
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_spied_offers_search_vector
  ON public.spied_offers USING GIN (search_vector);

-- ============================================
-- PART 2: FK indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_offer_domains_spied_offer_id
  ON public.offer_domains(spied_offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_ad_libraries_spied_offer_id
  ON public.offer_ad_libraries(spied_offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_funnel_steps_spied_offer_id
  ON public.offer_funnel_steps(spied_offer_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_spied_offer_id
  ON public.ad_creatives(spied_offer_id);

-- ============================================
-- PART 3: Composite index workspace + updated_at
-- ============================================
CREATE INDEX IF NOT EXISTS idx_spied_offers_workspace_updated
  ON public.spied_offers(workspace_id, updated_at DESC NULLS LAST);

-- ============================================
-- PART 4: Optimized RPC
-- ============================================
-- FIXES vs versao anterior:
--   1. CTE usa GROUP BY em vez de LEFT JOIN LATERAL (elimina N+1)
--   2. Search: FTS puro quando tsquery match, ILIKE so quando FTS retorna 0
--      (evita OR que forca seq scan)

CREATE OR REPLACE FUNCTION public.get_spied_offers_paginated(
  p_workspace_id UUID,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0,
  p_statuses TEXT[] DEFAULT NULL,
  p_exclude_statuses TEXT[] DEFAULT NULL,
  p_vertical TEXT DEFAULT NULL,
  p_discovery_source TEXT DEFAULT NULL,
  p_search TEXT DEFAULT NULL,
  p_sort_column TEXT DEFAULT 'updated_at',
  p_sort_direction TEXT DEFAULT 'desc'
)
RETURNS TABLE(
  id UUID,
  nome VARCHAR,
  main_domain VARCHAR,
  status VARCHAR,
  vertical VARCHAR,
  subnicho VARCHAR,
  geo VARCHAR,
  priority INT,
  discovery_source VARCHAR,
  discovered_at DATE,
  product_name VARCHAR,
  product_ticket DECIMAL,
  product_currency VARCHAR,
  product_promise TEXT,
  notas TEXT,
  screenshot_url TEXT,
  traffic_trend VARCHAR,
  estimated_monthly_traffic INT,
  estimated_monthly_revenue DECIMAL,
  operator_name VARCHAR,
  checkout_provider VARCHAR,
  vsl_player VARCHAR,
  discovery_query TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  domain_count BIGINT,
  ad_library_count BIGINT,
  funnel_step_count BIGINT,
  creative_count BIGINT,
  total_count BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total BIGINT;
  v_tsquery tsquery;
  v_use_ilike BOOLEAN := FALSE;
BEGIN
  -- Pre-compute tsquery
  IF p_search IS NOT NULL AND p_search <> '' THEN
    v_tsquery := plainto_tsquery('simple', p_search);

    -- Check if FTS returns results; if not, fall back to ILIKE
    PERFORM 1 FROM spied_offers
    WHERE workspace_id = p_workspace_id
      AND search_vector @@ v_tsquery
    LIMIT 1;

    IF NOT FOUND THEN
      v_use_ilike := TRUE;
    END IF;
  END IF;

  -- Total count
  SELECT COUNT(*) INTO v_total
  FROM spied_offers so
  WHERE so.workspace_id = p_workspace_id
    AND (p_statuses IS NULL OR so.status = ANY(p_statuses))
    AND (p_exclude_statuses IS NULL OR so.status != ALL(p_exclude_statuses))
    AND (p_vertical IS NULL OR so.vertical = p_vertical)
    AND (p_discovery_source IS NULL OR so.discovery_source = p_discovery_source)
    AND (
      p_search IS NULL OR p_search = ''
      OR (NOT v_use_ilike AND so.search_vector @@ v_tsquery)
      OR (v_use_ilike AND (
           so.nome ILIKE '%' || p_search || '%'
        OR so.main_domain ILIKE '%' || p_search || '%'
        OR so.product_name ILIKE '%' || p_search || '%'
      ))
    );

  -- Main query
  RETURN QUERY
  WITH
  -- Pre-aggregate counts via GROUP BY (NOT lateral joins)
  dc AS (SELECT spied_offer_id, COUNT(*) AS cnt FROM offer_domains GROUP BY 1),
  alc AS (SELECT spied_offer_id, COUNT(*) AS cnt FROM offer_ad_libraries GROUP BY 1),
  fsc AS (SELECT spied_offer_id, COUNT(*) AS cnt FROM offer_funnel_steps GROUP BY 1),
  acc AS (SELECT spied_offer_id, COUNT(*) AS cnt FROM ad_creatives GROUP BY 1)
  SELECT
    so.id,
    so.nome,
    so.main_domain,
    so.status,
    so.vertical,
    so.subnicho,
    so.geo,
    so.priority,
    so.discovery_source,
    so.discovered_at,
    so.product_name,
    so.product_ticket,
    so.product_currency,
    so.product_promise,
    so.notas,
    so.screenshot_url,
    so.traffic_trend,
    so.estimated_monthly_traffic,
    so.estimated_monthly_revenue,
    so.operator_name,
    so.checkout_provider,
    so.vsl_player,
    so.discovery_query,
    so.created_at,
    so.updated_at,
    COALESCE(dc.cnt, 0)  AS domain_count,
    COALESCE(alc.cnt, 0) AS ad_library_count,
    COALESCE(fsc.cnt, 0) AS funnel_step_count,
    COALESCE(acc.cnt, 0) AS creative_count,
    v_total AS total_count
  FROM spied_offers so
  LEFT JOIN dc  ON dc.spied_offer_id  = so.id
  LEFT JOIN alc ON alc.spied_offer_id = so.id
  LEFT JOIN fsc ON fsc.spied_offer_id = so.id
  LEFT JOIN acc ON acc.spied_offer_id = so.id
  WHERE so.workspace_id = p_workspace_id
    AND (p_statuses IS NULL OR so.status = ANY(p_statuses))
    AND (p_exclude_statuses IS NULL OR so.status != ALL(p_exclude_statuses))
    AND (p_vertical IS NULL OR so.vertical = p_vertical)
    AND (p_discovery_source IS NULL OR so.discovery_source = p_discovery_source)
    AND (
      p_search IS NULL OR p_search = ''
      OR (NOT v_use_ilike AND so.search_vector @@ v_tsquery)
      OR (v_use_ilike AND (
           so.nome ILIKE '%' || p_search || '%'
        OR so.main_domain ILIKE '%' || p_search || '%'
        OR so.product_name ILIKE '%' || p_search || '%'
      ))
    )
  ORDER BY
    CASE WHEN p_sort_column = 'updated_at' AND p_sort_direction = 'desc' THEN so.updated_at END DESC NULLS LAST,
    CASE WHEN p_sort_column = 'updated_at' AND p_sort_direction = 'asc'  THEN so.updated_at END ASC NULLS LAST,
    CASE WHEN p_sort_column = 'nome'       AND p_sort_direction = 'asc'  THEN so.nome END ASC NULLS LAST,
    CASE WHEN p_sort_column = 'nome'       AND p_sort_direction = 'desc' THEN so.nome END DESC NULLS LAST,
    CASE WHEN p_sort_column = 'created_at' AND p_sort_direction = 'desc' THEN so.created_at END DESC NULLS LAST,
    CASE WHEN p_sort_column = 'created_at' AND p_sort_direction = 'asc'  THEN so.created_at END ASC NULLS LAST,
    so.updated_at DESC NULLS LAST
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

COMMENT ON FUNCTION public.get_spied_offers_paginated IS
  'Paginated spied offers with pre-aggregated relation counts (GROUP BY CTEs) and full-text search with ILIKE fallback. Optimized 2026-03-01.';
-- ============================================================
-- FASE 0.5: UX Design System — Database Migrations
-- Data Engineer: Dara | Date: 2026-03-03
--
-- Wireframes de origem:
--   WF-1: Daily Briefing       (sem alteracoes DB — queries existentes)
--   WF-2: Clone-to-Own         → ofertas +spied_offer_id +source
--   WF-3: Command Palette      (sem alteracoes DB — ILIKE queries)
--   WF-4: Creative Lifecycle   → ad_creatives +decision_metrics +decision_notes +decided_at +test_started_at
--   WF-5: Spike Notifications  → spike_alerts +seen_at
--
-- Modificacoes:
--   1. ofertas: +spied_offer_id (FK), +source (TEXT)
--   2. ad_creatives: +decision_metrics (JSONB), +decision_notes (TEXT),
--                    +decided_at (TIMESTAMPTZ), +test_started_at (TIMESTAMPTZ)
--   3. spike_alerts: +seen_at (TIMESTAMPTZ)
--
-- Total: 7 novos campos, 0 breaking changes, todas adicoes aditivas.
-- Rollback: ver secao DOWN MIGRATION no final do arquivo.
-- ============================================================


-- ============================================================
-- 1. TABELA: ofertas — Clone-to-Own (WF-2)
-- ============================================================
-- spied_offer_id: FK para spied_offers — vincula oferta propria a oferta espionada de origem.
-- source: Origem da oferta — 'manual' (criada do zero) ou 'clone' (clonada do Radar).

ALTER TABLE ofertas
  ADD COLUMN IF NOT EXISTS spied_offer_id UUID REFERENCES spied_offers(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual'
    CHECK (source IN ('manual', 'clone'));

-- Index para buscar ofertas clonadas a partir da oferta espionada
CREATE INDEX IF NOT EXISTS idx_ofertas_spied_offer_id
  ON ofertas(spied_offer_id)
  WHERE spied_offer_id IS NOT NULL;

-- Index para filtrar por origem (manual vs clone)
CREATE INDEX IF NOT EXISTS idx_ofertas_source
  ON ofertas(source);

COMMENT ON COLUMN ofertas.spied_offer_id IS
  'FK para spied_offers. Null se criada manualmente. Preenchida no Clone-to-Own (WF-2).';
COMMENT ON COLUMN ofertas.source IS
  'Metodo de criacao: manual (do zero) ou clone (clonada de spied_offer). WF-2.';


-- ============================================================
-- 2. TABELA: ad_creatives — Creative Lifecycle WINNER/KILLED (WF-4)
-- ============================================================
-- decision_metrics: JSONB com metricas do teste { ctr, cpa, roas, ... }
-- decision_notes: Aprendizado obrigatorio para KILLED, opcional para WINNER
-- decided_at: Timestamp da decisao WINNER/KILLED
-- test_started_at: Timestamp de entrada em teste (calcula "Xd em teste")

ALTER TABLE ad_creatives
  ADD COLUMN IF NOT EXISTS decision_metrics JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS decision_notes TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS test_started_at TIMESTAMPTZ DEFAULT NULL;

-- Index parcial: criativos em teste com data de inicio (query "criativos >72h")
CREATE INDEX IF NOT EXISTS idx_ad_creatives_testing_started
  ON ad_creatives(test_started_at)
  WHERE status = 'testing' AND test_started_at IS NOT NULL;

-- Index parcial: criativos com decisao tomada, ordenados por data
CREATE INDEX IF NOT EXISTS idx_ad_creatives_decided
  ON ad_creatives(decided_at DESC)
  WHERE decided_at IS NOT NULL;

COMMENT ON COLUMN ad_creatives.decision_metrics IS
  'JSONB com metricas do teste: { ctr: number, cpa: number, roas: number }. Preenchido na decisao WINNER/KILLED. WF-4.';
COMMENT ON COLUMN ad_creatives.decision_notes IS
  'Aprendizado do teste. OBRIGATORIO para KILLED, opcional para WINNER. WF-4.';
COMMENT ON COLUMN ad_creatives.decided_at IS
  'Timestamp de quando a decisao WINNER/KILLED foi tomada. WF-4.';
COMMENT ON COLUMN ad_creatives.test_started_at IS
  'Timestamp de quando entrou em status testing. Usado para calcular dias em teste. WF-4.';


-- ============================================================
-- 3. TABELA: spike_alerts — Spike Notification System (WF-5)
-- ============================================================
-- seen_at: Quando o usuario marcou o alerta como "visto".
-- NULL = nao visto (conta no badge). Timestamp = momento que foi marcado.

ALTER TABLE spike_alerts
  ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ DEFAULT NULL;

-- Index parcial: alertas nao vistos por workspace (usado para badge count)
CREATE INDEX IF NOT EXISTS idx_spike_alerts_unseen
  ON spike_alerts(workspace_id)
  WHERE seen_at IS NULL;

COMMENT ON COLUMN spike_alerts.seen_at IS
  'Timestamp de quando usuario marcou como visto. NULL = nao visto (badge count). WF-5.';


-- ============================================================
-- QUERIES DE REFERENCIA (nao executadas — doc para @dev)
-- ============================================================

-- [WF-1] Daily Briefing KPIs:
--   Criativos >72h em teste:
--     SELECT count(*) FROM ad_creatives
--     WHERE status = 'testing'
--       AND test_started_at < now() - interval '72 hours'
--       AND workspace_id = $1;
--
--   Spikes nao vistos (badge):
--     SELECT count(*) FROM spike_alerts
--     WHERE seen_at IS NULL
--       AND workspace_id = $1;

-- [WF-2] Clone-to-Own INSERT:
--   INSERT INTO ofertas (nome, vertical, ..., spied_offer_id, source, workspace_id)
--   VALUES ($nome || ' (clone)', $vertical, ..., $spied_offer_id, 'clone', $workspace_id);

-- [WF-5] Mark all spikes as seen:
--   UPDATE spike_alerts
--   SET seen_at = now(), updated_at = now()
--   WHERE workspace_id = $1 AND seen_at IS NULL;


-- ============================================================
-- DOWN MIGRATION (rollback)
-- ============================================================
-- Para reverter, execute manualmente:
--
-- -- 1. ofertas
-- DROP INDEX IF EXISTS idx_ofertas_source;
-- DROP INDEX IF EXISTS idx_ofertas_spied_offer_id;
-- ALTER TABLE ofertas DROP COLUMN IF EXISTS source;
-- ALTER TABLE ofertas DROP COLUMN IF EXISTS spied_offer_id;
--
-- -- 2. ad_creatives
-- DROP INDEX IF EXISTS idx_ad_creatives_decided;
-- DROP INDEX IF EXISTS idx_ad_creatives_testing_started;
-- ALTER TABLE ad_creatives DROP COLUMN IF EXISTS test_started_at;
-- ALTER TABLE ad_creatives DROP COLUMN IF EXISTS decided_at;
-- ALTER TABLE ad_creatives DROP COLUMN IF EXISTS decision_notes;
-- ALTER TABLE ad_creatives DROP COLUMN IF EXISTS decision_metrics;
--
-- -- 3. spike_alerts
-- DROP INDEX IF EXISTS idx_spike_alerts_unseen;
-- ALTER TABLE spike_alerts DROP COLUMN IF EXISTS seen_at;
-- Creative Lifecycle Migration
-- Adds WINNER/KILLED lifecycle to criativos table
-- Status flow: DRAFT → TEST → WINNER | KILLED

-- 1. Add new lifecycle columns to criativos
ALTER TABLE criativos ADD COLUMN IF NOT EXISTS decision_metrics JSONB;
-- { ctr: number, cpa: number, roas: number }

ALTER TABLE criativos ADD COLUMN IF NOT EXISTS decision_notes TEXT;
-- Learning obrigatório para KILLED, opcional para WINNER

ALTER TABLE criativos ADD COLUMN IF NOT EXISTS decided_at TIMESTAMPTZ;
-- Quando a decisão WINNER/KILLED foi tomada

ALTER TABLE criativos ADD COLUMN IF NOT EXISTS test_started_at TIMESTAMPTZ;
-- Quando entrou em TEST (para calcular dias em teste)

-- 2. Migrate existing status values
-- PRODUCAO → TEST (em produção = em teste)
-- Backfill test_started_at with updated_at so >72h alerts work for migrated rows
UPDATE criativos SET status = 'TEST', test_started_at = COALESCE(updated_at, created_at, now()) WHERE status = 'PRODUCAO';

-- ATIVO → WINNER (ativo = estava funcionando)
UPDATE criativos SET status = 'WINNER', decided_at = updated_at WHERE status = 'ATIVO';

-- MORTO → KILLED (morto = parou de funcionar)
UPDATE criativos SET status = 'KILLED', decided_at = updated_at WHERE status = 'MORTO';

-- 3. Index for performance on new status values
CREATE INDEX IF NOT EXISTS idx_criativos_status_lifecycle ON criativos (status) WHERE status IN ('TEST', 'WINNER', 'KILLED');

-- 4. Index for test duration queries (finding >72h alerts)
CREATE INDEX IF NOT EXISTS idx_criativos_test_started ON criativos (test_started_at) WHERE status = 'TEST' AND test_started_at IS NOT NULL;

-- ROLLBACK:
-- DROP INDEX IF EXISTS idx_criativos_test_started;
-- DROP INDEX IF EXISTS idx_criativos_status_lifecycle;
-- UPDATE criativos SET status = 'MORTO' WHERE status = 'KILLED';
-- UPDATE criativos SET status = 'ATIVO' WHERE status = 'WINNER';
-- UPDATE criativos SET status = 'PRODUCAO' WHERE status = 'TEST';
-- ALTER TABLE criativos DROP COLUMN IF EXISTS test_started_at;
-- ALTER TABLE criativos DROP COLUMN IF EXISTS decided_at;
-- ALTER TABLE criativos DROP COLUMN IF EXISTS decision_notes;
-- ALTER TABLE criativos DROP COLUMN IF EXISTS decision_metrics;
-- ============================================
-- FIX: Recreate missing RPCs + GRANT permissions
-- Date: 2026-03-03
-- Issue: get_latest_traffic_per_offer and get_traffic_intel_summary
--        not accessible via PostgREST (created in 20260222001000 but
--        not visible in schema cache). Recreating with GRANT EXECUTE.
-- Also: Changed get_latest_traffic_per_offer to filter by SOURCE
--        instead of period_type (more reliable — aligns with
--        Traffic Intelligence approach).
-- ============================================

-- ============================================
-- 1. Drop old overload of get_latest_traffic_per_offer (VARCHAR param)
--    then create new version with TEXT param (source-based filter)
-- ============================================
DROP FUNCTION IF EXISTS public.get_latest_traffic_per_offer(UUID, VARCHAR);

CREATE OR REPLACE FUNCTION public.get_latest_traffic_per_offer(
  p_workspace_id UUID,
  p_source TEXT DEFAULT 'similarweb'
)
RETURNS TABLE(
  spied_offer_id UUID,
  visits INT,
  period_date DATE,
  source VARCHAR
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT ON (t.spied_offer_id)
    t.spied_offer_id,
    t.visits,
    t.period_date,
    t.source
  FROM offer_traffic_data t
  WHERE t.workspace_id = p_workspace_id
    AND (
      (p_source = 'similarweb' AND t.source = 'similarweb')
      OR
      (p_source != 'similarweb' AND t.source != 'similarweb')
    )
  ORDER BY t.spied_offer_id, t.period_date DESC;
$$;

COMMENT ON FUNCTION public.get_latest_traffic_per_offer(UUID, TEXT) IS
  'Latest traffic per offer filtered by source (similarweb or semrush). Fixed 2026-03-03: changed from period_type to source filter for reliability.';

-- ============================================
-- 2. get_traffic_intel_summary (RECREATE)
-- ============================================
CREATE OR REPLACE FUNCTION public.get_traffic_intel_summary(
  p_workspace_id UUID,
  p_period_type VARCHAR DEFAULT 'monthly'
)
RETURNS TABLE(
  spied_offer_id UUID,
  total_visits BIGINT,
  peak_visits BIGINT,
  avg_visits BIGINT,
  latest_visits BIGINT,
  previous_visits BIGINT,
  data_points BIGINT,
  domain_count BIGINT,
  earliest_period DATE,
  latest_period DATE
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ts.spied_offer_id,
    ts.total_visits,
    ts.peak_visits,
    ts.avg_visits,
    ts.latest_visits,
    ts.previous_visits,
    ts.data_points,
    ts.domain_count,
    ts.earliest_period,
    ts.latest_period
  FROM mv_traffic_summary ts
  WHERE ts.workspace_id = p_workspace_id
    AND ts.source = CASE
      WHEN p_period_type = 'monthly_sw' THEN 'similarweb'
      WHEN p_period_type = 'monthly' THEN 'semrush'
      ELSE p_period_type
    END;
$$;

COMMENT ON FUNCTION public.get_traffic_intel_summary(UUID, VARCHAR) IS
  'Traffic intelligence summary from mv_traffic_summary materialized view. Recreated 2026-03-03.';

-- ============================================
-- 3. GRANT EXECUTE to authenticated + anon for ALL performance RPCs
-- ============================================
GRANT EXECUTE ON FUNCTION public.get_latest_traffic_per_offer(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_traffic_per_offer(UUID, TEXT) TO anon;

GRANT EXECUTE ON FUNCTION public.get_spied_offers_paginated(UUID, INT, INT, TEXT[], TEXT[], TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_spied_offers_paginated(UUID, INT, INT, TEXT[], TEXT[], TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;

GRANT EXECUTE ON FUNCTION public.get_traffic_intel_summary(UUID, VARCHAR) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_traffic_intel_summary(UUID, VARCHAR) TO anon;

-- ============================================
-- 4. Force PostgREST schema cache reload
-- ============================================
NOTIFY pgrst, 'reload schema';
-- Migration: Add intelligence fields to spied_offers
-- Date: 2026-03-03
-- Purpose: Support offer UX redesign with funnel_type, creative_angle, scale_signals, relevance_score

ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS funnel_type VARCHAR(50);
ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS creative_angle VARCHAR(50);
ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS scale_signals JSONB DEFAULT '{}';
ALTER TABLE spied_offers ADD COLUMN IF NOT EXISTS relevance_score INTEGER CHECK (relevance_score >= 1 AND relevance_score <= 5);

-- ROLLBACK:
-- ALTER TABLE spied_offers DROP COLUMN IF EXISTS funnel_type;
-- ALTER TABLE spied_offers DROP COLUMN IF EXISTS creative_angle;
-- ALTER TABLE spied_offers DROP COLUMN IF EXISTS scale_signals;
-- ALTER TABLE spied_offers DROP COLUMN IF EXISTS relevance_score;
