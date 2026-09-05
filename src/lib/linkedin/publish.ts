import { type SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";
import { decrypt } from "./crypto";
import { publishTextPost } from "./api";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

// Publishes one post to its owner's LinkedIn. On success it marks the post
// published and stores the LinkedIn URN. On failure it returns the reason and
// leaves status handling to the caller (cron retries; "post now" surfaces it).
export async function publishPost(
  svc: SupabaseClient,
  post: PostRow
): Promise<{ ok: boolean; error?: string; linkedinId?: string }> {
  const { data: conn } = await svc
    .from("linkedin_connections")
    .select("*")
    .eq("user_id", post.user_id)
    .maybeSingle();

  if (!conn) return { ok: false, error: "LinkedIn is not connected" };
  if (conn.expires_at && new Date(conn.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "LinkedIn session expired, please reconnect" };
  }

  let token: string;
  try {
    token = decrypt(conn.access_token);
  } catch {
    return { ok: false, error: "Could not read LinkedIn token" };
  }

  try {
    const linkedinId = await publishTextPost(token, conn.member_urn, post.content);
    await svc
      .from("posts")
      .update({
        status: "published",
        published_at: new Date().toISOString(),
        linkedin_post_id: linkedinId,
        publish_error: null,
      })
      .eq("id", post.id);
    return { ok: true, linkedinId };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Publish failed" };
  }
}
