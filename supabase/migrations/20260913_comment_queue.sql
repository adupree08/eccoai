-- eccoai Comment Queue migration (2026-09-13)
-- Run this in the Supabase SQL Editor. Safe to run once.
-- Adds comment_queue: per-user daily queue of ICP-matched LinkedIn posts with a
-- drafted comment in the user's voice. Assisted model: the user copies the
-- comment and posts it themselves (no auto-posting, no LinkedIn API needed).

CREATE TABLE IF NOT EXISTS comment_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Snapshot of the target post (kept so the card survives independent of any pool row)
  author_name TEXT,
  author_headline TEXT,
  author_avatar TEXT,
  post_url TEXT,
  post_content TEXT,

  -- The AI-drafted comment in the user's voice (editable)
  draft_comment TEXT,

  -- What search surfaced this post (topic/keywords)
  topic TEXT,

  -- pending = awaiting review, done = user posted it, skipped = dismissed
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'done', 'skipped')),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comment_queue_user_id ON comment_queue(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_queue_status ON comment_queue(status);
-- "Never the same post twice": one queue row per user per post URL.
CREATE UNIQUE INDEX IF NOT EXISTS idx_comment_queue_user_post ON comment_queue(user_id, post_url) WHERE post_url IS NOT NULL;

ALTER TABLE comment_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own comment queue" ON comment_queue
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own comment queue" ON comment_queue
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own comment queue" ON comment_queue
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comment queue" ON comment_queue
  FOR DELETE USING (auth.uid() = user_id);
