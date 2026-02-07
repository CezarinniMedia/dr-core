
-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('creatives', 'creatives', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('spy-assets', 'spy-assets', false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- STORAGE POLICIES
-- ============================================

-- Avatars: upload own, public read
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Creatives: workspace-scoped
CREATE POLICY "Users can upload creatives to own workspace"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view creatives from own workspace"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete creatives from own workspace"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Spy-assets: workspace-scoped
CREATE POLICY "Users can upload spy-assets to own workspace"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view spy-assets from own workspace"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete spy-assets from own workspace"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- Documents: workspace-scoped
CREATE POLICY "Users can upload documents to own workspace"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view documents from own workspace"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents from own workspace"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] IN (
    SELECT workspace_id::text FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- ============================================
-- APP LOGS TABLE
-- ============================================
CREATE TABLE public.app_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  level VARCHAR(20) NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  stack_trace TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_app_logs_level ON public.app_logs(level);
CREATE INDEX idx_app_logs_user ON public.app_logs(user_id);
CREATE INDEX idx_app_logs_created_at ON public.app_logs(created_at DESC);

ALTER TABLE public.app_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own logs"
  ON public.app_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own logs"
  ON public.app_logs FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- ============================================
-- ANALYTICS EVENTS TABLE
-- ============================================
CREATE TABLE public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  workspace_id UUID REFERENCES public.workspaces(id) ON DELETE CASCADE,
  event_name VARCHAR(100) NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_workspace ON public.analytics_events(workspace_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at DESC);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view analytics from own workspace"
  ON public.analytics_events FOR SELECT
  USING (
    public.is_workspace_member(auth.uid(), workspace_id)
  );

CREATE POLICY "Users can insert analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    public.is_workspace_member(auth.uid(), workspace_id)
  );
