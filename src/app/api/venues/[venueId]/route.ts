import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";
import { fetchVenueById } from "@/lib/venues/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { venueId } = await params;
  const { supabase } = auth;

  const { data, error } = await fetchVenueById(supabase, venueId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { venueId } = await params;
  const { supabase } = auth;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  const fields = [
    "name",
    "address",
    "contact_person",
    "contact_email",
    "contact_phone",
    "parking",
    "power_access",
    "load_in_restrictions",
    "kitchen_facilities",
    "notes",
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
    .from("venues")
    .update(updates)
    .eq("id", venueId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ venueId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { venueId } = await params;
  const { supabase } = auth;

  const { error } = await supabase.from("venues").delete().eq("id", venueId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
