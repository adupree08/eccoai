import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { CLAUDE_MODEL } from "@/lib/ai/model";

// Finds LinkedIn posts by keyword, biases toward the user's ICP titles, drafts a
// comment in the user's voice for each, and fills the per-user comment_queue.
// Assisted model: the user reviews and posts the comment themselves.
export const maxDuration = 60;

const ACTOR_ID = "harvestapi~linkedin-post-search";

type Item = Record<string, unknown>;
function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
function obj(v: unknown): Item {
  return v && typeof v === "object" ? (v as Item) : {};
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const token = process.env.APIFY_TOKEN;
  if (!token) {
    return NextResponse.json({ error: "Discovery is not configured. Add APIFY_TOKEN in Vercel." }, { status: 503 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "AI is not configured." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const keywords: string = typeof body?.keywords === "string" ? body.keywords.trim() : "";
  const titlesRaw: string = typeof body?.titles === "string" ? body.titles.trim() : "";
  const maxPosts = Math.min(Math.max(Number(body?.maxPosts) || 10, 1), 15);
  if (!keywords) return NextResponse.json({ error: "Enter topics or keywords." }, { status: 400 });

  const titleTerms = titlesRaw ? titlesRaw.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean) : [];

  // 1. Pull recent posts for the keywords.
  let items: Item[] = [];
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${ACTOR_ID}/run-sync-get-dataset-items?token=${token}&clean=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ searchQueries: [keywords], maxPosts: 25, sortBy: "date", postedLimit: "week" }),
        signal: AbortSignal.timeout(40000),
      }
    );
    if (!res.ok) {
      const detail = (await res.text().catch(() => "")).slice(0, 300);
      console.error("Apify post-search failed:", res.status, detail);
      const hint = /limit|quota|exceeded|feature-disabled/i.test(detail)
        ? "Your Apify account's monthly usage limit is exceeded. Upgrade your Apify plan or wait for the monthly reset."
        : res.status === 401
          ? "APIFY_TOKEN is missing or invalid in Vercel."
          : `Apify returned ${res.status}.`;
      return NextResponse.json({ error: `The search actor did not run. ${hint}` }, { status: 502 });
    }
    items = (await res.json()) as Item[];
  } catch {
    return NextResponse.json({ error: "Search timed out. Try again." }, { status: 504 });
  }

  // 2. Map + filter by ICP titles (headline must contain a title term, if given).
  const mapped = (Array.isArray(items) ? items : [])
    .map((it) => {
      const author = obj(it.author);
      const avatar = obj(author.avatar);
      const headline = str(author.info) || str(author.headline) || str(author.occupation);
      return {
        author_name: str(author.name) || [str(author.firstName), str(author.lastName)].filter(Boolean).join(" ") || null,
        author_headline: headline,
        author_avatar: str(avatar.url),
        post_url: str(it.linkedinUrl) || str(it.url) || str(it.postUrl),
        post_content: str(it.content) || str(it.text),
      };
    })
    .filter((r) => r.post_content && r.post_url)
    .filter((r) => titleTerms.length === 0 || (r.author_headline && titleTerms.some((t) => r.author_headline!.toLowerCase().includes(t))));

  if (mapped.length === 0) {
    return NextResponse.json({ success: true, added: 0, note: "No matching posts found. Try broader topics or fewer title filters." });
  }

  // 3. Skip posts already in the user's queue.
  const urls = mapped.map((r) => r.post_url).filter(Boolean) as string[];
  const { data: existing } = await supabase
    .from("comment_queue")
    .select("post_url")
    .eq("user_id", user.id)
    .in("post_url", urls);
  const seen = new Set((existing || []).map((e: { post_url: string | null }) => e.post_url));
  const fresh = mapped.filter((r) => !seen.has(r.post_url)).slice(0, maxPosts);
  if (fresh.length === 0) {
    return NextResponse.json({ success: true, added: 0, note: "Nothing new. All matching posts are already in your queue." });
  }

  // 4. Load the user's default brand voice for tone.
  const { data: voice } = await supabase
    .from("brand_voices")
    .select("name, description, guidelines, excluded_terms")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();

  const voiceBlock = voice
    ? `\n\nWrite in this brand voice — ${voice.name}: ${voice.description || ""}. Guidelines: ${(voice.guidelines || []).join("; ")}. Avoid: ${(voice.excluded_terms || []).join(", ")}.`
    : "";

  // 5. Draft one comment per post in a single call.
  const numbered = fresh
    .map((r, i) => `[${i}] Author: ${r.author_name} (${r.author_headline || "n/a"})\nPost: ${(r.post_content || "").slice(0, 700)}`)
    .join("\n\n");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const comments: string[] = fresh.map(() => "");
  try {
    const msg = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: `You write thoughtful LinkedIn comments that add genuine value to someone else's post. Each comment is 1-2 sentences, specific to the post, never generic ("Great post!"), never salesy. You are commenting to build a relationship with a potential customer.${voiceBlock}\n\nReturn ONLY a JSON array like [{"i":0,"comment":"..."}], one per post index.`,
      messages: [{ role: "user", content: numbered }],
    });
    const text = msg.content.find((b) => b.type === "text");
    if (text && text.type === "text") {
      let json = text.text.trim();
      const m = json.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (m) json = m[1].trim();
      else {
        const first = json.indexOf("[");
        const last = json.lastIndexOf("]");
        if (first !== -1 && last !== -1) json = json.slice(first, last + 1);
      }
      const parsed = JSON.parse(json) as { i: number; comment: string }[];
      for (const { i, comment } of parsed) {
        if (typeof i === "number" && i >= 0 && i < comments.length && typeof comment === "string") comments[i] = comment.trim();
      }
    }
  } catch {
    // Leave comments blank; the user can draft per-card in the UI.
  }

  // 6. Insert into the queue.
  const rows = fresh.map((r, i) => ({
    user_id: user.id,
    author_name: r.author_name,
    author_headline: r.author_headline,
    author_avatar: r.author_avatar,
    post_url: r.post_url,
    post_content: r.post_content,
    draft_comment: comments[i] || null,
    topic: keywords,
    status: "pending" as const,
  }));

  const { error } = await supabase.from("comment_queue").insert(rows);
  if (error) return NextResponse.json({ error: `Could not save: ${error.message}` }, { status: 500 });

  return NextResponse.json({ success: true, added: rows.length });
}
