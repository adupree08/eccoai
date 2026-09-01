-- eccoai launch features migration (2026-09-01)
-- Run this in the Supabase SQL Editor. Safe to run once.
-- Adds: content pillars, kanban statuses, post->pillar link,
-- product feedback, and closes RLS/policy gaps on articles.

-- ============================================================
-- 1. Content pillars (per-user themes for posts)
-- ============================================================
CREATE TABLE IF NOT EXISTS content_pillars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#2563eb',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_pillars_user_id ON content_pillars(user_id);

ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own pillars" ON content_pillars;
CREATE POLICY "Users can view their own pillars" ON content_pillars
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own pillars" ON content_pillars;
CREATE POLICY "Users can insert their own pillars" ON content_pillars
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own pillars" ON content_pillars;
CREATE POLICY "Users can update their own pillars" ON content_pillars
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own pillars" ON content_pillars;
CREATE POLICY "Users can delete their own pillars" ON content_pillars
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 2. Posts: kanban statuses + pillar link
-- ============================================================
-- Expand the status pipeline for the kanban board.
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_status_check;
ALTER TABLE posts ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE posts ADD CONSTRAINT posts_status_check
  CHECK (status IN ('idea', 'draft', 'ready', 'revisions', 'scheduled', 'published'));

-- Allow the source types the app actually creates (adds 'comment').
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_source_type_check;
ALTER TABLE posts ADD CONSTRAINT posts_source_type_check
  CHECK (source_type IN ('idea', 'url', 'rss', 'comment'));

-- Link a post to a pillar (nullable = "None").
ALTER TABLE posts ADD COLUMN IF NOT EXISTS pillar_id UUID
  REFERENCES content_pillars(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_posts_pillar_id ON posts(pillar_id);

-- ============================================================
-- 3. Articles: close the RLS gaps found in audit
--    (SELECT/INSERT existed; UPDATE/DELETE did not, so refresh
--     silently no-oped). Add them, scoped through feed ownership.
-- ============================================================
DROP POLICY IF EXISTS "Users can update articles from own feeds" ON articles;
CREATE POLICY "Users can update articles from own feeds" ON articles
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM feeds WHERE feeds.id = articles.feed_id AND feeds.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete articles from own feeds" ON articles;
CREATE POLICY "Users can delete articles from own feeds" ON articles
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM feeds WHERE feeds.id = articles.feed_id AND feeds.user_id = auth.uid())
  );

-- Enables upsert-on-refresh instead of delete-then-insert (prevents dup articles
-- and stops saved/hidden article rows from cascade-deleting on refresh).
CREATE UNIQUE INDEX IF NOT EXISTS idx_articles_feed_url ON articles(feed_id, url);

-- ============================================================
-- 4. Product feedback (separate from the AI post-refinement loop)
-- ============================================================
CREATE TABLE IF NOT EXISTS product_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'other' CHECK (type IN ('bug', 'feature', 'other')),
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_feedback_user_id ON product_feedback(user_id);

ALTER TABLE product_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own feedback" ON product_feedback;
CREATE POLICY "Users can view their own feedback" ON product_feedback
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can submit feedback" ON product_feedback;
CREATE POLICY "Users can submit feedback" ON product_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- updated_at trigger for content_pillars (reuses existing function)
DROP TRIGGER IF EXISTS update_content_pillars_updated_at ON content_pillars;
CREATE TRIGGER update_content_pillars_updated_at
  BEFORE UPDATE ON content_pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
