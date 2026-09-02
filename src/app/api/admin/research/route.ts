import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";

// Admin-only. Runs the HarvestAPI "LinkedIn Post Search" Apify actor to pull
// popular posts by keyword + recency, and stores them in popular_posts as a
// private research pool (featured=false until the admin shares them).
//
// Only ONE env var is needed: APIFY_TOKEN. The actor id is fixed below.
//
// Vercel Hobby caps functions at 10s; a synchronous scrape can exceed that.
export const maxDuration = 60;

// Fixed actor — see https://apify.com/harvestapi/linkedin-post-search
const ACTOR_ID = "harvestapi~linkedin-post-search";

type ApifyItem = Record<string, unknown>;

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function num(v: unknown): number {
  const n = typeof v === "number" ? v : typeof v === "string" ? parseInt(v.replace(/[,\s]/g, ""), 10) : 0;
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
    if (item[k] != null && typeof item[k] !== "object") return num(item[k]);
  }
  return 0;
}
function asObject(v: unknown): ApifyItem {
  return v && typeof v === "object" ? (v as ApifyItem) : {};
}

// today -> last 24h, week -> last 7 days, all -> no date restriction
function rangeToPostedLimit(range: string): string | null {
  if (range === "today") return "24h";
  if (range === "week") return "week";
  if (range === "month") return "month";
  return null; // all time
}

export async function POST(request: Request) {
  const { isAdmin, supabase } = await getAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return NextResponse.json(
      { error: "Research is not configured. Add APIFY_TOKEN in Vercel, then redeploy." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const vertical: string = typeof body?.vertical === "string" ? body.vertical.trim() : "";
  const keywords: string = typeof body?.keywords === "string" ? body.keywords.trim() : vertical;
  const range: string = typeof body?.range === "string" ? body.range : "all";
  const sortBy: string = body?.sortBy === "date" ? "date" : "relevance";
  const maxPosts = Math.min(Math.max(num(body?.maxResults) || 25, 1), 100);
  if (!keywords) {
    return NextResponse.json({ error: "Keywords or a vertical are required." }, { status: 400 });
  }

  const postedLimit = rangeToPostedLimit(range);
  const actorInput: Record<string, unknown> = {
    searchQueries: [keywords],
    maxPosts,
    sortBy,
    ...(postedLimit ? { postedLimit } : {}),
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
        { error: "The research actor did not run. Check your Apify token and that the actor is rented." },
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

  // Map defensively. HarvestAPI nests author + engagement objects, but also
  // exposes flat fields on some records, so we check both.
  const rows = items
    .map((it) => {
      const content = firstString(it, ["content", "text", "postText", "description", "body"]);
      if (!content) return null;
      const author = asObject(it.author);
      const engagement = asObject(it.engagement);
      const socialCounts = asObject(it.socialCounts);

      const authorName =
        firstString(it, ["authorName", "author", "fullName", "name"]) ||
        firstString(author, ["name", "fullName"]) ||
        [str(author.firstName), str(author.lastName)].filter(Boolean).join(" ") || null;

      return {
        source: "apify",
        external_id: firstString(it, ["id", "postId", "urn", "linkedinUrl", "url", "postUrl"]),
        author_name: authorName,
        author_headline:
          firstString(it, ["authorHeadline", "headline", "occupation"]) ||
          firstString(author, ["headline", "occupation", "position", "info"]),
        post_url: firstString(it, ["linkedinUrl", "url", "postUrl", "link"]),
        content,
        vertical: vertical || null,
        keywords: keywords ? keywords.split(",").map((k) => k.trim()).filter(Boolean) : [],
        likes:
          firstNum(it, ["likes", "numLikes", "reactionsCount", "totalReactions", "likeCount"]) ||
          firstNum(engagement, ["likes", "reactions", "reactionsCount"]) ||
          firstNum(socialCounts, ["numLikes", "reactionsCount"]),
        comments:
          firstNum(it, ["comments", "numComments", "commentsCount", "commentCount"]) ||
          firstNum(engagement, ["comments", "commentsCount"]) ||
          firstNum(socialCounts, ["numComments"]),
        reposts:
          firstNum(it, ["reposts", "shares", "numShares", "repostsCount", "repostCount"]) ||
          firstNum(engagement, ["shares", "reposts", "repostsCount"]) ||
          firstNum(socialCounts, ["numShares"]),
        posted_at: firstString(it, ["postedAt", "publishedAt", "createdAt", "date", "time"]),
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
