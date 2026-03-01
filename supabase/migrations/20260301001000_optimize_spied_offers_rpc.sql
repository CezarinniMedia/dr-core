-- ============================================
-- OPTIMIZATION: get_spied_offers_paginated RPC
-- Date: 2026-03-01
-- Author: @data-engineer (Dara)
--
-- Problem:
--   1. Correlated subqueries (N+1) for domain_count, ad_library_count, etc.
--      execute once per row in the result set = 4 extra queries * 50 rows = 200 queries
--   2. ILIKE '%search%' on nome, main_domain, product_name does full sequential scan
--      on 12k+ rows for every search request
--   3. Missing FK indexes on subquery tables cause nested loop scans
--
-- Solution:
--   1. Replace correlated subqueries with 4 GROUP BY CTEs (true set-based aggregation)
--   2. Add a GIN-indexed tsvector generated column for full-text search
--      (FTS only — no ILIKE fallback that would force sequential scan)
--   3. Add explicit FK indexes on all relation tables (idempotent)
--
-- Expected impact:
--   - Correlated subqueries: 4N queries -> 1 CTE scan (50-200x fewer round trips)
--   - Text search: sequential scan -> GIN index lookup (10-100x faster)
--   - FK lookups: sequential scan -> index scan for COUNT aggregations
-- ============================================

-- ============================================
-- PART 1: Full-text search vector on spied_offers
-- ============================================

-- Add generated tsvector column for fast text search
-- Uses 'simple' config (language-agnostic) to handle mixed PT-BR/EN domain names
ALTER TABLE public.spied_offers
  ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple',
      COALESCE(nome, '') || ' ' ||
      COALESCE(main_domain, '') || ' ' ||
      COALESCE(product_name, '')
    )
  ) STORED;

-- GIN index for @@ operator — enables sub-millisecond text search
CREATE INDEX IF NOT EXISTS idx_spied_offers_search_vector
  ON public.spied_offers USING GIN (search_vector);


-- ============================================
-- PART 2: Missing FK indexes for relation counts
-- ============================================
-- These indexes accelerate the COUNT(*) aggregations in the CTE.
-- Some may already exist (IF NOT EXISTS makes this idempotent).

-- offer_domains.spied_offer_id (may exist as idx_offer_domains_offer)
CREATE INDEX IF NOT EXISTS idx_offer_domains_spied_offer_id
  ON public.offer_domains(spied_offer_id);

-- offer_ad_libraries.spied_offer_id (may exist as idx_offer_ad_libraries_offer)
CREATE INDEX IF NOT EXISTS idx_offer_ad_libraries_spied_offer_id
  ON public.offer_ad_libraries(spied_offer_id);

-- offer_funnel_steps.spied_offer_id (may exist as idx_offer_funnel_offer)
CREATE INDEX IF NOT EXISTS idx_offer_funnel_steps_spied_offer_id
  ON public.offer_funnel_steps(spied_offer_id);

-- ad_creatives.spied_offer_id (composite idx_ad_creatives_sources exists but
-- has spied_offer_id as 2nd column — not usable for solo lookups)
CREATE INDEX IF NOT EXISTS idx_ad_creatives_spied_offer_id
  ON public.ad_creatives(spied_offer_id);


-- ============================================
-- PART 3: Composite index for workspace + updated_at (default sort)
-- ============================================
-- The RPC always filters by workspace_id and default-sorts by updated_at DESC.
-- This composite index turns the most common query pattern into an index-only scan.

CREATE INDEX IF NOT EXISTS idx_spied_offers_workspace_updated
  ON public.spied_offers(workspace_id, updated_at DESC NULLS LAST);


-- ============================================
-- PART 4: Optimized get_spied_offers_paginated RPC
-- ============================================
-- Changes from previous version:
--   1. 4 separate GROUP BY CTEs replace correlated subqueries (true set-based, no N+1)
--   2. Full-text search via search_vector @@ plainto_tsquery (no ILIKE fallback —
--      ILIKE with % prefix forces seq scan and negates the GIN index benefit)
--   3. Same function signature — backward compatible (same params + return type)

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
BEGIN
  -- Pre-compute the tsquery once (NULL if no search)
  IF p_search IS NOT NULL AND p_search <> '' THEN
    v_tsquery := plainto_tsquery('simple', p_search);
  END IF;

  -- -----------------------------------------------
  -- Total count with filters (for pagination metadata)
  -- FTS only — no ILIKE fallback (% prefix forces seq scan, negating GIN)
  -- -----------------------------------------------
  SELECT COUNT(*) INTO v_total
  FROM spied_offers so
  WHERE so.workspace_id = p_workspace_id
    AND (p_statuses IS NULL OR so.status = ANY(p_statuses))
    AND (p_exclude_statuses IS NULL OR so.status != ALL(p_exclude_statuses))
    AND (p_vertical IS NULL OR so.vertical = p_vertical)
    AND (p_discovery_source IS NULL OR so.discovery_source = p_discovery_source)
    AND (
      p_search IS NULL
      OR p_search = ''
      OR so.search_vector @@ v_tsquery
    );

  -- -----------------------------------------------
  -- Main query with 4 GROUP BY CTEs for relation counts
  -- Each CTE scans its table ONCE with GROUP BY (true set-based, no N+1)
  -- -----------------------------------------------
  RETURN QUERY
  WITH
  dc AS (
    SELECT spied_offer_id, COUNT(*) AS cnt
    FROM offer_domains
    GROUP BY spied_offer_id
  ),
  alc AS (
    SELECT spied_offer_id, COUNT(*) AS cnt
    FROM offer_ad_libraries
    GROUP BY spied_offer_id
  ),
  fsc AS (
    SELECT spied_offer_id, COUNT(*) AS cnt
    FROM offer_funnel_steps
    GROUP BY spied_offer_id
  ),
  acc AS (
    SELECT spied_offer_id, COUNT(*) AS cnt
    FROM ad_creatives
    GROUP BY spied_offer_id
  )
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
    COALESCE(dc.cnt, 0) AS domain_count,
    COALESCE(alc.cnt, 0) AS ad_library_count,
    COALESCE(fsc.cnt, 0) AS funnel_step_count,
    COALESCE(acc.cnt, 0) AS creative_count,
    v_total AS total_count
  FROM spied_offers so
  LEFT JOIN dc ON dc.spied_offer_id = so.id
  LEFT JOIN alc ON alc.spied_offer_id = so.id
  LEFT JOIN fsc ON fsc.spied_offer_id = so.id
  LEFT JOIN acc ON acc.spied_offer_id = so.id
  WHERE so.workspace_id = p_workspace_id
    AND (p_statuses IS NULL OR so.status = ANY(p_statuses))
    AND (p_exclude_statuses IS NULL OR so.status != ALL(p_exclude_statuses))
    AND (p_vertical IS NULL OR so.vertical = p_vertical)
    AND (p_discovery_source IS NULL OR so.discovery_source = p_discovery_source)
    AND (
      p_search IS NULL
      OR p_search = ''
      OR so.search_vector @@ v_tsquery
    )
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
-- PART 5: Add COMMENT for documentation
-- ============================================
COMMENT ON FUNCTION public.get_spied_offers_paginated IS
  'Paginated spied offers with pre-aggregated relation counts and full-text search. '
  'Optimized 2026-03-01: CTE counts + tsvector search replace correlated subqueries + ILIKE scans.';
