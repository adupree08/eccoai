-- eccoai LinkedIn scheduling + auto-post migration (2026-09-05)
-- Run this in the Supabase SQL Editor. Safe to run once.
-- Adds: linkedin_connections (per-user OAuth tokens, server-only) and
-- publish bookkeeping columns on posts.

-- ============================================================
-- 1. LinkedIn connections (one per user)
-- ============================================================
-- Tokens are sensitive. RLS is ENABLED with NO policies, so the browser
-- (anon/authenticated) can never read this table. Every read/write goes
-- through server routes using the service role key. Tokens are also stored
-- encrypted (AES-256-GCM) by the app before insert.
CREATE TABLE IF NOT EXISTS linkedin_connections (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,        -- encrypted
  refresh_token TEXT,                -- encrypted
  expires_at TIMESTAMPTZ,
  member_urn TEXT NOT NULL,          -- e.g. the OpenID "sub" / person id
  member_name TEXT,
  scope TEXT,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE linkedin_connections ENABLE ROW LEVEL SECURITY;
-- Intentionally no policies: service-role-only access keeps tokens off the client.

-- ============================================================
-- 2. Posts: publish bookkeeping
-- ============================================================
-- publish_error records the last failure reason; publish_attempts lets the
-- scheduler retry a few times before giving up (then it drops back to draft).
ALTER TABLE posts ADD COLUMN IF NOT EXISTS publish_error TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS publish_attempts INT DEFAULT 0;

-- Helps the scheduler find due posts quickly.
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_due ON posts(scheduled_at) WHERE status = 'scheduled';
