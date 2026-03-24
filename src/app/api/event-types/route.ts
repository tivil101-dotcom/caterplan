import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function GET() {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabase } = auth;

  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabase, organisationId } = auth;
  const body = await request.json();
  const { name, letter_code } = body as {
    name: string;
    letter_code: string;
  };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  if (!letter_code?.trim() || letter_code.trim().length !== 1) {
    return NextResponse.json(
      { error: "Letter code must be a single character" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("event_types")
    .insert({
      organisation_id: organisationId,
      name: name.trim(),
      letter_code: letter_code.trim().toUpperCase(),
    })
    .select("*")
    .single();

  if (error) {
    if (error.message.includes("unique")) {
      return NextResponse.json(
        { error: "An event type with that name or letter code already exists" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
