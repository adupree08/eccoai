import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";
import { getAuthorizeUrl } from "@/lib/linkedin/api";

// Starts the LinkedIn OAuth flow. Requires a signed-in user.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  if (!process.env.LINKEDIN_CLIENT_ID) {
    return NextResponse.redirect(new URL("/settings?tab=integrations&linkedin=notconfigured", request.url));
  }

  const origin = new URL(request.url).origin;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${origin}/api/linkedin/callback`;
  const state = crypto.randomBytes(16).toString("hex");

  const res = NextResponse.redirect(getAuthorizeUrl(redirectUri, state));
  res.cookies.set("li_oauth_state", state, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return res;
}
