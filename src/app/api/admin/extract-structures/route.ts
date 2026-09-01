import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAdminUser } from "@/lib/auth/admin";

// Admin-only. Reads the top popular_posts and asks Claude to distill the
// recurring, reusable post STRUCTURES (not the content). Saves them as
// unapproved post_structures for the admin to review, edit, and approve.
export const maxDuration = 60;

export async function POST() {
  const { isAdmin, supabase } = await getAdminUser();
  if (!isAdmin) return NextResponse.json({ error: "Admin only" }, { status: 403 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY is not configured." }, { status: 503 });
  }

  const { data: posts } = await supabase
    .from("popular_posts")
    .select("content, likes, comments")
    .order("likes", { ascending: false })
    .limit(30);

  if (!posts || posts.length < 3) {
    return NextResponse.json(
      { error: "Not enough research yet. Run a vertical search first." },
      { status: 400 }
    );
  }

  const corpus = posts
    .map((p: { content: string; likes: number; comments: number }, i: number) => `POST ${i + 1} (${p.likes} likes, ${p.comments} comments):\n${p.content}`)
    .join("\n\n---\n\n");

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let text = "";
  try {
    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system:
        "You are a LinkedIn content strategist. You extract reusable POST STRUCTURES (hook pattern, body shape, closing move) from high-performing posts. You never copy content, only the structural pattern.",
      messages: [
        {
          role: "user",
          content: `Here are high-performing LinkedIn posts:\n\n${corpus}\n\nIdentify the 5 most effective RECURRING structures. For each, return the reusable skeleton, not the topic.\n\nReturn ONLY valid JSON:\n{"structures":[{"name":"short name","description":"a reusable instruction a writer could follow to reproduce this structure","hook_type":"question|statistic|story|contrarian|list|other","example":"a one-line generic example of the hook","skeleton":"the full post structure as a template, with the fill-in parts wrapped in {curly braces}, e.g. \"{time ago}, I {low moment}.\\nHere is what changed:\\n- {shift 1}\\n- {shift 2}\\n{one-line takeaway}\""}]}`,
        },
      ],
    });
    const block = msg.content.find((b) => b.type === "text");
    text = block && block.type === "text" ? block.text : "";
  } catch {
    return NextResponse.json({ error: "The analysis call failed. Try again." }, { status: 502 });
  }

  let parsed: { structures?: Array<Record<string, string>> };
  try {
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : text);
  } catch {
    return NextResponse.json({ error: "Could not parse the analysis. Try again." }, { status: 500 });
  }

  const structures = (parsed.structures || [])
    .filter((s) => s.name && s.description)
    .map((s) => ({
      name: String(s.name).slice(0, 120),
      description: String(s.description).slice(0, 1000),
      hook_type: s.hook_type ? String(s.hook_type).slice(0, 40) : null,
      example: s.example ? String(s.example).slice(0, 300) : null,
      skeleton: s.skeleton ? String(s.skeleton).slice(0, 2000) : null,
      user_id: null,
      approved: false,
    }));

  if (structures.length === 0) {
    return NextResponse.json({ error: "No structures were extracted." }, { status: 500 });
  }

  const { error: insErr } = await supabase.from("post_structures").insert(structures);
  if (insErr) return NextResponse.json({ error: "Could not save structures." }, { status: 500 });

  return NextResponse.json({ success: true, extracted: structures.length });
}
