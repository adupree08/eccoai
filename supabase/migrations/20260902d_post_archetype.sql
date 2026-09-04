-- eccoai: post archetype tag (2026-09-02 d)
-- One structural label per popular post (Story, List, Contrarian, How-To, ...),
-- assigned by AI at scrape time and shown as the pill on the Popular Posts page.
ALTER TABLE popular_posts ADD COLUMN IF NOT EXISTS archetype TEXT;
