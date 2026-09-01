import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Only allow redirecting to a path on this site. Anything else (a full URL,
// a protocol-relative //host, or a value like "@evil.com" / ".evil.com" that
// would land in the authority half of the URL) falls back to /dashboard.
function safeNext(raw: string | null): string {
  if (!raw) return "/dashboard";
  // Must be a single-slash-prefixed path, and must not start a new authority.
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) {
    return "/dashboard";
  }
  // Reject anything that still parses as absolute (defense in depth).
  try {
    if (new URL(raw, "https://placeholder.invalid").origin !== "https://placeholder.invalid") {
      return "/dashboard";
    }
  } catch {
    return "/dashboard";
  }
  return raw;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
