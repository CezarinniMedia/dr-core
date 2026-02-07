
-- ============================================
-- COMPETITORS TABLE
-- ============================================
CREATE TABLE public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  oferta_id UUID REFERENCES public.ofertas(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  dominio VARCHAR(255),
  vertical VARCHAR(50),
  status_tracking VARCHAR(50) DEFAULT 'WARM',
  last_active_date DATE,
  traffic_score INT,
  estimated_monthly_revenue DECIMAL(12,2),
  fb_page_url TEXT,
  ig_handle VARCHAR(255),
  tiktok_handle VARCHAR(255),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- AD CREATIVES TABLE
-- ============================================
CREATE TABLE public.ad_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  tipo VARCHAR(50) NOT NULL,
  copy_headline TEXT,
  copy_body TEXT,
  cta_text VARCHAR(255),
  file_url TEXT NOT NULL,
  thumbnail_url TEXT,
  platform VARCHAR(50) NOT NULL,
  first_seen DATE NOT NULL,
  last_seen DATE,
  status VARCHAR(50) DEFAULT 'ATIVO',
  tags JSONB,
  angulo VARCHAR(100),
  likes INT,
  comments INT,
  shares INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FUNNEL MAPS TABLE
-- ============================================
CREATE TABLE public.funnel_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  aov_estimate DECIMAL(10,2),
  checkout_provider VARCHAR(100),
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS: COMPETITORS
-- ============================================
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view competitors in workspace"
  ON public.competitors FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert competitors in workspace"
  ON public.competitors FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update competitors in workspace"
  ON public.competitors FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete competitors in workspace"
  ON public.competitors FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- RLS: AD CREATIVES
-- ============================================
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view ad_creatives in workspace"
  ON public.ad_creatives FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert ad_creatives in workspace"
  ON public.ad_creatives FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update ad_creatives in workspace"
  ON public.ad_creatives FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete ad_creatives in workspace"
  ON public.ad_creatives FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- RLS: FUNNEL MAPS
-- ============================================
ALTER TABLE public.funnel_maps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view funnel_maps in workspace"
  ON public.funnel_maps FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert funnel_maps in workspace"
  ON public.funnel_maps FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update funnel_maps in workspace"
  ON public.funnel_maps FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete funnel_maps in workspace"
  ON public.funnel_maps FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_competitors_workspace ON public.competitors(workspace_id);
CREATE INDEX idx_competitors_status ON public.competitors(status_tracking);
CREATE INDEX idx_competitors_vertical ON public.competitors(vertical);
CREATE INDEX idx_ad_creatives_competitor ON public.ad_creatives(competitor_id);
CREATE INDEX idx_ad_creatives_workspace ON public.ad_creatives(workspace_id);
CREATE INDEX idx_ad_creatives_platform ON public.ad_creatives(platform);
CREATE INDEX idx_ad_creatives_status ON public.ad_creatives(status);
CREATE INDEX idx_funnel_maps_competitor ON public.funnel_maps(competitor_id);
CREATE INDEX idx_funnel_maps_workspace ON public.funnel_maps(workspace_id);

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_competitors_updated_at
  BEFORE UPDATE ON public.competitors
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_funnel_maps_updated_at
  BEFORE UPDATE ON public.funnel_maps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
