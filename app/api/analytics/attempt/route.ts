import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  if (typeof body.unit !== "string" || typeof body.score !== "number" || typeof body.total !== "number") {
    return NextResponse.json({ error: "Invalid attempt" }, { status: 400 });
  }

  const { error } = await supabase.from("quiz_attempts").insert({
    user_id: user.id,
    unit: body.unit,
    score: body.score,
    total: body.total,
    completed_at: typeof body.at === "string" ? body.at : new Date().toISOString(),
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
