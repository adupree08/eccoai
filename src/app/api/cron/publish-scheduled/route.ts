import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { publishPost } from "@/lib/linkedin/publish";

export const maxDuration = 60;

// Publishes all posts whose scheduled time has arrived. Called every minute by
// Supabase pg_cron (via pg_net) with the shared CRON_SECRET. Retries a failing
// post up to 3 times, then drops it back to draft with the error recorded.
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided =
    request.headers.get("x-cron-secret") || new URL(request.url).searchParams.get("secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const svc = createServiceClient();
  const { data: due } = await svc
    .from("posts")
    .select("*")
    .eq("status", "scheduled")
    .lte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })
    .limit(25);

  let published = 0;
  let failed = 0;

  for (const post of due || []) {
    const result = await publishPost(svc, post);
    if (result.ok) {
      published++;
      continue;
    }
    failed++;
    const attempts = (post.publish_attempts || 0) + 1;
    const giveUp = attempts >= 3;
    await svc
      .from("posts")
      .update({
        publish_attempts: attempts,
        publish_error: result.error ?? "Publish failed",
        status: giveUp ? "draft" : "scheduled",
      })
      .eq("id", post.id);
  }

  return NextResponse.json({ checked: (due || []).length, published, failed });
}

export async function GET(request: Request) {
  return handle(request);
}
export async function POST(request: Request) {
  return handle(request);
}
