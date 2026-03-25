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
    // Fetch forward alternatives (this item has alternatives)
    const { data: forwardAlts } = await supabase
      .from("menu_item_alternatives")
      .select("id, menu_item_id, alternative_item_id, reason, created_at")
      .in("menu_item_id", allItemIds);

    // Fetch reverse alternatives (this item IS an alternative for another)
    const { data: reverseAlts } = await supabase
      .from("menu_item_alternatives")
      .select("id, menu_item_id, alternative_item_id, reason, created_at")
      .in("alternative_item_id", allItemIds);

    // Build item name lookup for all referenced items
    const referencedIds = new Set<string>();
    for (const a of forwardAlts ?? []) referencedIds.add(a.alternative_item_id);
    for (const a of reverseAlts ?? []) referencedIds.add(a.menu_item_id);

    let itemNameMap = new Map<string, { id: string; name: string; description: string | null; dietary_flags: string[] }>();
    if (referencedIds.size > 0) {
      const { data: refItems } = await supabase
        .from("menu_items")
        .select("id, name, description, dietary_flags")
        .in("id", Array.from(referencedIds));
      itemNameMap = new Map(
        (refItems ?? []).map((i: { id: string; name: string; description: string | null; dietary_flags: string[] }) => [i.id, i])
      );
    }

    // Group forward alternatives by menu_item_id
    const forwardByItem = new Map<string, unknown[]>();
    for (const alt of forwardAlts ?? []) {
      const enriched = {
        ...alt,
        alternative_item: itemNameMap.get(alt.alternative_item_id) ?? null,
      };
      const arr = forwardByItem.get(alt.menu_item_id) ?? [];
      arr.push(enriched);
      forwardByItem.set(alt.menu_item_id, arr);
    }

    // Group reverse alternatives by alternative_item_id
    const reverseByItem = new Map<string, unknown[]>();
    for (const alt of reverseAlts ?? []) {
      // Skip if this is also a forward alt for the same item (avoid dupes)
      const enriched = {
        id: alt.id,
        menu_item_id: alt.menu_item_id,
        reason: alt.reason,
        source_item: itemNameMap.get(alt.menu_item_id) ?? { id: alt.menu_item_id, name: "Unknown" },
      };
      const arr = reverseByItem.get(alt.alternative_item_id) ?? [];
      arr.push(enriched);
      reverseByItem.set(alt.alternative_item_id, arr);
    }

    // Attach to items
    for (const section of data.menu_sections ?? []) {
      for (const item of section.menu_items ?? []) {
        (item as Record<string, unknown>).menu_item_alternatives =
          forwardByItem.get(item.id) ?? [];
        (item as Record<string, unknown>).reverse_alternatives =
          reverseByItem.get(item.id) ?? [];
      }
    }
  } else {
    // No items at all
    for (const section of data.menu_sections ?? []) {
      for (const item of section.menu_items ?? []) {
        (item as Record<string, unknown>).menu_item_alternatives = [];
        (item as Record<string, unknown>).reverse_alternatives = [];
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
