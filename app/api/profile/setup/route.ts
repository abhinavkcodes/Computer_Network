import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const registrationPattern = /^RA2[A-Z0-9]{12}$/i;

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const fullName = typeof body.full_name === "string" ? body.full_name.trim() : "";
  const registrationNumber = typeof body.registration_number === "string" ? body.registration_number.trim().toUpperCase() : "";
  if (fullName.length < 2) return NextResponse.json({ error: "Enter your full name." }, { status: 400 });
  if (!registrationPattern.test(registrationNumber)) return NextResponse.json({ error: "Registration number must look like RA2XXXXXXXXXXXX." }, { status: 400 });

  const { data, error } = await supabase
    .from("profiles")
    .update({ full_name: fullName, registration_number: registrationNumber })
    .eq("id", user.id)
    .select("full_name, registration_number")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}