-- eccoai: curated Popular Posts (2026-09-02)
-- Scraped posts land in popular_posts as a private research pool (featured=false).
-- The admin explicitly promotes chosen posts to the public "Popular Posts" page
-- by setting featured=true. Users only ever see featured posts.

-- ============================================================
-- 1. Featured flag
-- ============================================================
ALTER TABLE popular_posts ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE popular_posts ADD COLUMN IF NOT EXISTS featured_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_popular_posts_featured
  ON popular_posts(featured, featured_at DESC) WHERE featured = true;

-- ============================================================
-- 2. Read policy: signed-in users see ONLY featured posts.
--    Admins keep full read/write via the existing "Admins manage" policy
--    (policies are OR'd, so admins still see everything).
-- ============================================================
DROP POLICY IF EXISTS "Authenticated can read popular posts" ON popular_posts;
CREATE POLICY "Users read featured popular posts" ON popular_posts
  FOR SELECT USING (auth.uid() IS NOT NULL AND featured = true);
