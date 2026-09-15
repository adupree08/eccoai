import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";

// Admin-only. For a batch of LinkedIn profile URLs, pulls each person's recent
// posts (harvestapi profile-posts actor) and returns activity signals:
// last post date + posts in the last 90 days. Any post that mentions a watch
// term (default: menopause/perimenopause) is also captured into popular_posts
// as a featured post, so Oklahoma clinicians' menopause posts land on the
// Popular Posts page automatically.
export const maxDuration = 60;

const ACTOR_ID = "harvestapi~linkedin-profile-posts";
const DEFAULT_WATCH = ["menopause", "perimenopause", "peri-menopause", "hormone therapy", "hrt"];

type Item = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const obj = (v: unknown): Item => (v && typeof v === "object" ? (v as Item) : {});
const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? parseInt(v.replace(/[,\s]/g, ""), 10) || 0 : 0);
const norm = (u: string) => u.trim().replace(/\/+$/, "").toLowerCase();
// The identifying tail of a profile URL: "ACwAA..." or a vanity slug.
const tail = (u: string) => norm(u).split("/in/")[1] || norm(u);

export async function POST(request: Request) {
  const { isAdmin, supabase } = await getAdminUser();
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const token = process.env.APIFY_TOKEN;
  if (!token) return NextResponse.json({ error: "APIFY_TOKEN is not configured." }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const urls: string[] = Array.isArray(body?.urls)
    ? body.urls.filter((u: unknown) => typeof u === "string" && u.includes("linkedin.com/in/")).slice(0, 25)
    : [];
  const maxPosts = Math.min(Math.max(Number(body?.maxPosts) || 5, 1), 10);
  const watch: string[] = Array.isArray(body?.watchTerms) && body.watchTerms.length
    ? body.watchTerms.map((w: string) => String(w).toLowerCase())
    : DEFAULT_WATCH;
  const capture: boolean = body?.capture !== false;
  if (urls.length === 0) return NextResponse.json({ error: "urls[] required (linkedin.com/in/...)" }, { status: 400 });

  let items: Item[] = [];
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}&clean=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrls: urls, maxPosts, includeReposts: true, includeQuotePosts: true, postedLimit: "year" }),
        signal: AbortSignal.timeout(55000),
      }
    );
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error("profile-posts failed:", res.status, detail);
      return NextResponse.json({ error: `Actor failed (${res.status}): ${detail}` }, { status: 502 });
    }
    items = (await res.json()) as Item[];
  } catch {
    return NextResponse.json({ error: "Actor timed out. Use a smaller batch." }, { status: 504 });
  }

  // Map each post back to the input profile it belongs to. HarvestAPI echoes
  // the target in `query`; the author's id/urn/url are fallbacks.
  const inputTails = urls.map(tail);
  const inputIdx = (candidates: (string | null)[]) => {
    for (const c of candidates) {
      if (!c) continue;
      const ct = tail(c);
      const i = inputTails.findIndex((t) => t === ct || t.includes(ct) || ct.includes(t));
      if (i !== -1) return i;
    }
    return -1;
  };

  const now = Date.now();
  const ninety = 90 * 24 * 3600 * 1000;
  const per = urls.map((u) => ({ url: u, lastPostAt: null as string | null, posts90d: 0, postsFetched: 0, watchHits: 0 }));
  const captured: Record<string, unknown>[] = [];

  for (const it of Array.isArray(items) ? items : []) {
    const author = obj(it.author);
    const q = obj(it.query);
    const idx = inputIdx([
      str(q.targetUrl), str(q.url), str(q.profileUrl), str(it.targetUrl), str(it.profileUrl),
      str(author.linkedinUrl), str(author.publicIdentifier), str(author.id), str(author.urn),
    ]);
    if (idx === -1) continue;
    const postedAt = obj(it.postedAt);
    const dateStr = str(postedAt.date) || (typeof postedAt.timestamp === "number" ? new Date(postedAt.timestamp).toISOString() : null);
    const t = dateStr ? Date.parse(dateStr) : NaN;
    const p = per[idx];
    p.postsFetched++;
    if (!Number.isNaN(t)) {
      if (!p.lastPostAt || t > Date.parse(p.lastPostAt)) p.lastPostAt = new Date(t).toISOString();
      if (now - t <= ninety) p.posts90d++;
    }
    const content = str(it.content) || str(it.text) || "";
    if (capture && content && watch.some((w) => content.toLowerCase().includes(w))) {
      p.watchHits++;
      const eng = obj(it.engagement);
      const avatar = obj(author.avatar);
      captured.push({
        source: "okwatch",
        external_id: str(it.linkedinUrl) || str(it.url) || str(it.id),
        author_name: str(author.name) || [str(author.firstName), str(author.lastName)].filter(Boolean).join(" ") || null,
        author_headline: str(author.info) || str(author.headline) || null,
        author_avatar: str(avatar.url),
        post_url: str(it.linkedinUrl) || str(it.url),
        content,
        vertical: "menopause",
        keywords: watch,
        likes: num(eng.likes) || num(it.likes),
        comments: num(eng.comments) || num(it.comments),
        reposts: num(eng.shares) || num(it.reposts),
        posted_at: dateStr && !Number.isNaN(t) ? new Date(t).toISOString() : null,
        featured: true,
        featured_at: new Date().toISOString(),
      });
    }
  }

  let watchAdded = 0;
  if (captured.length) {
    const seen = new Set<string>();
    const rows = captured.filter((r) => {
      const id = r.external_id as string | null;
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    const { error } = await supabase.from("popular_posts").upsert(rows, { onConflict: "source,external_id", ignoreDuplicates: false });
    if (error) console.error("okwatch upsert failed:", error);
    else watchAdded = rows.length;
  }

  const matched = per.filter((p) => p.postsFetched > 0).length;
  return NextResponse.json({ activity: per, matched, itemsReturned: items.length, watchAdded, sample: items[0] ?? null });
}
