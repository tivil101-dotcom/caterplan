import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string; sectionId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await params;
  const { supabase } = auth;
  const body = await request.json();

  const { items } = body as {
    items: { id: string; sort_order: number }[];
  };

  if (!items?.length) {
    return NextResponse.json(
      { error: "items array is required" },
      { status: 400 }
    );
  }

  for (const item of items) {
    const { error } = await supabase
      .from("menu_items")
      .update({ sort_order: item.sort_order })
      .eq("id", item.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
