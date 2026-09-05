import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { publishPost } from "@/lib/linkedin/publish";

export const maxDuration = 30;

// "Post now": publishes one of the user's posts to LinkedIn immediately.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const postId = typeof body?.postId === "string" ? body.postId : null;
  if (!postId) return NextResponse.json({ error: "postId is required" }, { status: 400 });

  // RLS scopes this to the user's own post.
  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const svc = createServiceClient();
  const result = await publishPost(svc, post);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, linkedinId: result.linkedinId });
}
