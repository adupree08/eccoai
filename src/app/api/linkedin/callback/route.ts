import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { exchangeCodeForTokens, getUserInfo } from "@/lib/linkedin/api";
import { encrypt } from "@/lib/linkedin/crypto";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const settings = new URL("/settings?tab=integrations", url.origin);

  const error = url.searchParams.get("error");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const cookieState = request.cookies.get("li_oauth_state")?.value;

  const fail = (reason: string) => {
    settings.searchParams.set("linkedin", reason);
    const res = NextResponse.redirect(settings);
    res.cookies.delete("li_oauth_state");
    return res;
  };

  if (error) return fail("error");
  if (!code || !state || !cookieState || state !== cookieState) return fail("error");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", url.origin));

  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${url.origin}/api/linkedin/callback`;

  try {
    const tokens = await exchangeCodeForTokens(code, redirectUri);
    const info = await getUserInfo(tokens.access_token);
    const svc = createServiceClient();
    await svc.from("linkedin_connections").upsert({
      user_id: user.id,
      access_token: encrypt(tokens.access_token),
      refresh_token: tokens.refresh_token ? encrypt(tokens.refresh_token) : null,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      member_urn: info.sub,
      member_name: info.name ?? null,
      scope: tokens.scope ?? null,
      updated_at: new Date().toISOString(),
    });
    settings.searchParams.set("linkedin", "connected");
  } catch (e) {
    console.error("LinkedIn callback error:", e);
    settings.searchParams.set("linkedin", "error");
  }

  const res = NextResponse.redirect(settings);
  res.cookies.delete("li_oauth_state");
  return res;
}
