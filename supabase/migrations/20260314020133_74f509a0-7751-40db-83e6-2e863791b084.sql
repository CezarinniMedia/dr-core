DROP FUNCTION IF EXISTS public.get_latest_traffic_per_offer(UUID, TEXT);

CREATE FUNCTION public.get_latest_traffic_per_offer(p_workspace_id UUID, p_source TEXT)
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
  FROM public.offer_traffic_data t
  WHERE t.workspace_id = p_workspace_id
    AND t.source = p_source
  ORDER BY t.spied_offer_id, t.period_date DESC
$$;

GRANT EXECUTE ON FUNCTION public.get_latest_traffic_per_offer(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_latest_traffic_per_offer(UUID, TEXT) TO anon;

NOTIFY pgrst, 'reload schema';