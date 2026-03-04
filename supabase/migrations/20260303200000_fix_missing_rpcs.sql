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
