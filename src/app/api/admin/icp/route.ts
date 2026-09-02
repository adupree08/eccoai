import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";

// Admin-only. Runs the HarvestAPI "LinkedIn Profile Search" Apify actor to build
// an ICP prospect list (people to connect with / do outreach to). Stored in
// icp_prospects, which only admins can read. Only APIFY_TOKEN is needed.
//
// LinkedIn scraping is against LinkedIn ToS; admin research use only.
export const maxDuration = 60;

// Fixed actor — see https://apify.com/harvestapi/linkedin-profile-search
const ACTOR_ID = "harvestapi~linkedin-profile-search";

type ApifyItem = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function num(v: unknown): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseInt(v, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}
function firstString(item: ApifyItem, keys: string[]): string | null {
  for (const k of keys) {
    const val = str(item[k]);
    if (val) return val;
  }
  return null;
}
function asObject(v: unknown): ApifyItem {
  return v && typeof v === "object" ? (v as ApifyItem) : {};
}
function toArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}

export async function POST(request: Request) {
  const { isAdmin, supabase } = await getAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "ICP search is not configured. Add APIFY_TOKEN in Vercel, then redeploy." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const searchQuery: string = typeof body?.searchQuery === "string" ? body.searchQuery.trim() : "";
  const jobTitles = toArray(body?.jobTitles);
  const locations = toArray(body?.locations);
  const label: string = typeof body?.label === "string" && body.label.trim() ? body.label.trim() : searchQuery;
  const withEmail: boolean = body?.withEmail === true;
  const maxItems = Math.min(Math.max(num(body?.maxResults) || 25, 1), 100);

  if (!searchQuery && jobTitles.length === 0) {
    return NextResponse.json({ error: "A search query or job title is required." }, { status: 400 });
  }

  const actorInput: Record<string, unknown> = {
    profileScraperMode: withEmail ? "Full + email search" : "Full",
    maxItems,
    ...(searchQuery ? { searchQuery } : {}),
    ...(jobTitles.length ? { currentJobTitles: jobTitles } : {}),
    ...(locations.length ? { locations } : {}),
  };

  let items: ApifyItem[] = [];
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}&clean=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actorInput),
        signal: AbortSignal.timeout(55000),
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "The ICP actor did not run. Check your Apify token and that the actor is rented." },
        { status: 502 }
      );
    }
    items = (await res.json()) as ApifyItem[];
  } catch {
    return NextResponse.json(
      { error: "ICP search timed out or failed. Try fewer results." },
      { status: 504 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, note: "No profiles returned." });
  }

  const rows = items
    .map((it) => {
      const name =
        firstString(it, ["fullName", "name"]) ||
        [str(it.firstName), str(it.lastName)].filter(Boolean).join(" ") || null;
      const profileUrl = firstString(it, ["linkedinUrl", "publicProfileUrl", "profileUrl", "url"]);
      if (!name && !profileUrl) return null;

      // Current position may be nested.
      const experience = Array.isArray(it.experience) ? asObject(it.experience[0]) : {};
      const currentPosition = asObject(it.currentPosition);
      const company = asObject(it.company);
      const emails = Array.isArray(it.emails) ? it.emails : [];

      return {
        source: "apify",
        external_id: profileUrl || firstString(it, ["id", "publicIdentifier", "urn"]),
        full_name: name,
        headline: firstString(it, ["headline", "occupation", "subtitle"]),
        profile_url: profileUrl,
        location: firstString(it, ["location", "locationName", "geo"]),
        current_title:
          firstString(it, ["jobTitle", "title", "currentJobTitle"]) ||
          firstString(currentPosition, ["title"]) ||
          firstString(experience, ["title", "position"]),
        current_company:
          firstString(it, ["companyName", "currentCompany"]) ||
          firstString(currentPosition, ["companyName", "company"]) ||
          firstString(company, ["name"]) ||
          firstString(experience, ["companyName", "company"]),
        email:
          firstString(it, ["email", "workEmail"]) ||
          (emails.length ? str(typeof emails[0] === "string" ? emails[0] : asObject(emails[0]).email) : null),
        icp_label: label || null,
        status: "new",
        notes: null,
        raw: it,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // De-dupe within the batch: Postgres rejects an upsert touching the same
  // (source, external_id) twice. Rows without an external_id can't collide.
  const seen = new Set<string>();
  const deduped = rows.filter((r) => {
    if (!r.external_id) return true;
    const key = `${r.source}:${r.external_id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const { error: insErr } = await supabase
    .from("icp_prospects")
    .upsert(deduped, { onConflict: "source,external_id", ignoreDuplicates: false });

  if (insErr) {
    console.error("icp_prospects upsert failed:", insErr);
    return NextResponse.json(
      { error: `Could not save ICP prospects: ${insErr.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, inserted: deduped.length });
}
