-- =============================================================
-- Add RLS to Legacy Tables
-- Story: BD-0.1 | Sprint: 0 | Priority: ALTA
-- =============================================================
-- 6 legacy tables have workspace_id but NO RLS policies.
-- Users can query data from other workspaces.
-- =============================================================

-- =============================================================
-- 1. arsenal_dorks
-- =============================================================
ALTER TABLE arsenal_dorks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace arsenal_dorks"
ON arsenal_dorks FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create arsenal_dorks in own workspace"
ON arsenal_dorks FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update arsenal_dorks in own workspace"
ON arsenal_dorks FOR UPDATE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete arsenal_dorks in own workspace"
ON arsenal_dorks FOR DELETE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

-- =============================================================
-- 2. arsenal_footprints
-- =============================================================
ALTER TABLE arsenal_footprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace arsenal_footprints"
ON arsenal_footprints FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create arsenal_footprints in own workspace"
ON arsenal_footprints FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update arsenal_footprints in own workspace"
ON arsenal_footprints FOR UPDATE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete arsenal_footprints in own workspace"
ON arsenal_footprints FOR DELETE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

-- =============================================================
-- 3. arsenal_keywords
-- =============================================================
ALTER TABLE arsenal_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace arsenal_keywords"
ON arsenal_keywords FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create arsenal_keywords in own workspace"
ON arsenal_keywords FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update arsenal_keywords in own workspace"
ON arsenal_keywords FOR UPDATE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete arsenal_keywords in own workspace"
ON arsenal_keywords FOR DELETE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

-- =============================================================
-- 4. comparacao_batches
-- =============================================================
ALTER TABLE comparacao_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace comparacao_batches"
ON comparacao_batches FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create comparacao_batches in own workspace"
ON comparacao_batches FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update comparacao_batches in own workspace"
ON comparacao_batches FOR UPDATE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete comparacao_batches in own workspace"
ON comparacao_batches FOR DELETE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

-- =============================================================
-- 5. import_batches
-- =============================================================
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace import_batches"
ON import_batches FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create import_batches in own workspace"
ON import_batches FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update import_batches in own workspace"
ON import_batches FOR UPDATE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete import_batches in own workspace"
ON import_batches FOR DELETE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

-- =============================================================
-- 6. trafego_historico
-- =============================================================
ALTER TABLE trafego_historico ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace trafego_historico"
ON trafego_historico FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create trafego_historico in own workspace"
ON trafego_historico FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update trafego_historico in own workspace"
ON trafego_historico FOR UPDATE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete trafego_historico in own workspace"
ON trafego_historico FOR DELETE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
));
