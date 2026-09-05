import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Returns the current user's LinkedIn connection status. Never returns tokens.
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ connected: false }, { status: 401 });

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ connected: false, notConfigured: true });
  }

  const svc = createServiceClient();
  const { data } = await svc
    .from("linkedin_connections")
    .select("member_name, expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return NextResponse.json({ connected: false });
  const expired = data.expires_at ? new Date(data.expires_at).getTime() < Date.now() : false;
  return NextResponse.json({ connected: true, memberName: data.member_name, expiresAt: data.expires_at, expired });
}
