
-- ============================================
-- FIX: Storage RLS for spy-assets bucket
-- ============================================

CREATE POLICY "Authenticated users can upload spy assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'spy-assets');

CREATE POLICY "Anyone can read spy assets"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'spy-assets');

CREATE POLICY "Authenticated users can delete spy assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'spy-assets');

-- Also fix creatives bucket
CREATE POLICY "Authenticated users can upload creatives"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'creatives');

CREATE POLICY "Anyone can read creatives"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'creatives');

CREATE POLICY "Authenticated users can delete creatives"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'creatives');

-- ============================================
-- 1. SPIED OFFERS
-- ============================================

CREATE TABLE public.spied_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  vertical VARCHAR(50),
  subnicho VARCHAR(100),
  geo VARCHAR(50) DEFAULT 'BR',
  status VARCHAR(50) DEFAULT 'RADAR',
  priority INT DEFAULT 0,
  discovery_source VARCHAR(100),
  discovery_query TEXT,
  discovery_tool_detail TEXT,
  discovered_at DATE DEFAULT CURRENT_DATE,
  main_domain VARCHAR(255),
  product_name VARCHAR(255),
  product_promise TEXT,
  product_ticket DECIMAL(10,2),
  product_currency VARCHAR(10) DEFAULT 'BRL',
  checkout_provider VARCHAR(100),
  checkout_url TEXT,
  vsl_url TEXT,
  vsl_player VARCHAR(100),
  vsl_duration VARCHAR(50),
  estimated_monthly_traffic INT,
  estimated_monthly_revenue DECIMAL(12,2),
  traffic_trend VARCHAR(20),
  operator_name VARCHAR(255),
  operator_network TEXT,
  notas TEXT,
  oferta_id UUID REFERENCES public.ofertas(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.spied_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view spied_offers in workspace"
  ON public.spied_offers FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert spied_offers in workspace"
  ON public.spied_offers FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update spied_offers in workspace"
  ON public.spied_offers FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete spied_offers in workspace"
  ON public.spied_offers FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE TRIGGER update_spied_offers_updated_at
  BEFORE UPDATE ON public.spied_offers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_spied_offers_workspace ON public.spied_offers(workspace_id);
CREATE INDEX idx_spied_offers_status ON public.spied_offers(status);
CREATE INDEX idx_spied_offers_vertical ON public.spied_offers(vertical);
CREATE INDEX idx_spied_offers_domain ON public.spied_offers(main_domain);
CREATE INDEX idx_spied_offers_discovery ON public.spied_offers(discovery_source);

-- ============================================
-- 2. OFFER DOMAINS
-- ============================================

CREATE TABLE public.offer_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spied_offer_id UUID NOT NULL REFERENCES public.spied_offers(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  domain_type VARCHAR(50) DEFAULT 'landing_page',
  url TEXT,
  is_main BOOLEAN DEFAULT false,
  tech_stack JSONB,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.offer_domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view offer_domains in workspace"
  ON public.offer_domains FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert offer_domains in workspace"
  ON public.offer_domains FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update offer_domains in workspace"
  ON public.offer_domains FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete offer_domains in workspace"
  ON public.offer_domains FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_offer_domains_offer ON public.offer_domains(spied_offer_id);

-- ============================================
-- 3. AD LIBRARIES
-- ============================================

CREATE TABLE public.offer_ad_libraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spied_offer_id UUID NOT NULL REFERENCES public.spied_offers(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL DEFAULT 'facebook',
  page_name VARCHAR(255),
  page_id VARCHAR(255),
  library_url TEXT,
  ad_count INT,
  is_scaled BOOLEAN DEFAULT false,
  sites_found JSONB,
  notas TEXT,
  discovered_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.offer_ad_libraries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view offer_ad_libraries in workspace"
  ON public.offer_ad_libraries FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert offer_ad_libraries in workspace"
  ON public.offer_ad_libraries FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update offer_ad_libraries in workspace"
  ON public.offer_ad_libraries FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete offer_ad_libraries in workspace"
  ON public.offer_ad_libraries FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_offer_ad_libraries_offer ON public.offer_ad_libraries(spied_offer_id);

-- ============================================
-- 4. TRAFFIC DATA
-- ============================================

CREATE TABLE public.offer_traffic_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spied_offer_id UUID NOT NULL REFERENCES public.spied_offers(id) ON DELETE CASCADE,
  domain VARCHAR(255) NOT NULL,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  period_type VARCHAR(20) DEFAULT 'monthly',
  period_date DATE NOT NULL,
  visits INT,
  unique_visitors INT,
  pages_per_visit DECIMAL(5,2),
  avg_visit_duration INT,
  bounce_rate DECIMAL(5,2),
  source VARCHAR(50) DEFAULT 'manual',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(spied_offer_id, domain, period_type, period_date)
);

ALTER TABLE public.offer_traffic_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view offer_traffic_data in workspace"
  ON public.offer_traffic_data FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert offer_traffic_data in workspace"
  ON public.offer_traffic_data FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update offer_traffic_data in workspace"
  ON public.offer_traffic_data FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete offer_traffic_data in workspace"
  ON public.offer_traffic_data FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_offer_traffic_domain ON public.offer_traffic_data(domain);
CREATE INDEX idx_offer_traffic_period ON public.offer_traffic_data(period_date);

-- ============================================
-- 5. FUNNEL STEPS
-- ============================================

CREATE TABLE public.offer_funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  spied_offer_id UUID NOT NULL REFERENCES public.spied_offers(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_type VARCHAR(50) NOT NULL,
  page_url TEXT,
  page_title VARCHAR(255),
  screenshot_url TEXT,
  html_source TEXT,
  product_name VARCHAR(255),
  product_promise TEXT,
  price DECIMAL(10,2),
  currency VARCHAR(10) DEFAULT 'BRL',
  is_cloaker BOOLEAN DEFAULT false,
  cloaker_type VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.offer_funnel_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view offer_funnel_steps in workspace"
  ON public.offer_funnel_steps FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert offer_funnel_steps in workspace"
  ON public.offer_funnel_steps FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update offer_funnel_steps in workspace"
  ON public.offer_funnel_steps FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete offer_funnel_steps in workspace"
  ON public.offer_funnel_steps FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE INDEX idx_offer_funnel_offer ON public.offer_funnel_steps(spied_offer_id);

-- ============================================
-- 6. ENHANCE AD CREATIVES
-- ============================================

ALTER TABLE public.ad_creatives
  ADD COLUMN IF NOT EXISTS spied_offer_id UUID REFERENCES public.spied_offers(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS discovery_source VARCHAR(100),
  ADD COLUMN IF NOT EXISTS discovery_query TEXT,
  ADD COLUMN IF NOT EXISTS library_id UUID REFERENCES public.offer_ad_libraries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS ad_library_id_external VARCHAR(255);
