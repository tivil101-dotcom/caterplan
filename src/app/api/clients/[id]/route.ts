import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("clients")
    .select("*, event_clients(id, role, sort_order, events(id, event_id, name, status, event_types(name), event_days(date, sort_order)))")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { supabase } = auth;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  const fields = [
    "name",
    "company",
    "email",
    "phone",
    "address",
    "notes",
    "preferences",
  ];

  for (const field of fields) {
    if (body[field] !== undefined) {
      const val = body[field] as string | null;
      updates[field] = val?.trim() || null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { supabase } = auth;

  const { error } = await supabase.from("clients").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
