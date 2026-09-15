import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { CLAUDE_MODEL } from "@/lib/ai/model";

// Regenerate or revise one queued comment. With no instruction it writes a
// fresh, different comment; with an instruction it revises the current draft.
// Returns the new comment; the client saves it (one write, local state synced).
export const maxDuration = 30;

const RULES = `Rules: 1-2 sentences. Specific to THIS post, never generic praise ("Great post!"). Not salesy, no pitching. You are building a relationship with a potential customer. NEVER use em dashes or en dashes anywhere; use commas, periods, or parentheses instead. Return ONLY the comment text, no quotes, no preamble.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: "AI is not configured." }, { status: 503 });

  const body = await request.json().catch(() => ({}));
  const id: string | null = typeof body?.id === "string" ? body.id : null;
  const instruction: string = typeof body?.instruction === "string" ? body.instruction.trim().slice(0, 500) : "";
  const currentDraft: string = typeof body?.currentDraft === "string" ? body.currentDraft.trim().slice(0, 2000) : "";
  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  // RLS scopes this to the user's own queue item.
  const { data: item } = await supabase
    .from("comment_queue")
    .select("author_name, author_headline, post_content, draft_comment")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!item) return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  const { data: voice } = await supabase
    .from("brand_voices")
    .select("name, description, guidelines, excluded_terms")
    .eq("user_id", user.id)
    .eq("is_default", true)
    .maybeSingle();
  const voiceBlock = voice
    ? `\n\nWrite in this brand voice, ${voice.name}: ${voice.description || ""}. Guidelines: ${(voice.guidelines || []).join("; ")}. Avoid: ${(voice.excluded_terms || []).join(", ")}.`
    : "";

  const draft = currentDraft || item.draft_comment || "";
  const task = instruction
    ? `Revise the current comment according to this instruction: "${instruction}". Keep what works, change what was asked.\n\nCurrent comment:\n${draft}`
    : `Write a fresh comment that takes a DIFFERENT angle from the current one.\n\nCurrent comment (do not repeat its angle):\n${draft || "(none yet)"}`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const msg = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      thinking: { type: "adaptive" },
      output_config: { effort: "low" },
      system: `You write thoughtful LinkedIn comments on other people's posts. ${RULES}${voiceBlock}`,
      messages: [{
        role: "user",
        content: `Author: ${item.author_name || "Unknown"} (${item.author_headline || "n/a"})\nPost:\n${(item.post_content || "").slice(0, 1500)}\n\n${task}`,
      }],
    });
    const text = msg.content.find((b) => b.type === "text");
    const comment = text && text.type === "text" ? text.text.trim().replace(/^["'“”]+|["'“”]+$/g, "").replace(/[–—]/g, ",") : "";
    if (!comment) return NextResponse.json({ error: "No comment returned" }, { status: 500 });
    return NextResponse.json({ comment });
  } catch {
    return NextResponse.json({ error: "Could not revise the comment" }, { status: 500 });
  }
}
