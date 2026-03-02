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
