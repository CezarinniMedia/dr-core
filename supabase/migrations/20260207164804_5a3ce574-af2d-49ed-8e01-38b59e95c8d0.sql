
-- ============================================
-- OFERTAS TABLE
-- ============================================
CREATE TABLE public.ofertas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  vertical VARCHAR(50),
  mercado VARCHAR(50),
  status VARCHAR(50) DEFAULT 'RESEARCH',
  ticket_front DECIMAL(10,2),
  aov_target DECIMAL(10,2),
  cpa_target DECIMAL(10,2),
  roas_target DECIMAL(5,2),
  promessa_principal TEXT,
  mecanismo_unico TEXT,
  data_lancamento DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(workspace_id, slug)
);

CREATE INDEX idx_ofertas_workspace ON public.ofertas(workspace_id);
CREATE INDEX idx_ofertas_status ON public.ofertas(status);

-- Trigger for updated_at
CREATE TRIGGER update_ofertas_updated_at
  BEFORE UPDATE ON public.ofertas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.ofertas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view ofertas in their workspace"
  ON public.ofertas FOR SELECT
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert ofertas in their workspace"
  ON public.ofertas FOR INSERT
  WITH CHECK (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update ofertas in their workspace"
  ON public.ofertas FOR UPDATE
  USING (public.is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete ofertas in their workspace"
  ON public.ofertas FOR DELETE
  USING (public.is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- FUNNEL STEPS TABLE
-- ============================================
CREATE TABLE public.funnel_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID NOT NULL REFERENCES public.ofertas(id) ON DELETE CASCADE,
  step_order INT NOT NULL,
  step_type VARCHAR(50),
  nome VARCHAR(255),
  preco DECIMAL(10,2),
  url_page TEXT,
  descricao TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_funnel_steps_oferta ON public.funnel_steps(oferta_id);

ALTER TABLE public.funnel_steps ENABLE ROW LEVEL SECURITY;

-- Use security definer function to avoid recursion
CREATE OR REPLACE FUNCTION public.is_oferta_workspace_member(_user_id uuid, _oferta_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ofertas o
    JOIN public.workspace_members wm ON wm.workspace_id = o.workspace_id
    WHERE o.id = _oferta_id AND wm.user_id = _user_id
  )
$$;

CREATE POLICY "Users manage funnel_steps via oferta workspace"
  ON public.funnel_steps FOR SELECT
  USING (public.is_oferta_workspace_member(auth.uid(), oferta_id));

CREATE POLICY "Users insert funnel_steps via oferta workspace"
  ON public.funnel_steps FOR INSERT
  WITH CHECK (public.is_oferta_workspace_member(auth.uid(), oferta_id));

CREATE POLICY "Users update funnel_steps via oferta workspace"
  ON public.funnel_steps FOR UPDATE
  USING (public.is_oferta_workspace_member(auth.uid(), oferta_id));

CREATE POLICY "Users delete funnel_steps via oferta workspace"
  ON public.funnel_steps FOR DELETE
  USING (public.is_oferta_workspace_member(auth.uid(), oferta_id));

-- ============================================
-- OFERTAS BRIEF TABLE
-- ============================================
CREATE TABLE public.ofertas_brief (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID NOT NULL REFERENCES public.ofertas(id) ON DELETE CASCADE UNIQUE,
  publico_alvo TEXT,
  dores_principais JSONB,
  desejos_principais JSONB,
  objecoes_principais JSONB,
  angulos_testados JSONB,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ofertas_brief ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage brief via oferta workspace"
  ON public.ofertas_brief FOR SELECT
  USING (public.is_oferta_workspace_member(auth.uid(), oferta_id));

CREATE POLICY "Users insert brief via oferta workspace"
  ON public.ofertas_brief FOR INSERT
  WITH CHECK (public.is_oferta_workspace_member(auth.uid(), oferta_id));

CREATE POLICY "Users update brief via oferta workspace"
  ON public.ofertas_brief FOR UPDATE
  USING (public.is_oferta_workspace_member(auth.uid(), oferta_id));

CREATE POLICY "Users delete brief via oferta workspace"
  ON public.ofertas_brief FOR DELETE
  USING (public.is_oferta_workspace_member(auth.uid(), oferta_id));
