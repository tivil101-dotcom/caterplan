import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ menuItemId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { menuItemId } = await params;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("menu_item_alternatives")
    .select("id, menu_item_id, alternative_item_id, reason, created_at")
    .eq("menu_item_id", menuItemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch alternative item details separately
  if (data && data.length > 0) {
    const altIds = data.map((a: { alternative_item_id: string }) => a.alternative_item_id);
    const { data: altItems } = await supabase
      .from("menu_items")
      .select("id, name, description, dietary_flags")
      .in("id", altIds);

    const itemMap = new Map(
      (altItems ?? []).map((i: { id: string }) => [i.id, i])
    );

    for (const alt of data) {
      (alt as Record<string, unknown>).alternative_item =
        itemMap.get(alt.alternative_item_id) ?? null;
    }
  }

  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuItemId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { menuItemId } = await params;
  const { supabase, organisationId } = auth;
  const body = await request.json();

  const { alternative_item_id, reason } = body as {
    alternative_item_id: string;
    reason?: string | null;
  };

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
      menu_item_id: menuItemId,
      alternative_item_id,
      reason: reason || null,
    })
    .select("id, menu_item_id, alternative_item_id, reason, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch the alternative item details
  const { data: altItem } = await supabase
    .from("menu_items")
    .select("id, name, description, dietary_flags")
    .eq("id", alternative_item_id)
    .single();

  return NextResponse.json(
    { ...data, alternative_item: altItem ?? null },
    { status: 201 }
  );
}
