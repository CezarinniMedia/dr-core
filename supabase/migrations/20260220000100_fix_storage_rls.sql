-- BD-0.1: Fix Storage RLS Policies + Add RLS to Legacy Tables
-- Date: 2026-02-20
-- Fix overly permissive storage policies from migration 20260209004023
-- Restore workspace-scoped isolation for spy-assets, creatives, documents
-- Also adds RLS to 6 legacy tables missing policies

-- ============================================
-- STORAGE BUCKET POLICIES - Restore Workspace Scoping
-- ============================================

-- Drop overly permissive policies (from 20260209004023)
DROP POLICY IF EXISTS "Authenticated users can upload spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload creatives" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- Drop any previous workspace-scoped policies (idempotent re-run)
DROP POLICY IF EXISTS "Users can upload spy assets to own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can read spy assets from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can update spy assets in own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete spy assets from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload creatives to own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can read creatives from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can update creatives in own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete creatives from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload documents to own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can read documents from own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can update documents in own workspace" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents from own workspace" ON storage.objects;

-- ============================================
-- SPY-ASSETS BUCKET - Workspace-Scoped
-- Convention: {workspace_id}/{rest_of_path}
-- ============================================

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

-- ============================================
-- CREATIVES BUCKET - Workspace-Scoped
-- ============================================

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

-- ============================================
-- DOCUMENTS BUCKET - Workspace-Scoped
-- ============================================

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

-- ============================================
-- LEGACY TABLE RLS - Add Missing Policies
-- ============================================

-- arsenal_dorks
ALTER TABLE arsenal_dorks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view arsenal_dorks from own workspace" ON arsenal_dorks;
DROP POLICY IF EXISTS "Users can insert arsenal_dorks in own workspace" ON arsenal_dorks;
DROP POLICY IF EXISTS "Users can update arsenal_dorks in own workspace" ON arsenal_dorks;
DROP POLICY IF EXISTS "Users can delete arsenal_dorks in own workspace" ON arsenal_dorks;

CREATE POLICY "Users can view arsenal_dorks from own workspace"
ON arsenal_dorks FOR SELECT TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert arsenal_dorks in own workspace"
ON arsenal_dorks FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update arsenal_dorks in own workspace"
ON arsenal_dorks FOR UPDATE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete arsenal_dorks in own workspace"
ON arsenal_dorks FOR DELETE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

-- arsenal_footprints
ALTER TABLE arsenal_footprints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view arsenal_footprints from own workspace" ON arsenal_footprints;
DROP POLICY IF EXISTS "Users can insert arsenal_footprints in own workspace" ON arsenal_footprints;
DROP POLICY IF EXISTS "Users can update arsenal_footprints in own workspace" ON arsenal_footprints;
DROP POLICY IF EXISTS "Users can delete arsenal_footprints in own workspace" ON arsenal_footprints;

CREATE POLICY "Users can view arsenal_footprints from own workspace"
ON arsenal_footprints FOR SELECT TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert arsenal_footprints in own workspace"
ON arsenal_footprints FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update arsenal_footprints in own workspace"
ON arsenal_footprints FOR UPDATE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete arsenal_footprints in own workspace"
ON arsenal_footprints FOR DELETE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

-- arsenal_keywords
ALTER TABLE arsenal_keywords ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view arsenal_keywords from own workspace" ON arsenal_keywords;
DROP POLICY IF EXISTS "Users can insert arsenal_keywords in own workspace" ON arsenal_keywords;
DROP POLICY IF EXISTS "Users can update arsenal_keywords in own workspace" ON arsenal_keywords;
DROP POLICY IF EXISTS "Users can delete arsenal_keywords in own workspace" ON arsenal_keywords;

CREATE POLICY "Users can view arsenal_keywords from own workspace"
ON arsenal_keywords FOR SELECT TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert arsenal_keywords in own workspace"
ON arsenal_keywords FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update arsenal_keywords in own workspace"
ON arsenal_keywords FOR UPDATE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete arsenal_keywords in own workspace"
ON arsenal_keywords FOR DELETE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

-- comparacao_batches
ALTER TABLE comparacao_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view comparacao_batches from own workspace" ON comparacao_batches;
DROP POLICY IF EXISTS "Users can insert comparacao_batches in own workspace" ON comparacao_batches;
DROP POLICY IF EXISTS "Users can update comparacao_batches in own workspace" ON comparacao_batches;
DROP POLICY IF EXISTS "Users can delete comparacao_batches in own workspace" ON comparacao_batches;

CREATE POLICY "Users can view comparacao_batches from own workspace"
ON comparacao_batches FOR SELECT TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert comparacao_batches in own workspace"
ON comparacao_batches FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update comparacao_batches in own workspace"
ON comparacao_batches FOR UPDATE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete comparacao_batches in own workspace"
ON comparacao_batches FOR DELETE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

-- import_batches
ALTER TABLE import_batches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view import_batches from own workspace" ON import_batches;
DROP POLICY IF EXISTS "Users can insert import_batches in own workspace" ON import_batches;
DROP POLICY IF EXISTS "Users can delete import_batches in own workspace" ON import_batches;

CREATE POLICY "Users can view import_batches from own workspace"
ON import_batches FOR SELECT TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert import_batches in own workspace"
ON import_batches FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete import_batches in own workspace"
ON import_batches FOR DELETE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

-- trafego_historico
ALTER TABLE trafego_historico ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view trafego_historico from own workspace" ON trafego_historico;
DROP POLICY IF EXISTS "Users can insert trafego_historico in own workspace" ON trafego_historico;
DROP POLICY IF EXISTS "Users can update trafego_historico in own workspace" ON trafego_historico;
DROP POLICY IF EXISTS "Users can delete trafego_historico in own workspace" ON trafego_historico;

CREATE POLICY "Users can view trafego_historico from own workspace"
ON trafego_historico FOR SELECT TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can insert trafego_historico in own workspace"
ON trafego_historico FOR INSERT TO authenticated
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update trafego_historico in own workspace"
ON trafego_historico FOR UPDATE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete trafego_historico in own workspace"
ON trafego_historico FOR DELETE TO authenticated
USING (workspace_id IN (
  SELECT workspace_id FROM public.workspace_members WHERE user_id = auth.uid()
));
