import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabase, organisationId } = auth;
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");

  let query = supabase
    .from("venues")
    .select("*")
    .eq("organisation_id", organisationId)
    .order("name");

  if (search) {
    query = query.or(
      `name.ilike.%${search}%,address.ilike.%${search}%,contact_person.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

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

  const {
    name,
    address,
    contact_person,
    contact_email,
    contact_phone,
    parking,
    power_access,
    load_in_restrictions,
    kitchen_facilities,
    notes,
  } = body as Record<string, string | undefined>;

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Venue name is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("venues")
    .insert({
      organisation_id: organisationId,
      name: name.trim(),
      address: address?.trim() || null,
      contact_person: contact_person?.trim() || null,
      contact_email: contact_email?.trim() || null,
      contact_phone: contact_phone?.trim() || null,
      parking: parking?.trim() || null,
      power_access: power_access?.trim() || null,
      load_in_restrictions: load_in_restrictions?.trim() || null,
      kitchen_facilities: kitchen_facilities?.trim() || null,
      notes: notes?.trim() || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
