import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const AUDIENCE_BIOS: Record<string, string> = {
  consultants:
    "You are a solo consultant / coach who writes on LinkedIn to attract clients. Warm, credible, specific. You share real engagement stories, small frameworks, and lessons. You don't use corporate speak.",
  founders:
    "You are a founder/exec. You write like you talk: direct, opinionated, generous. You share lessons from the trenches without bragging.",
  marketers:
    "You are a senior marketer who writes LinkedIn posts that travel. You love clever hooks, concrete data, and a mild roast of bad marketing.",
};

// Simple in-memory rate limiting
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + 3600000 }); // 1 hour window
    return false;
  }
  entry.count++;
  return entry.count > 10; // 10 requests per hour per IP
}

export async function POST(req: NextRequest) {
  // Rate limiting
  const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded. Try again later." }, { status: 429 });
  }

  try {
    const { idea, tone, audienceKey } = await req.json();

    if (!idea || typeof idea !== "string" || idea.trim().length === 0) {
      return NextResponse.json({ error: "Idea is required" }, { status: 400 });
    }

    const bio = AUDIENCE_BIOS[audienceKey] || AUDIENCE_BIOS.consultants;
    const toneLine =
      tone === "story"
        ? "Narrative with a first-person moment and one clear takeaway."
        : tone === "bold"
          ? "A contrarian take. Open with a strong claim. Back it up."
          : "A scannable listicle with 3-5 short points. Punchy and practical.";

    const prompt = `${bio}

Write ONE LinkedIn post about: "${idea.trim().slice(0, 500)}"

Style: ${toneLine}
Rules:
- 80-140 words.
- Hook in the first line. Short sentences.
- Use line breaks for rhythm. No emojis. No hashtags. No "In conclusion".
- Sound like a real human. Specific > generic. No "leverage", no "unlock", no "game-changing".
- End with a question or a small call to reflect.

Return ONLY the post body. No preamble, no quotes, no markdown.`;

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ post: "Demo is temporarily unavailable. Sign up for the full experience!" }, { status: 200 });
    }

    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const text = message.content[0]?.type === "text" ? message.content[0].text : "";
    return NextResponse.json({ post: text.trim() });
  } catch (error) {
    console.error("Demo generate error:", error);
    return NextResponse.json({
      post: "Could not generate right now. But here's the shape: one hook, three beats, one question. Write what you wish you'd read a year ago.",
    });
  }
}
