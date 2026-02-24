-- ============================================================
-- PHASE 5: SAVED VIEWS
-- Filtros salvos para SpyRadar e outros modulos
-- ============================================================

CREATE TABLE IF NOT EXISTS saved_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

  name TEXT NOT NULL,
  module TEXT NOT NULL DEFAULT 'spy'
    CHECK (module IN ('spy', 'offers', 'creatives', 'avatar')),

  -- Configuracao serializada
  filters JSONB DEFAULT '{}'::jsonb,
  sort_config JSONB DEFAULT '{}'::jsonb,
  visible_columns TEXT[] DEFAULT '{}',

  is_default BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_saved_views_workspace ON saved_views(workspace_id, module);

-- RLS
ALTER TABLE saved_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their workspace saved views"
  ON saved_views
  FOR ALL
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
  );

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_saved_views_updated_at
  BEFORE UPDATE ON saved_views
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Only one default per module per workspace
CREATE UNIQUE INDEX idx_saved_views_default
  ON saved_views(workspace_id, module)
  WHERE is_default = true;
