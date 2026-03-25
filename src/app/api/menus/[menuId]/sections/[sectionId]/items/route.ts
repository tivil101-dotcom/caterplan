import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; sectionId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sectionId } = await params;
  const { supabase, organisationId } = auth;
  const body = await request.json();

  const {
    name,
    description,
    dietary_flags,
    allergens,
    portion_notes,
    prep_notes,
    sort_order,
  } = body as {
    name: string;
    description?: string;
    dietary_flags?: string[];
    allergens?: string[];
    portion_notes?: string;
    prep_notes?: string;
    sort_order?: number;
  };

  // Name can be empty on create — user fills it in via the editor
  // Get next sort_order if not provided
  let order = sort_order;
  if (order === undefined) {
    const { data: existing } = await supabase
      .from("menu_items")
      .select("sort_order")
      .eq("menu_section_id", sectionId)
      .order("sort_order", { ascending: false })
      .limit(1);

    order = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;
  }

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      organisation_id: organisationId,
      menu_section_id: sectionId,
      name: name?.trim() ?? "",
      description: description?.trim() || null,
      dietary_flags: dietary_flags || [],
      allergens: allergens || [],
      portion_notes: portion_notes?.trim() || null,
      prep_notes: prep_notes?.trim() || null,
      sort_order: order,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
