-- User-facing template library (2026-09-01 d)
-- Turns post_structures into a browsable library: admin-approved GLOBAL
-- templates (user_id IS NULL) plus each user's OWN templates. Adds a
-- tokenized skeleton so templates render as fill-in-the-blank previews.

ALTER TABLE post_structures ADD COLUMN IF NOT EXISTS user_id UUID
  REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE post_structures ADD COLUMN IF NOT EXISTS skeleton TEXT;
CREATE INDEX IF NOT EXISTS idx_post_structures_user ON post_structures(user_id);

-- Replace the old "any authed user reads everything" policy with a scoped one:
-- read approved global templates, your own templates, or anything if admin.
DROP POLICY IF EXISTS "Authenticated read approved structures" ON post_structures;
CREATE POLICY "Read own or approved global structures" ON post_structures
  FOR SELECT USING (
    (approved AND user_id IS NULL)
    OR user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin)
  );

-- Users manage their OWN templates (admins keep the separate "manage all" policy).
DROP POLICY IF EXISTS "Users insert own structures" ON post_structures;
CREATE POLICY "Users insert own structures" ON post_structures
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users update own structures" ON post_structures;
CREATE POLICY "Users update own structures" ON post_structures
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users delete own structures" ON post_structures;
CREATE POLICY "Users delete own structures" ON post_structures
  FOR DELETE USING (user_id = auth.uid());
