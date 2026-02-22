-- ============================================================
-- PHASE 5: PIPELINE — Manual refresh + status tracking
-- ============================================================

-- Function to manually refresh all materialized views
-- Returns refresh stats (which views were refreshed, timing)
-- FIX B2: Added auth check + advisory lock to prevent concurrent refreshes
CREATE OR REPLACE FUNCTION refresh_pipeline()
RETURNS TABLE (
  view_name TEXT,
  refreshed_at TIMESTAMPTZ,
  duration_ms INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start TIMESTAMPTZ;
  v_end TIMESTAMPTZ;
BEGIN
  -- Auth check: only authenticated users can trigger refresh
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Advisory lock prevents concurrent refreshes (lock id = hash of 'refresh_pipeline')
  IF NOT pg_try_advisory_xact_lock(hashtext('refresh_pipeline')) THEN
    RAISE EXCEPTION 'Pipeline refresh already in progress';
  END IF;

  -- 1. Dashboard metrics
  v_start := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_dashboard_metrics;
  v_end := clock_timestamp();
  view_name := 'mv_dashboard_metrics';
  refreshed_at := v_end;
  duration_ms := EXTRACT(MILLISECONDS FROM v_end - v_start)::INTEGER;
  RETURN NEXT;

  -- 2. Traffic summary
  v_start := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_traffic_summary;
  v_end := clock_timestamp();
  view_name := 'mv_traffic_summary';
  refreshed_at := v_end;
  duration_ms := EXTRACT(MILLISECONDS FROM v_end - v_start)::INTEGER;
  RETURN NEXT;

  -- 3. Spike detection
  v_start := clock_timestamp();
  REFRESH MATERIALIZED VIEW CONCURRENTLY mv_spike_detection;
  v_end := clock_timestamp();
  view_name := 'mv_spike_detection';
  refreshed_at := v_end;
  duration_ms := EXTRACT(MILLISECONDS FROM v_end - v_start)::INTEGER;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION refresh_pipeline() TO authenticated;

-- Function to get pipeline status (last refresh times)
-- FIX B2: Added auth check, removed unused p_workspace_id param
CREATE OR REPLACE FUNCTION get_pipeline_status()
RETURNS TABLE (
  view_name TEXT,
  last_refreshed TIMESTAMPTZ,
  row_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Auth check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- mv_dashboard_metrics
  view_name := 'mv_dashboard_metrics';
  SELECT mdm.refreshed_at INTO last_refreshed
    FROM mv_dashboard_metrics mdm
    LIMIT 1;
  SELECT COUNT(*) INTO row_count FROM mv_dashboard_metrics;
  RETURN NEXT;

  -- mv_traffic_summary
  view_name := 'mv_traffic_summary';
  last_refreshed := NULL; -- no refreshed_at column
  SELECT COUNT(*) INTO row_count FROM mv_traffic_summary;
  RETURN NEXT;

  -- mv_spike_detection
  view_name := 'mv_spike_detection';
  last_refreshed := NULL;
  SELECT COUNT(*) INTO row_count FROM mv_spike_detection;
  RETURN NEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION get_pipeline_status() TO authenticated;
