-- ============================================
-- Traffic Intelligence RPCs + Performance Indexes
-- Date: 2026-03-09
-- Author: Dara (@data-engineer)
-- Spec: docs/sessions/2026-03/rpc-spec-traffic-intelligence.md
-- QA Review: Quinn (@qa) — 6 gaps fixed, GAP-7 incorporated
--
-- Purpose: Move Traffic Intelligence aggregation from JS to SQL.
--   Before: Frontend fetches ALL 12k offers + 87k traffic rows, joins in JS
--   After:  Single RPC returns paginated, filtered, sorted, pre-aggregated rows
--
-- Rollback: DROP FUNCTION statements at bottom (commented)
-- ============================================

-- ============================================
-- 1. Enable pg_trgm for ILIKE index support (idempotent)
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- 2. Performance indexes
-- ============================================

-- Composite index: primary filter path for traffic queries
-- Covers: source filter + offer join + date range scan
CREATE INDEX IF NOT EXISTS idx_otd_source_offer_period
  ON public.offer_traffic_data(source, spied_offer_id, period_date);

-- Composite index: workspace + source for available_months RPC
CREATE INDEX IF NOT EXISTS idx_otd_workspace_source
  ON public.offer_traffic_data(workspace_id, source);

-- Trigram indexes for ILIKE search on offers (12k rows)
CREATE INDEX IF NOT EXISTS idx_spied_offers_nome_trgm
  ON public.spied_offers USING gin(nome gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_spied_offers_main_domain_trgm
  ON public.spied_offers USING gin(main_domain gin_trgm_ops);

-- Index for workspace + status filter on spied_offers
CREATE INDEX IF NOT EXISTS idx_spied_offers_ws_status
  ON public.spied_offers(workspace_id, status);

-- ============================================
-- 3. RPC: get_traffic_intel_rows
--    Replaces: fetchAllOffersLite + fetchAllTrafficRows + compareTraffic (JS)
--    Returns: paginated, filtered, sorted offer rows with traffic metrics
-- ============================================
DROP FUNCTION IF EXISTS public.get_traffic_intel_rows(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, INT, INT);

CREATE OR REPLACE FUNCTION public.get_traffic_intel_rows(
  p_workspace_id UUID,
  p_source       TEXT    DEFAULT 'similarweb',
  p_date_from    TEXT    DEFAULT NULL,
  p_date_to      TEXT    DEFAULT NULL,
  p_statuses     TEXT[]  DEFAULT NULL,
  p_search       TEXT    DEFAULT NULL,
  p_sort_field   TEXT    DEFAULT 'last_month',
  p_sort_dir     TEXT    DEFAULT 'desc',
  p_page         INT     DEFAULT 0,
  p_page_size    INT     DEFAULT 25
)
RETURNS TABLE(
  id               UUID,
  nome             TEXT,
  main_domain      TEXT,
  status           TEXT,
  vertical         TEXT,
  discovered_at    DATE,
  last_month       BIGINT,
  prev_month       BIGINT,
  variation        NUMERIC(8,2),
  peak             BIGINT,
  peak_date        TEXT,
  sparkline        INT[],
  sparkline_months TEXT[],
  has_traffic      BOOLEAN,
  total_count      BIGINT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_date_from DATE;
  v_date_to   DATE;
BEGIN
  -- Pre-compute date boundaries once (avoids repeated to_date in CTEs)
  IF p_date_from IS NOT NULL THEN
    v_date_from := to_date(p_date_from || '-01', 'YYYY-MM-DD');
  END IF;
  IF p_date_to IS NOT NULL THEN
    v_date_to := to_date(p_date_to || '-01', 'YYYY-MM-DD') + interval '1 month';
  END IF;

  RETURN QUERY
  -- CTE 1: Offers matching workspace + auth + filters
  WITH offers_base AS (
    SELECT
      so.id, so.nome, so.main_domain, so.status,
      so.vertical, so.discovered_at
    FROM spied_offers so
    WHERE so.workspace_id = p_workspace_id
      AND so.workspace_id IN (
        SELECT wm.workspace_id
        FROM workspace_members wm
        WHERE wm.user_id = auth.uid()
      )
      AND (p_statuses IS NULL OR so.status = ANY(p_statuses))
      AND (p_search IS NULL OR (
        so.nome ILIKE '%' || p_search || '%'
        OR so.main_domain ILIKE '%' || p_search || '%'
      ))
  ),

  -- CTE 2: Main domain traffic (date-filtered, source-filtered)
  traffic_main AS (
    SELECT
      t.spied_offer_id,
      to_char(t.period_date, 'YYYY-MM') AS month,
      MAX(COALESCE(t.visits, 0))::INT AS visits
    FROM offer_traffic_data t
    INNER JOIN offers_base o ON o.id = t.spied_offer_id
    WHERE o.main_domain IS NOT NULL
      AND t.domain = o.main_domain
      AND (
        (p_source = 'similarweb' AND t.source = 'similarweb')
        OR (p_source != 'similarweb' AND t.source != 'similarweb')
      )
      AND (v_date_from IS NULL OR t.period_date >= v_date_from)
      AND (v_date_to IS NULL OR t.period_date < v_date_to)
    GROUP BY t.spied_offer_id, to_char(t.period_date, 'YYYY-MM')
  ),

  -- CTE 3: Fallback — offers without main_domain OR whose main_domain has
  --         NO traffic records at all (date-INDEPENDENT check per QA GAP-7).
  --         This replicates the JS logic: fallback is based on whether
  --         main_domain has ANY records ever, not just within the date range.
  traffic_fallback AS (
    SELECT
      t.spied_offer_id,
      to_char(t.period_date, 'YYYY-MM') AS month,
      MAX(COALESCE(t.visits, 0))::INT AS visits
    FROM offer_traffic_data t
    INNER JOIN offers_base o ON o.id = t.spied_offer_id
    WHERE (
      -- Case 1: no main_domain set
      o.main_domain IS NULL
      OR
      -- Case 2: main_domain set but has ZERO matching records ever (date-independent)
      (o.main_domain IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM offer_traffic_data t2
        WHERE t2.spied_offer_id = o.id
          AND t2.domain = o.main_domain
          AND (
            (p_source = 'similarweb' AND t2.source = 'similarweb')
            OR (p_source != 'similarweb' AND t2.source != 'similarweb')
          )
      ))
    )
    AND (
      (p_source = 'similarweb' AND t.source = 'similarweb')
      OR (p_source != 'similarweb' AND t.source != 'similarweb')
    )
    AND (v_date_from IS NULL OR t.period_date >= v_date_from)
    AND (v_date_to IS NULL OR t.period_date < v_date_to)
    GROUP BY t.spied_offer_id, to_char(t.period_date, 'YYYY-MM')
  ),

  -- CTE 4: Union of main + fallback (mutually exclusive, no overlap)
  traffic_agg AS (
    SELECT * FROM traffic_main
    UNION ALL
    SELECT * FROM traffic_fallback
  ),

  -- CTE 5: has_traffic — ANY record exists (no date/domain filter)
  --         Matches JS semantics: hasTrafficData = allRecords.length > 0
  offer_has_traffic AS (
    SELECT DISTINCT t.spied_offer_id, TRUE AS has_traffic
    FROM offer_traffic_data t
    INNER JOIN offers_base o ON o.id = t.spied_offer_id
    WHERE (
      (p_source = 'similarweb' AND t.source = 'similarweb')
      OR (p_source != 'similarweb' AND t.source != 'similarweb')
    )
  ),

  -- CTE 6: Aggregate metrics per offer
  offer_metrics AS (
    SELECT
      ta.spied_offer_id,
      array_agg(ta.visits ORDER BY ta.month)          AS sparkline,
      array_agg(ta.month  ORDER BY ta.month)           AS sparkline_months,
      (array_agg(ta.visits ORDER BY ta.month DESC))[1] AS last_month,
      (array_agg(ta.visits ORDER BY ta.month DESC))[2] AS prev_month,
      MAX(ta.visits)                                    AS peak,
      (array_agg(ta.month ORDER BY ta.visits DESC, ta.month ASC))[1]  AS peak_date
    FROM traffic_agg ta
    GROUP BY ta.spied_offer_id
  ),

  -- CTE 7: Final result with variation calculation
  result AS (
    SELECT
      o.id,
      o.nome,
      o.main_domain,
      o.status,
      o.vertical,
      o.discovered_at,
      COALESCE(m.last_month, 0)::BIGINT                      AS last_month,
      COALESCE(m.prev_month, 0)::BIGINT                      AS prev_month,
      CASE
        WHEN COALESCE(m.prev_month, 0) > 0
          THEN ROUND(((m.last_month::NUMERIC - m.prev_month) / m.prev_month) * 100, 2)
        WHEN COALESCE(m.last_month, 0) > 0
          THEN 100.00
        ELSE 0.00
      END                                                     AS variation,
      COALESCE(m.peak, 0)::BIGINT                             AS peak,
      COALESCE(m.peak_date, '')                                AS peak_date,
      COALESCE(m.sparkline, ARRAY[]::INT[])                    AS sparkline,
      COALESCE(m.sparkline_months, ARRAY[]::TEXT[])            AS sparkline_months,
      COALESCE(ht.has_traffic, FALSE)                          AS has_traffic,
      COUNT(*) OVER ()                                         AS total_count
    FROM offers_base o
    LEFT JOIN offer_metrics m ON m.spied_offer_id = o.id
    LEFT JOIN offer_has_traffic ht ON ht.spied_offer_id = o.id
  )

  SELECT r.* FROM result r
  ORDER BY
    CASE WHEN p_sort_field = 'last_month' AND p_sort_dir = 'desc' THEN r.last_month END DESC NULLS LAST,
    CASE WHEN p_sort_field = 'last_month' AND p_sort_dir = 'asc'  THEN r.last_month END ASC  NULLS LAST,
    CASE WHEN p_sort_field = 'variation'  AND p_sort_dir = 'desc' THEN r.variation  END DESC NULLS LAST,
    CASE WHEN p_sort_field = 'variation'  AND p_sort_dir = 'asc'  THEN r.variation  END ASC  NULLS LAST,
    CASE WHEN p_sort_field = 'peak'       AND p_sort_dir = 'desc' THEN r.peak       END DESC NULLS LAST,
    CASE WHEN p_sort_field = 'peak'       AND p_sort_dir = 'asc'  THEN r.peak       END ASC  NULLS LAST,
    CASE WHEN p_sort_field = 'nome'       AND p_sort_dir = 'desc' THEN r.nome       END DESC NULLS LAST,
    CASE WHEN p_sort_field = 'nome'       AND p_sort_dir = 'asc'  THEN r.nome       END ASC  NULLS LAST,
    CASE WHEN p_sort_field = 'status'     AND p_sort_dir = 'desc' THEN r.status     END DESC NULLS LAST,
    CASE WHEN p_sort_field = 'status'     AND p_sort_dir = 'asc'  THEN r.status     END ASC  NULLS LAST,
    CASE WHEN p_sort_field = 'discovered' AND p_sort_dir = 'desc' THEN r.discovered_at END DESC NULLS LAST,
    CASE WHEN p_sort_field = 'discovered' AND p_sort_dir = 'asc'  THEN r.discovered_at END ASC  NULLS LAST
  LIMIT CASE WHEN p_page_size > 0 THEN p_page_size ELSE NULL END
  OFFSET CASE WHEN p_page_size > 0 THEN p_page * p_page_size ELSE 0 END;

END;
$$;

COMMENT ON FUNCTION public.get_traffic_intel_rows(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, INT, INT) IS
  'Traffic Intelligence table data — returns paginated, filtered, sorted offer rows with pre-aggregated traffic metrics (sparkline, variation, peak). Replaces client-side compareTraffic(). Created 2026-03-09.';

-- ============================================
-- 4. RPC: get_traffic_intel_available_months
--    Returns distinct months for MonthRangePicker
-- ============================================
DROP FUNCTION IF EXISTS public.get_traffic_intel_available_months(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.get_traffic_intel_available_months(
  p_workspace_id UUID,
  p_source       TEXT DEFAULT 'similarweb'
)
RETURNS TABLE(month TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT DISTINCT to_char(t.period_date, 'YYYY-MM') AS month
  FROM offer_traffic_data t
  WHERE t.workspace_id = p_workspace_id
    AND t.workspace_id IN (
      SELECT wm.workspace_id
      FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
    AND (
      (p_source = 'similarweb' AND t.source = 'similarweb')
      OR (p_source != 'similarweb' AND t.source != 'similarweb')
    )
  ORDER BY month;
$$;

COMMENT ON FUNCTION public.get_traffic_intel_available_months(UUID, TEXT) IS
  'Returns distinct YYYY-MM months available for the MonthRangePicker in Traffic Intelligence. Created 2026-03-09.';

-- ============================================
-- 5. GRANT EXECUTE
-- ============================================
GRANT EXECUTE ON FUNCTION public.get_traffic_intel_rows(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, INT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_traffic_intel_rows(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, INT, INT) TO anon;

GRANT EXECUTE ON FUNCTION public.get_traffic_intel_available_months(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_traffic_intel_available_months(UUID, TEXT) TO anon;

-- ============================================
-- 6. Force PostgREST schema cache reload
-- ============================================
NOTIFY pgrst, 'reload schema';

-- ============================================
-- ROLLBACK (uncomment to reverse)
-- ============================================
-- DROP FUNCTION IF EXISTS public.get_traffic_intel_rows(UUID, TEXT, TEXT, TEXT, TEXT[], TEXT, TEXT, TEXT, INT, INT);
-- DROP FUNCTION IF EXISTS public.get_traffic_intel_available_months(UUID, TEXT);
-- DROP INDEX IF EXISTS idx_otd_source_offer_period;
-- DROP INDEX IF EXISTS idx_otd_workspace_source;
-- DROP INDEX IF EXISTS idx_spied_offers_nome_trgm;
-- DROP INDEX IF EXISTS idx_spied_offers_main_domain_trgm;
-- DROP INDEX IF EXISTS idx_spied_offers_ws_status;
-- DROP EXTENSION IF EXISTS pg_trgm;
