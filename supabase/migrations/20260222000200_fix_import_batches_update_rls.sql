-- ============================================================
-- FIX B1: Add UPDATE RLS policy on import_batches
-- Without this, useUpdateImportJob calls fail silently
-- (Conditional — import_batches may not exist in remote)
-- ============================================================

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'import_batches') THEN
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
  END IF;
END $$;
