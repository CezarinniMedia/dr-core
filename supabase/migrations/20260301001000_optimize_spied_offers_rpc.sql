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
