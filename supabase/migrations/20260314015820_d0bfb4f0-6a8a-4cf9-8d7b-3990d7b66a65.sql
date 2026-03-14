
CREATE OR REPLACE FUNCTION public.get_latest_traffic_per_offer(p_workspace_id UUID, p_period_type TEXT DEFAULT 'monthly')
RETURNS TABLE(spied_offer_id UUID, visits INT, period_date DATE, source TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT DISTINCT ON (t.spied_offer_id)
    t.spied_offer_id,
    t.visits,
    t.period_date,
    t.source::TEXT AS source
  FROM offer_traffic_data t
  WHERE t.workspace_id = p_workspace_id
    AND (
      (p_period_type = 'monthly_sw' AND t.source = 'similarweb')
      OR (p_period_type != 'monthly_sw' AND t.source != 'similarweb')
    )
  ORDER BY t.spied_offer_id, t.period_date DESC
$$;

GRANT EXECUTE ON FUNCTION public.get_latest_traffic_per_offer(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_traffic_per_offer(UUID, TEXT) TO anon;

NOTIFY pgrst, 'reload schema';
