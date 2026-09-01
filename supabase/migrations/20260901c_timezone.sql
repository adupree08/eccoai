-- Per-user timezone for scheduling (2026-09-01 c)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT;
