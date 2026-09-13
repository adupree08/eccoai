-- eccoai Audiences migration (2026-09-13)
-- Run this in the Supabase SQL Editor. Safe to run once.
-- A saved, reusable definition of WHO the user wants to reach and WHAT they
-- talk about. Used by Comments discovery (who + what matching), reusable later
-- by prospecting.

CREATE TABLE IF NOT EXISTS audiences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,                                 -- plain-English business/audience description
  watch_words TEXT[] NOT NULL DEFAULT '{}',         -- topics to find posts about
  skip_words TEXT[] NOT NULL DEFAULT '{}',          -- skip posts mentioning these
  titles TEXT[] NOT NULL DEFAULT '{}',              -- customer job titles to match on
  industries TEXT[] NOT NULL DEFAULT '{}',          -- customer industries to match on
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audiences_user_id ON audiences(user_id);

ALTER TABLE audiences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own audiences" ON audiences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own audiences" ON audiences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own audiences" ON audiences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own audiences" ON audiences FOR DELETE USING (auth.uid() = user_id);

-- Track which audience produced each queued comment.
ALTER TABLE comment_queue ADD COLUMN IF NOT EXISTS audience_id UUID REFERENCES audiences(id) ON DELETE SET NULL;
