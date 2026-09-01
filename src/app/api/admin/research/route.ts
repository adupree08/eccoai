import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";

// Admin-only. Runs an Apify actor to pull popular posts in a vertical and
// stores them in popular_posts. NOTE: scraping LinkedIn is against LinkedIn's
// ToS; this is gated to admins and used for research only, per explicit choice.
//
// Env required:
//   APIFY_TOKEN      - your Apify API token
//   APIFY_ACTOR_ID   - the actor to run (e.g. "curious_coder~linkedin-post-search")
//
// Vercel Hobby caps functions at 10s; a synchronous scrape can exceed that.
// If you hit timeouts, move to a paid plan or the async run+poll pattern.
export const maxDuration = 60;

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
function firstNum(item: ApifyItem, keys: string[]): number {
  for (const k of keys) {
    if (item[k] != null) return num(item[k]);
  }
  return 0;
}

export async function POST(request: Request) {
  const { isAdmin, supabase } = await getAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const token = process.env.APIFY_TOKEN;
  const actorId = process.env.APIFY_ACTOR_ID;
  if (!token || !actorId) {
    return NextResponse.json(
      { error: "Research is not configured. Set APIFY_TOKEN and APIFY_ACTOR_ID." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const vertical: string = typeof body?.vertical === "string" ? body.vertical.trim() : "";
  const keywords: string = typeof body?.keywords === "string" ? body.keywords.trim() : vertical;
  const maxResults = Math.min(Math.max(num(body?.maxResults) || 25, 1), 100);
  if (!keywords) {
    return NextResponse.json({ error: "Keywords or a vertical are required." }, { status: 400 });
  }

  // Actor input. Actors differ, so allow the admin to pass an explicit
  // actorInput override; otherwise use a sensible default shape.
  const actorInput =
    body?.actorInput && typeof body.actorInput === "object"
      ? body.actorInput
      : { searchQuery: keywords, keywords, maxItems: maxResults, limit: maxResults };

  let items: ApifyItem[] = [];
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?token=${token}&clean=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(actorInput),
        signal: AbortSignal.timeout(55000),
      }
    );
    if (!res.ok) {
      return NextResponse.json(
        { error: "The research actor did not run. Check your Apify token and actor ID." },
        { status: 502 }
      );
    }
    items = (await res.json()) as ApifyItem[];
  } catch {
    return NextResponse.json(
      { error: "Research timed out or failed. Try fewer results." },
      { status: 504 }
    );
  }

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ success: true, inserted: 0, note: "No posts returned." });
  }

  // Map defensively across common actor field names.
  const rows = items
    .map((it) => {
      const content = firstString(it, ["text", "content", "postText", "description", "body"]);
      if (!content) return null;
      return {
        source: "apify",
        external_id: firstString(it, ["id", "postId", "urn", "url", "postUrl"]),
        author_name: firstString(it, ["authorName", "author", "fullName", "name"]),
        author_headline: firstString(it, ["authorHeadline", "headline", "occupation"]),
        post_url: firstString(it, ["url", "postUrl", "link"]),
        content,
        vertical: vertical || null,
        keywords: keywords ? keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
        likes: firstNum(it, ["likes", "numLikes", "reactions", "totalReactions", "likeCount"]),
        comments: firstNum(it, ["comments", "numComments", "commentCount"]),
        reposts: firstNum(it, ["reposts", "shares", "numShares", "repostCount"]),
        posted_at: firstString(it, ["postedAt", "publishedAt", "date", "time"]),
      };
    })
    .filter(Boolean);

  const { error: insErr } = await supabase
    .from("popular_posts")
    .upsert(rows, { onConflict: "source,external_id", ignoreDuplicates: false });

  if (insErr) {
    return NextResponse.json({ error: "Could not save research results." }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: rows.length });
}
