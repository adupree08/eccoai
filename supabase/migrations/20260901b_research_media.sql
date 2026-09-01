-- eccoai research + media migration (2026-09-01 b)
-- Adds: admin role, post images, Apify-sourced popular posts, learned
-- writing structures, and a storage bucket for post images.

-- ============================================================
-- 1. Admin role (server-enforced, not just client-side)
-- ============================================================
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;
-- Grant yourself admin after running this:
--   UPDATE profiles SET is_admin = true WHERE email = 'aujena.dupree@gmail.com';

-- ============================================================
-- 2. Post images
-- ============================================================
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ============================================================
-- 3. Popular posts (admin research via Apify; readable by all users
--    so the dashboard can show "what's working")
-- ============================================================
CREATE TABLE IF NOT EXISTS popular_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'apify',
  external_id TEXT,                 -- de-dupe key from the scraper
  author_name TEXT,
  author_headline TEXT,
  post_url TEXT,
  content TEXT NOT NULL,
  vertical TEXT,                    -- the niche this was pulled for
  keywords TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  reposts INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_posts_external
  ON popular_posts(source, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_popular_posts_vertical ON popular_posts(vertical);

ALTER TABLE popular_posts ENABLE ROW LEVEL SECURITY;

-- Any signed-in user can read the popular feed.
DROP POLICY IF EXISTS "Authenticated can read popular posts" ON popular_posts;
CREATE POLICY "Authenticated can read popular posts" ON popular_posts
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only admins can write research data.
DROP POLICY IF EXISTS "Admins manage popular posts" ON popular_posts;
CREATE POLICY "Admins manage popular posts" ON popular_posts
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- ============================================================
-- 4. Learned writing structures (semi-automated, admin-approved)
-- ============================================================
CREATE TABLE IF NOT EXISTS post_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,               -- e.g. "Contrarian hook + 3 proof points"
  description TEXT NOT NULL,        -- the reusable instruction injected into prompts
  hook_type TEXT,
  example TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE post_structures ENABLE ROW LEVEL SECURITY;

-- All users benefit from approved structures at generation time.
DROP POLICY IF EXISTS "Authenticated read approved structures" ON post_structures;
CREATE POLICY "Authenticated read approved structures" ON post_structures
  FOR SELECT USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage structures" ON post_structures;
CREATE POLICY "Admins manage structures" ON post_structures
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));

-- ============================================================
-- 5. Storage bucket for post images (public read, per-user write)
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

-- Users can manage only their own folder: post-images/{user_id}/...
DROP POLICY IF EXISTS "Users read post images" ON storage.objects;
CREATE POLICY "Users read post images" ON storage.objects
  FOR SELECT USING (bucket_id = 'post-images');

DROP POLICY IF EXISTS "Users upload own post images" ON storage.objects;
CREATE POLICY "Users upload own post images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users delete own post images" ON storage.objects;
CREATE POLICY "Users delete own post images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'post-images' AND (storage.foldername(name))[1] = auth.uid()::text
  );
