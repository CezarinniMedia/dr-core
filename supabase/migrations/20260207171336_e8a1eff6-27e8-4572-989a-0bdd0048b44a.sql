
-- ============================================
-- CRIATIVOS TABLE
-- ============================================
CREATE TABLE public.criativos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES public.ofertas(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  hook_text TEXT NOT NULL,
  copy_body TEXT,
  cta VARCHAR(255),
  shot_list JSONB,
  file_url TEXT,
  thumbnail_url TEXT,
  status VARCHAR(50) DEFAULT 'DRAFT',
  plataforma VARCHAR(50),
  tags JSONB,
  angulo VARCHAR(100),
  performance_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HOOKS TABLE
-- ============================================
CREATE TABLE public.hooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES public.ofertas(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  texto TEXT NOT NULL,
  angulo VARCHAR(100),
  status VARCHAR(50) DEFAULT 'DRAFT',
  performance_score INT,
  used_in_creative_id UUID REFERENCES public.criativos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS: CRIATIVOS
-- ============================================
ALTER TABLE public.criativos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view criativos in workspace"
  ON public.criativos FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert criativos in workspace"
  ON public.criativos FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update criativos in workspace"
  ON public.criativos FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete criativos in workspace"
  ON public.criativos FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- RLS: HOOKS
-- ============================================
ALTER TABLE public.hooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view hooks in workspace"
  ON public.hooks FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert hooks in workspace"
  ON public.hooks FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update hooks in workspace"
  ON public.hooks FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete hooks in workspace"
  ON public.hooks FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_criativos_oferta ON public.criativos(oferta_id);
CREATE INDEX idx_criativos_workspace ON public.criativos(workspace_id);
CREATE INDEX idx_criativos_status ON public.criativos(status);
CREATE INDEX idx_criativos_plataforma ON public.criativos(plataforma);
CREATE INDEX idx_hooks_oferta ON public.hooks(oferta_id);
CREATE INDEX idx_hooks_workspace ON public.hooks(workspace_id);
CREATE INDEX idx_hooks_angulo ON public.hooks(angulo);
CREATE INDEX idx_hooks_performance ON public.hooks(performance_score DESC);

-- ============================================
-- TRIGGER
-- ============================================
CREATE TRIGGER update_criativos_updated_at
  BEFORE UPDATE ON public.criativos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
