-- ============================================================
-- FIX B1: Add UPDATE RLS policy on import_batches
-- Without this, useUpdateImportJob calls fail silently
-- ============================================================

CREATE POLICY "Users can update import_batches in their workspace"
  ON import_batches
  FOR UPDATE
  USING (
    workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );
