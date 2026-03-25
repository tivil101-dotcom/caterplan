import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { menuId } = await params;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("menus")
    .select("*, menu_sections(*, menu_items(*))")
    .eq("id", menuId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Fetch alternatives separately — menu_item_alternatives has two FKs to
  // menu_items which causes ambiguity in nested Supabase selects.
  const allItemIds: string[] = [];
  for (const section of data.menu_sections ?? []) {
    for (const item of section.menu_items ?? []) {
      allItemIds.push(item.id);
    }
  }

  if (allItemIds.length > 0) {
    const { data: alternatives } = await supabase
      .from("menu_item_alternatives")
      .select("id, menu_item_id, alternative_item_id, created_at")
      .in("menu_item_id", allItemIds);

    if (alternatives && alternatives.length > 0) {
      // Fetch the alternative item details
      const altItemIds = [...new Set(alternatives.map((a: { alternative_item_id: string }) => a.alternative_item_id))];
      const { data: altItems } = await supabase
        .from("menu_items")
        .select("id, name, description, dietary_flags")
        .in("id", altItemIds);

      const altItemMap = new Map(
        (altItems ?? []).map((i: { id: string }) => [i.id, i])
      );

      // Group alternatives by menu_item_id
      const altsByItem = new Map<string, unknown[]>();
      for (const alt of alternatives) {
        const enriched = {
          ...alt,
          alternative_item: altItemMap.get(alt.alternative_item_id) ?? null,
        };
        const existing = altsByItem.get(alt.menu_item_id) ?? [];
        existing.push(enriched);
        altsByItem.set(alt.menu_item_id, existing);
      }

      // Attach to items
      for (const section of data.menu_sections ?? []) {
        for (const item of section.menu_items ?? []) {
          (item as Record<string, unknown>).menu_item_alternatives =
            altsByItem.get(item.id) ?? [];
        }
      }
    } else {
      // No alternatives — set empty arrays
      for (const section of data.menu_sections ?? []) {
        for (const item of section.menu_items ?? []) {
          (item as Record<string, unknown>).menu_item_alternatives = [];
        }
      }
    }
  }

  // Sort sections and items by sort_order
  if (data.menu_sections) {
    data.menu_sections.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    );
    for (const section of data.menu_sections) {
      if (section.menu_items) {
        section.menu_items.sort(
          (a: { sort_order: number }, b: { sort_order: number }) =>
            a.sort_order - b.sort_order
        );
      }
    }
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { menuId } = await params;
  const { supabase } = auth;
  const body = await request.json();

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name.trim();
  if (body.description !== undefined)
    updates.description = body.description?.trim() || null;
  if (body.service_style !== undefined)
    updates.service_style = body.service_style || null;
  if (body.menu_type !== undefined) updates.menu_type = body.menu_type;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("menus")
    .update(updates)
    .eq("id", menuId)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { menuId } = await params;
  const { supabase } = auth;

  const { error } = await supabase.from("menus").delete().eq("id", menuId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
