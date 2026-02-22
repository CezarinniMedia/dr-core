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
