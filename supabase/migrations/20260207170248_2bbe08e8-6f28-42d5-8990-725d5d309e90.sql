
-- ============================================
-- AVATARES TABLE
-- ============================================
CREATE TABLE public.avatares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES public.ofertas(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  versao INT DEFAULT 1,
  demographics JSONB,
  pain_matrix JSONB NOT NULL DEFAULT '[]'::jsonb,
  desire_matrix JSONB NOT NULL DEFAULT '[]'::jsonb,
  objecoes JSONB,
  linguagem_avatar TEXT,
  gatilhos_emocionais JSONB,
  estado_atual TEXT,
  estado_desejado TEXT,
  search_1_framework JSONB,
  notas TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESEARCH NOTES TABLE
-- ============================================
CREATE TABLE public.research_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oferta_id UUID REFERENCES public.ofertas(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  tipo VARCHAR(50),
  source_url TEXT,
  content TEXT NOT NULL,
  insights JSONB,
  tags JSONB,
  relevance_score INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RLS: AVATARES
-- ============================================
ALTER TABLE public.avatares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view avatares in their workspace"
  ON public.avatares FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert avatares in their workspace"
  ON public.avatares FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update avatares in their workspace"
  ON public.avatares FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete avatares in their workspace"
  ON public.avatares FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- RLS: RESEARCH NOTES
-- ============================================
ALTER TABLE public.research_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view research_notes in workspace"
  ON public.research_notes FOR SELECT
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users insert research_notes in workspace"
  ON public.research_notes FOR INSERT
  WITH CHECK (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users update research_notes in workspace"
  ON public.research_notes FOR UPDATE
  USING (is_workspace_member(auth.uid(), workspace_id));

CREATE POLICY "Users delete research_notes in workspace"
  ON public.research_notes FOR DELETE
  USING (is_workspace_member(auth.uid(), workspace_id));

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_avatares_oferta ON public.avatares(oferta_id);
CREATE INDEX idx_avatares_workspace ON public.avatares(workspace_id);
CREATE INDEX idx_research_notes_oferta ON public.research_notes(oferta_id);
CREATE INDEX idx_research_notes_workspace ON public.research_notes(workspace_id);
CREATE INDEX idx_research_notes_relevance ON public.research_notes(relevance_score DESC);

-- ============================================
-- TRIGGER
-- ============================================
CREATE TRIGGER update_avatares_updated_at
  BEFORE UPDATE ON public.avatares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
