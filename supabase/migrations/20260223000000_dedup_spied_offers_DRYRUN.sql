-- =====================================================
-- DRY RUN PREVIEW: Deduplicação de spied_offers
--
-- SOMENTE LEITURA — nenhuma mutação é executada.
-- Execute ANTES da migration real para validar o escopo.
--
-- Projeto: iaffbkzmckgvrfmlybsr (Lovable)
-- =====================================================

-- =====================================================
-- 1. RESUMO GERAL: Totais de duplicatas por workspace
-- =====================================================
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
),
duplicates AS (
  SELECT r.id AS duplicate_id, k.id AS keeper_id, r.workspace_id, r.main_domain, r.domain_normalized
  FROM ranked r
  JOIN ranked k
    ON k.workspace_id = r.workspace_id
    AND k.domain_normalized = r.domain_normalized
    AND k.rn = 1
  WHERE r.rn > 1
)
SELECT
  '=== RESUMO GERAL ===' AS secao,
  COUNT(*) AS total_duplicatas,
  COUNT(DISTINCT domain_normalized) AS dominios_afetados,
  COUNT(DISTINCT workspace_id) AS workspaces_afetados
FROM duplicates;


-- =====================================================
-- 2. DUPLICATAS POR DOMÍNIO: Contagem e IDs
-- =====================================================
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
),
duplicates AS (
  SELECT r.id AS duplicate_id, k.id AS keeper_id, r.workspace_id, r.main_domain, r.domain_normalized
  FROM ranked r
  JOIN ranked k
    ON k.workspace_id = r.workspace_id
    AND k.domain_normalized = r.domain_normalized
    AND k.rn = 1
  WHERE r.rn > 1
)
SELECT
  domain_normalized AS dominio,
  COUNT(*) AS qtd_duplicatas,
  keeper_id,
  ARRAY_AGG(duplicate_id ORDER BY duplicate_id) AS ids_duplicatas
FROM duplicates
GROUP BY domain_normalized, keeper_id
ORDER BY qtd_duplicatas DESC;


-- =====================================================
-- 3. AMOSTRA: Detalhes das duplicatas (top 20)
-- =====================================================
WITH ranked AS (
  SELECT
    id,
    workspace_id,
    main_domain,
    LOWER(TRIM(main_domain)) AS domain_normalized,
    nome,
    status,
    vertical,
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
  id,
  main_domain,
  nome,
  status,
  vertical,
  created_at,
  CASE WHEN rn = 1 THEN 'KEEPER' ELSE 'DUPLICATA (rn=' || rn || ')' END AS acao
FROM ranked
WHERE domain_normalized IN (
  SELECT domain_normalized FROM ranked WHERE rn > 1 LIMIT 20
)
ORDER BY domain_normalized, rn;


-- =====================================================
-- 4. CONFLITOS DE TRÁFEGO: Casos onde keeper E duplicata
--    têm dados para o mesmo (domain, period_type, period_date)
-- =====================================================
WITH ranked AS (
  SELECT
    id,
    workspace_id,
    LOWER(TRIM(main_domain)) AS domain_normalized,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY workspace_id, LOWER(TRIM(main_domain))
      ORDER BY created_at ASC
    ) AS rn
  FROM spied_offers
  WHERE main_domain IS NOT NULL
    AND TRIM(main_domain) <> ''
),
dedup_map AS (
  SELECT r.id AS duplicate_id, k.id AS keeper_id
  FROM ranked r
  JOIN ranked k
    ON k.workspace_id = r.workspace_id
    AND k.domain_normalized = r.domain_normalized
    AND k.rn = 1
  WHERE r.rn > 1
)
SELECT
  d.keeper_id,
  d.duplicate_id,
  k.domain,
  k.period_type,
  k.period_date,
  k.visits AS keeper_visits,
  t.visits AS duplicate_visits,
  CASE
    WHEN t.visits > k.visits THEN 'DUPLICATA VENCE (maior visits)'
    ELSE 'KEEPER VENCE (maior ou igual visits)'
  END AS resolucao
FROM offer_traffic_data t
JOIN dedup_map d ON t.spied_offer_id = d.duplicate_id
JOIN offer_traffic_data k
  ON k.spied_offer_id = d.keeper_id
  AND k.domain = t.domain
  AND k.period_type = t.period_type
  AND k.period_date = t.period_date
ORDER BY d.keeper_id, k.domain, k.period_date;


-- =====================================================
-- 5. RESUMO DE CONFLITOS DE TRÁFEGO
-- =====================================================
WITH ranked AS (
  SELECT
    id,
    workspace_id,
    LOWER(TRIM(main_domain)) AS domain_normalized,
    created_at,
    ROW_NUMBER() OVER (
      PARTITION BY workspace_id, LOWER(TRIM(main_domain))
      ORDER BY created_at ASC
    ) AS rn
  FROM spied_offers
  WHERE main_domain IS NOT NULL
    AND TRIM(main_domain) <> ''
),
dedup_map AS (
  SELECT r.id AS duplicate_id, k.id AS keeper_id
  FROM ranked r
  JOIN ranked k
    ON k.workspace_id = r.workspace_id
    AND k.domain_normalized = r.domain_normalized
    AND k.rn = 1
  WHERE r.rn > 1
),
conflicts AS (
  SELECT
    d.keeper_id,
    d.duplicate_id,
    k.visits AS keeper_visits,
    t.visits AS duplicate_visits,
    CASE WHEN t.visits > k.visits THEN 1 ELSE 0 END AS dup_wins
  FROM offer_traffic_data t
  JOIN dedup_map d ON t.spied_offer_id = d.duplicate_id
  JOIN offer_traffic_data k
    ON k.spied_offer_id = d.keeper_id
    AND k.domain = t.domain
    AND k.period_type = t.period_type
    AND k.period_date = t.period_date
)
SELECT
  '=== CONFLITOS DE TRÁFEGO ===' AS secao,
  COUNT(*) AS total_conflitos,
  SUM(dup_wins) AS duplicata_vence,
  COUNT(*) - SUM(dup_wins) AS keeper_vence;


-- =====================================================
-- 6. REGISTROS FILHOS AFETADOS POR TABELA
-- =====================================================
WITH ranked AS (
  SELECT
    id,
    workspace_id,
    LOWER(TRIM(main_domain)) AS domain_normalized,
    ROW_NUMBER() OVER (
      PARTITION BY workspace_id, LOWER(TRIM(main_domain))
      ORDER BY created_at ASC
    ) AS rn
  FROM spied_offers
  WHERE main_domain IS NOT NULL
    AND TRIM(main_domain) <> ''
),
dup_ids AS (
  SELECT id FROM ranked WHERE rn > 1
)
SELECT 'offer_traffic_data' AS tabela, COUNT(*) AS registros_afetados
FROM offer_traffic_data WHERE spied_offer_id IN (SELECT id FROM dup_ids)
UNION ALL
SELECT 'offer_domains', COUNT(*)
FROM offer_domains WHERE spied_offer_id IN (SELECT id FROM dup_ids)
UNION ALL
SELECT 'offer_ad_libraries', COUNT(*)
FROM offer_ad_libraries WHERE spied_offer_id IN (SELECT id FROM dup_ids)
UNION ALL
SELECT 'offer_funnel_steps', COUNT(*)
FROM offer_funnel_steps WHERE spied_offer_id IN (SELECT id FROM dup_ids)
UNION ALL
SELECT 'ad_creatives', COUNT(*)
FROM ad_creatives WHERE spied_offer_id IN (SELECT id FROM dup_ids)
ORDER BY registros_afetados DESC;
