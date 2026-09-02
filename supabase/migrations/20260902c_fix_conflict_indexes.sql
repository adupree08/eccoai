-- eccoai: fix upsert ON CONFLICT (2026-09-02 c)
-- The original unique indexes were PARTIAL (WHERE external_id IS NOT NULL).
-- Postgres will not accept a plain ON CONFLICT (source, external_id) against a
-- partial index, so the research/ICP upserts failed with:
--   "there is no unique or exclusion constraint matching the ON CONFLICT spec"
-- Replace them with full unique indexes. NULL external_ids are treated as
-- distinct by Postgres, so rows without an id still insert without colliding.

DROP INDEX IF EXISTS idx_popular_posts_external;
CREATE UNIQUE INDEX IF NOT EXISTS idx_popular_posts_external ON popular_posts(source, external_id);

DROP INDEX IF EXISTS idx_icp_prospects_external;
CREATE UNIQUE INDEX IF NOT EXISTS idx_icp_prospects_external ON icp_prospects(source, external_id);
