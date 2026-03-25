import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("menu_item_alternatives")
    .select(
      "*, alternative_item:menu_items!menu_item_alternatives_alternative_item_id_fkey(id, name, description, dietary_flags)"
    )
    .eq("menu_item_id", itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const { supabase, organisationId } = auth;
  const body = await request.json();

  const { alternative_item_id } = body as { alternative_item_id: string };

  if (!alternative_item_id) {
    return NextResponse.json(
      { error: "alternative_item_id is required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("menu_item_alternatives")
    .insert({
      organisation_id: organisationId,
      menu_item_id: itemId,
      alternative_item_id,
    })
    .select(
      "*, alternative_item:menu_items!menu_item_alternatives_alternative_item_id_fkey(id, name, description, dietary_flags)"
    )
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
