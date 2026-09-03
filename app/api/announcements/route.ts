import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, created_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "faculty") return NextResponse.json({ error: "Faculty access required" }, { status: 403 });

  const body = await request.json();
  if (typeof body.title !== "string" || typeof body.body !== "string" || !body.title.trim() || !body.body.trim()) {
    return NextResponse.json({ error: "Title and message are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("announcements")
    .insert({ title: body.title.trim(), body: body.body.trim(), author_id: user.id })
    .select("id, title, body, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
