import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

async function clients() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, admin: null };
  const admin = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { autoRefreshToken: false, persistSession: false } });
  return { supabase, user, admin };
}

async function requireFaculty() {
  const { user, admin } = await clients();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: profile } = await admin!.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "faculty") return { error: NextResponse.json({ error: "Faculty access required" }, { status: 403 }) };
  return { user, admin: admin! };
}

function validQuestion(body: any) {
  return (body.unit === "1" || body.unit === "2") && typeof body.question === "string" && body.question.trim() && Array.isArray(body.options) && body.options.length === 4 && body.options.every((option: unknown) => typeof option === "string" && option.trim()) && Number.isInteger(body.answer) && body.answer >= 0 && body.answer < 4 && typeof body.explanation === "string" && body.explanation.trim();
}

export async function GET(request: Request) {
  const { user, admin } = await clients();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: profile } = await admin!.from("profiles").select("role").eq("id", user.id).single();
  const unit = new URL(request.url).searchParams.get("unit");
  let query = admin!.from("quiz_questions").select("id, unit, question, options, answer, explanation, enabled, created_at").order("created_at", { ascending: false });
  if (profile?.role !== "faculty") query = query.eq("enabled", true);
  if (unit === "1" || unit === "2") query = query.eq("unit", unit);
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const result = await requireFaculty();
  if ("error" in result) return result.error;
  const body = await request.json().catch(() => ({}));
  if (!validQuestion(body)) return NextResponse.json({ error: "Enter a unit, question, four options, correct answer, and explanation." }, { status: 400 });
  const { data, error } = await result.admin.from("quiz_questions").insert({ unit: body.unit, question: body.question.trim(), options: body.options.map((option: string) => option.trim()), answer: body.answer, explanation: body.explanation.trim(), enabled: body.enabled !== false }).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}

export async function PATCH(request: Request) {
  const result = await requireFaculty();
  if ("error" in result) return result.error;
  const body = await request.json().catch(() => ({}));
  if (typeof body.id !== "string") return NextResponse.json({ error: "Question id is required." }, { status: 400 });
  const updates = typeof body.enabled === "boolean" ? { enabled: body.enabled } : validQuestion(body) ? { unit: body.unit, question: body.question.trim(), options: body.options.map((option: string) => option.trim()), answer: body.answer, explanation: body.explanation.trim() } : null;
  if (!updates) return NextResponse.json({ error: "Invalid question details." }, { status: 400 });
  const { data, error } = await result.admin.from("quiz_questions").update(updates).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(request: Request) {
  const result = await requireFaculty();
  if ("error" in result) return result.error;
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Question id is required." }, { status: 400 });
  const { error } = await result.admin.from("quiz_questions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
