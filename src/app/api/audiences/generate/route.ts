import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { CLAUDE_MODEL_UTILITY } from "@/lib/ai/model";

// "Describe your business -> Generate": turns a plain-English description into
// a structured audience (watch words, skip words, customer titles, industries).
// The user reviews and edits before saving. No jargon required from them.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "AI is not configured." }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const description: string = typeof body?.description === "string" ? body.description.trim() : "";
  if (description.length < 10) return NextResponse.json({ error: "Describe your business and who you want to reach." }, { status: 400 });

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const msg = await anthropic.messages.create({
      model: CLAUDE_MODEL_UTILITY,
      max_tokens: 1024,
      thinking: { type: "disabled" },
      system: `You turn a founder's plain-English description of their business and ideal customers into a LinkedIn targeting profile. Be specific and practical. Return ONLY JSON:
{
  "name": "short audience name (2-4 words)",
  "watch_words": ["6-10 topic keywords their buyers post about"],
  "skip_words": ["3-6 words that signal off-target posts (job seekers, students, unrelated adjacent topics)"],
  "titles": ["6-10 job titles of the people who BUY, not peers or students"],
  "industries": ["3-6 industries those buyers work in"]
}`,
      messages: [{ role: "user", content: description }],
    });
    const text = msg.content.find((b) => b.type === "text");
    if (!text || text.type !== "text") throw new Error("No response");
    let json = text.text.trim();
    const m = json.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (m) json = m[1].trim();
    else {
      const first = json.indexOf("{");
      const last = json.lastIndexOf("}");
      if (first !== -1 && last !== -1) json = json.slice(first, last + 1);
    }
    const parsed = JSON.parse(json);
    const arr = (v: unknown) => (Array.isArray(v) ? v.filter((x) => typeof x === "string").map((x) => String(x).trim()).filter(Boolean) : []);
    return NextResponse.json({
      name: typeof parsed.name === "string" ? parsed.name : "My audience",
      watch_words: arr(parsed.watch_words).slice(0, 10),
      skip_words: arr(parsed.skip_words).slice(0, 10),
      titles: arr(parsed.titles).slice(0, 12),
      industries: arr(parsed.industries).slice(0, 8),
    });
  } catch {
    return NextResponse.json({ error: "Could not generate an audience. Try rephrasing." }, { status: 500 });
  }
}
