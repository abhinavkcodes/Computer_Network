import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

function facultyEmails() {
  return (process.env.FACULTY_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function POST() {
  const supabase = createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
  const role = facultyEmails().includes(user.email.toLowerCase()) ? "faculty" : "student";
  const { data: profile, error } = await admin
    .from("profiles")
    .upsert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? "Student",
      avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      role,
      last_seen: new Date().toISOString(),
    }, { onConflict: "id" })
    .select("role")
    .single();

  if (error) {
    console.error("Profile sync failed:", error.message);
    return NextResponse.json({ error: "Could not sync profile. Run supabase/schema.sql and check Supabase keys." }, { status: 500 });
  }
  return NextResponse.json(profile);
}
