import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/admin";
import { classifyArchetypes } from "@/lib/ai/classify";

// Admin-only. Backfills archetype tags on popular_posts that don't have one yet
// (e.g. posts scraped before tagging existed).
export const maxDuration = 60;

export async function POST() {
  const { isAdmin, supabase } = await getAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  const { data: rows, error } = await supabase
    .from("popular_posts")
    .select("id, content")
    .is("archetype", null)
    .limit(60);

  if (error) {
    return NextResponse.json({ error: "Could not load posts." }, { status: 500 });
  }
  if (!rows || rows.length === 0) {
    return NextResponse.json({ success: true, tagged: 0, note: "Everything is already tagged." });
  }

  const labels = await classifyArchetypes(rows.map((r: { id: string; content: string }) => r.content));

  let tagged = 0;
  for (let i = 0; i < rows.length; i++) {
    const label = labels[i];
    if (!label) continue;
    const { error: upErr } = await supabase
      .from("popular_posts")
      .update({ archetype: label })
      .eq("id", rows[i].id);
    if (!upErr) tagged++;
  }

  return NextResponse.json({ success: true, tagged, remaining: rows.length - tagged });
}
