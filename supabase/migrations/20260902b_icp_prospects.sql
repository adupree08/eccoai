-- eccoai: ICP prospect list (2026-09-02 b)
-- Admin-only. Profiles scraped via HarvestAPI LinkedIn Profile Search, used to
-- build a target list for connection requests and outreach. NOT visible to
-- regular users. LinkedIn scraping is against LinkedIn ToS; admin research use
-- only, per explicit choice.

CREATE TABLE IF NOT EXISTS icp_prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT NOT NULL DEFAULT 'apify',
  external_id TEXT,                 -- de-dupe key (profile url / id)
  full_name TEXT,
  headline TEXT,
  profile_url TEXT,
  location TEXT,
  current_title TEXT,
  current_company TEXT,
  email TEXT,
  icp_label TEXT,                   -- which ICP search this came from
  status TEXT NOT NULL DEFAULT 'new', -- new | requested | connected | skipped
  notes TEXT,
  raw JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_icp_prospects_external
  ON icp_prospects(source, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_icp_prospects_status ON icp_prospects(status);

ALTER TABLE icp_prospects ENABLE ROW LEVEL SECURITY;

-- Admin-only: no normal user can read or write the prospect list.
DROP POLICY IF EXISTS "Admins manage icp prospects" ON icp_prospects;
CREATE POLICY "Admins manage icp prospects" ON icp_prospects
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin));
