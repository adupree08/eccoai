-- eccoai Idea Vault migration (2026-09-05)
-- Run this in the Supabase SQL Editor. Safe to run once.
-- Adds: ideas table (per-user idea vault) + tag columns on saved_articles.
--
-- Ideas come from three sources:
--   'research' = a post saved from Popular Posts (raw snapshot kept)
--   'ai'       = generated from the user's content pillars (starts 'suggested')
--   'manual'   = a note the user jotted themselves
-- The vault shows status='approved'; AI candidates wait in 'suggested'.

-- ============================================================
-- 1. Ideas (per-user idea vault)
-- ============================================================
CREATE TABLE IF NOT EXISTS ideas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('research', 'ai', 'manual')),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('suggested', 'approved')),

  -- Idea content
  title TEXT,            -- short hook / label
  body TEXT,             -- the idea text (AI/manual) or a summary
  angle TEXT,            -- the user's "my take" note for a saved post

  -- Tag: a content pillar, or a freeform label when the user picks "Other"
  pillar_id UUID REFERENCES content_pillars(id) ON DELETE SET NULL,
  tag TEXT,

  -- Snapshot of the original saved post (kept so the idea survives if the
  -- source popular_posts row is later deleted)
  source_popular_post_id UUID REFERENCES popular_posts(id) ON DELETE SET NULL,
  source_author TEXT,
  source_avatar TEXT,
  source_content TEXT,
  source_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ideas_user_id ON ideas(user_id);
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_source ON ideas(source);
CREATE INDEX IF NOT EXISTS idx_ideas_pillar_id ON ideas(pillar_id);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

-- New table, so no existing policies to drop.
CREATE POLICY "Users can view their own ideas" ON ideas
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own ideas" ON ideas
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ideas" ON ideas
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ideas" ON ideas
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 2. Saved articles: same tagging as ideas (pillar or "Other")
-- ============================================================
ALTER TABLE saved_articles ADD COLUMN IF NOT EXISTS pillar_id UUID
  REFERENCES content_pillars(id) ON DELETE SET NULL;
ALTER TABLE saved_articles ADD COLUMN IF NOT EXISTS tag TEXT;
CREATE INDEX IF NOT EXISTS idx_saved_articles_pillar_id ON saved_articles(pillar_id);
