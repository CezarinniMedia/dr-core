-- =============================================================
-- Fix Storage RLS Policies - Restore Workspace Isolation
-- Story: BD-0.1 | Sprint: 0 | Priority: BLOQUEANTE
-- =============================================================
-- Migration 20260209004023 replaced workspace-scoped RLS with
-- overly-permissive "authenticated users" policies. Any
-- authenticated user could access files from ANY workspace.
--
-- This migration:
--   1. Drops the permissive policies
--   2. Restores workspace-scoped policies using folder path
--      Convention: {workspace_id}/{rest_of_path}
-- =============================================================

-- STEP 1: Drop overly permissive policies for spy-assets
DROP POLICY IF EXISTS "Authenticated users can upload spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete spy assets" ON storage.objects;

-- STEP 2: Drop overly permissive policies for creatives
DROP POLICY IF EXISTS "Authenticated users can upload creatives" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete creatives" ON storage.objects;

-- STEP 3: Drop overly permissive policies for documents
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- =============================================================
-- STEP 4: Workspace-scoped RLS for SPY-ASSETS bucket
-- =============================================================

CREATE POLICY "Users can upload spy assets to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read spy assets from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update spy assets in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete spy assets from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- =============================================================
-- STEP 5: Workspace-scoped RLS for CREATIVES bucket
-- =============================================================

CREATE POLICY "Users can upload creatives to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read creatives from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update creatives in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete creatives from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- =============================================================
-- STEP 6: Workspace-scoped RLS for DOCUMENTS bucket
-- =============================================================

CREATE POLICY "Users can upload documents to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read documents from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents in own workspace"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);
