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
