import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function PUT(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ menuId: string; sectionId: string; itemId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const { supabase } = auth;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined)
    updates.description = body.description?.trim() || null;
  if (body.dietary_flags !== undefined)
    updates.dietary_flags = body.dietary_flags;
  if (body.allergens !== undefined) updates.allergens = body.allergens;
  if (body.portion_notes !== undefined)
    updates.portion_notes = body.portion_notes?.trim() || null;
  if (body.prep_notes !== undefined)
    updates.prep_notes = body.prep_notes?.trim() || null;
  if (body.sort_order !== undefined) updates.sort_order = body.sort_order;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("menu_items")
    .update(updates)
    .eq("id", itemId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ menuId: string; sectionId: string; itemId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId } = await params;
  const { supabase } = auth;

  const { error } = await supabase
    .from("menu_items")
    .delete()
    .eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
