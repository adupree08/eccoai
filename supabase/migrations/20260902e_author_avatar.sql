-- eccoai: store the post author's profile photo URL (2026-09-02 e)
-- Rendered on the Popular Posts cards (falls back to initials if missing).
ALTER TABLE popular_posts ADD COLUMN IF NOT EXISTS author_avatar TEXT;
