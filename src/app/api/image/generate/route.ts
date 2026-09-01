import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

// Authenticated users can generate a post image. Returns a base64 data URL the
// client then uploads to Supabase Storage. Costs OpenAI image credits per call,
// so this will be metered once the token/credits system lands.
export const maxDuration = 60;

const MAX_PROMPT = 1000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Image generation is not configured. Set OPENAI_API_KEY." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim().slice(0, MAX_PROMPT) : "";
  if (!prompt) return NextResponse.json({ error: "A prompt is required." }, { status: 400 });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: `Professional LinkedIn post image. ${prompt}. Clean, modern, no text overlays.`,
      size: "1024x1024",
      n: 1,
    });
    const b64 = result.data?.[0]?.b64_json;
    if (!b64) return NextResponse.json({ error: "No image was returned." }, { status: 502 });
    return NextResponse.json({ success: true, dataUrl: `data:image/png;base64,${b64}` });
  } catch {
    return NextResponse.json({ error: "Image generation failed. Try a simpler prompt." }, { status: 502 });
  }
}
