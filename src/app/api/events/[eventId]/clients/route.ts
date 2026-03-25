import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("event_clients")
    .select("*, clients(id, name, company, email, phone)")
    .eq("event_id", eventId)
    .order("sort_order", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;
  const { supabase, organisationId } = auth;
  const body = await request.json();

  const { client_id, role, sort_order } = body as {
    client_id: string;
    role?: string;
    sort_order?: number;
  };

  if (!client_id) {
    return NextResponse.json(
      { error: "client_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("event_clients")
    .insert({
      organisation_id: organisationId,
      event_id: eventId,
      client_id,
      role: role || "end_client",
      sort_order: sort_order ?? 0,
    })
    .select("*, clients(id, name, company, email, phone)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
