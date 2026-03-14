-- ============================================
-- Optimize: get_latest_traffic_per_offer DISTINCT ON index
-- Date: 2026-03-14
-- Issue: DISTINCT ON (spied_offer_id) ORDER BY period_date DESC
--        scans 119k+ rows without covering index = ~1.3s
-- Fix: Composite index matching the exact DISTINCT ON pattern
-- ============================================

-- Covering index for DISTINCT ON (spied_offer_id) ORDER BY period_date DESC
-- Filters: workspace_id + source
CREATE INDEX IF NOT EXISTS idx_otd_latest_per_offer
  ON public.offer_traffic_data(workspace_id, source, spied_offer_id, period_date DESC)
  INCLUDE (visits);

-- Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
