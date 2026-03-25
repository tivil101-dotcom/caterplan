import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; eventClientId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventClientId } = await params;
  const { supabase } = auth;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.role !== undefined) updates.role = body.role;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("event_clients")
    .update(updates)
    .eq("id", eventClientId)
    .select("*, clients(id, name, company, email, phone)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; eventClientId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventClientId } = await params;
  const { supabase } = auth;

  const { error } = await supabase
    .from("event_clients")
    .delete()
    .eq("id", eventClientId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
