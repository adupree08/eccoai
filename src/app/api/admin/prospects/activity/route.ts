import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";

// Admin-only. For a batch of LinkedIn profile URLs, pulls each person's recent
// posts and returns activity signals: last post date + posts in the last 90
// days. Any post mentioning a watch term (default: menopause/perimenopause/HRT)
// is captured into popular_posts as featured, so Oklahoma clinicians' menopause
// posts land on Popular Posts automatically.
//
// URN-style URLs (linkedin.com/in/ACwAA...) from people-search are not
// understood by the posts actor, so they are first resolved to the person's
// public slug via the profile scraper (profileIds input).
export const maxDuration = 60;

const POSTS_ACTOR = "harvestapi~linkedin-profile-posts";
const PROFILE_ACTOR = "harvestapi~linkedin-profile-scraper";
const DEFAULT_WATCH = ["menopause", "perimenopause", "peri-menopause", "hormone therapy", "hrt"];
const URN_RE = /\/in\/(AC[A-Za-z0-9_-]{20,})\/?$/;

type Item = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);
const obj = (v: unknown): Item => (v && typeof v === "object" ? (v as Item) : {});
const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" ? parseInt(v.replace(/[,\s]/g, ""), 10) || 0 : 0);
const norm = (u: string) => u.trim().replace(/\/+$/, "").toLowerCase();
const tail = (u: string) => norm(u).split("/in/")[1]?.split("?")[0] || norm(u);

async function runActor(actor: string, token: string, input: unknown, timeoutMs: number): Promise<Item[] | { error: string }> {
  try {
    const res = await fetch(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&clean=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error(`${actor} failed:`, res.status, detail);
      return { error: `${actor} failed (${res.status}): ${detail}` };
    }
    const data = await res.json();
    return Array.isArray(data) ? (data as Item[]) : [];
  } catch {
    return { error: `${actor} timed out. Use a smaller batch.` };
  }
}

export async function POST(request: Request) {
  const { isAdmin, supabase } = await getAdminUser();
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const token = process.env.APIFY_TOKEN;
  if (!token) return NextResponse.json({ error: "APIFY_TOKEN is not configured." }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const urls: string[] = Array.isArray(body?.urls)
    ? body.urls.filter((u: unknown) => typeof u === "string" && u.includes("linkedin.com/in/")).slice(0, 20)
    : [];
  const maxPosts = Math.min(Math.max(Number(body?.maxPosts) || 5, 1), 10);
  const watch: string[] = Array.isArray(body?.watchTerms) && body.watchTerms.length
    ? body.watchTerms.map((w: string) => String(w).toLowerCase())
    : DEFAULT_WATCH;
  const capture: boolean = body?.capture !== false;
  if (urls.length === 0) return NextResponse.json({ error: "urls[] required (linkedin.com/in/...)" }, { status: 400 });

  // 1. Resolve URN-style inputs to public slugs.
  type Target = { input: string; target: string | null; slug: string | null; headline: string | null; location: string | null; name: string | null };
  const targets: Target[] = urls.map((u) => ({ input: u, target: URN_RE.test(u) ? null : u, slug: null, headline: null, location: null, name: null }));
  const urnIds = targets.filter((t) => !t.target).map((t) => t.input.match(URN_RE)![1]);
  let resolveSample: Item | null = null;
  if (urnIds.length) {
    const prof = await runActor(PROFILE_ACTOR, token, { profileIds: urnIds, profileScraperMode: "Profile details no email ($4 per 1k)" }, 40000);
    if ("error" in prof) return NextResponse.json({ error: prof.error }, { status: 502 });
    resolveSample = prof[0] ?? null;
    for (const p of prof) {
      const q = obj(p.query);
      const oq = p.originalQuery;
      const oqStr = typeof oq === "string" ? oq : JSON.stringify(oq ?? "");
      const cands = [oqStr, str(p.id), str(p.profileId), str(p.urn), str(q.profileId), str(q.query), str(q.url)].filter(Boolean) as string[];
      const idx = targets.findIndex((t) => !t.target && cands.some((c) => c.includes(t.input.match(URN_RE)![1])));
      const slug = str(p.publicIdentifier);
      const link = str(p.linkedinUrl);
      if (idx === -1 || (!slug && !link)) continue;
      const t = targets[idx];
      t.slug = slug || tail(link!);
      t.target = slug ? `https://www.linkedin.com/in/${slug}/` : link!.split("?")[0];
      t.headline = str(p.headline);
      const loc = obj(p.location);
      t.location = str(loc.linkedinText) || str(p.location) || str(loc.parsed && obj(loc.parsed).text);
      t.name = [str(p.firstName), str(p.lastName)].filter(Boolean).join(" ") || str(p.name);
    }
  }

  // 2. Pull recent posts for every resolved target in one run.
  const live = targets.filter((t) => t.target);
  let items: Item[] = [];
  if (live.length) {
    const posts = await runActor(POSTS_ACTOR, token, { targetUrls: live.map((t) => t.target), maxPosts, includeReposts: true, includeQuotePosts: true, postedLimit: "year" }, 55000);
    if ("error" in posts) return NextResponse.json({ error: posts.error }, { status: 502 });
    items = posts;
  }

  const targetTails = targets.map((t) => (t.target ? tail(t.target) : ""));
  const inputIdx = (candidates: (string | null)[]) => {
    for (const c of candidates) {
      if (!c) continue;
      const ct = tail(c);
      const i = targetTails.findIndex((t) => t && (t === ct || t.includes(ct) || ct.includes(t)));
      if (i !== -1) return i;
    }
    return -1;
  };

  const now = Date.now();
  const ninety = 90 * 24 * 3600 * 1000;
  const per = targets.map((t) => ({
    url: t.input, resolvedUrl: t.target, name: t.name, headline: t.headline, location: t.location,
    lastPostAt: null as string | null, posts90d: 0, postsFetched: 0, watchHits: 0,
  }));
  const captured: Record<string, unknown>[] = [];

  for (const it of items) {
    const author = obj(it.author);
    const q = obj(it.query);
    const idx = inputIdx([str(q.targetUrl), str(q.url), str(author.linkedinUrl), str(author.publicIdentifier), str(author.id)]);
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
        author_name: str(author.name) || [str(author.firstName), str(author.lastName)].filter(Boolean).join(" ") || p.name,
        author_headline: str(author.info) || str(author.headline) || p.headline,
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

  return NextResponse.json({
    activity: per,
    resolved: targets.filter((t) => t.target).length,
    matched: per.filter((p) => p.postsFetched > 0).length,
    itemsReturned: items.length,
    watchAdded,
    resolveSample: resolveSample ? { keys: Object.keys(resolveSample), id: resolveSample.id, publicIdentifier: resolveSample.publicIdentifier, linkedinUrl: resolveSample.linkedinUrl, query: resolveSample.query } : null,
  });
}
