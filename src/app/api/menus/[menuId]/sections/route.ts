import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { menuId } = await params;
  const { supabase, organisationId } = auth;
  const body = await request.json();

  const { name, sort_order } = body as {
    name: string;
    sort_order?: number;
  };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Section name is required" },
      { status: 400 }
    );
  }

  // Get the next sort_order if not provided
  let order = sort_order;
  if (order === undefined) {
    const { data: existing } = await supabase
      .from("menu_sections")
      .select("sort_order")
      .eq("menu_id", menuId)
      .order("sort_order", { ascending: false })
      .limit(1);

    order = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
  }

  const { data, error } = await supabase
    .from("menu_sections")
    .insert({
      organisation_id: organisationId,
      menu_id: menuId,
      name: name.trim(),
      sort_order: order,
    })
    .select("*, menu_items(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
