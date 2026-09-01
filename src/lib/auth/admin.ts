import { createClient } from "@/lib/supabase/server";

// Server-side admin gate. The old admin page checked an email list in the
// browser, which ships to every user and enforces nothing. This checks the
// server session against profiles.is_admin and is the real control.
export async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false, supabase };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return { user, isAdmin: !!profile?.is_admin, supabase };
}
