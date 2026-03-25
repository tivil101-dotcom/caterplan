import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ menuId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await params; // consume params
  const { supabase } = auth;
  const body = await request.json();

  const { sections } = body as {
    sections: { id: string; sort_order: number }[];
  };

  if (!sections?.length) {
    return NextResponse.json(
      { error: "sections array is required" },
      { status: 400 }
    );
  }

  // Update each section's sort_order
  for (const section of sections) {
    const { error } = await supabase
      .from("menu_sections")
      .update({ sort_order: section.sort_order })
      .eq("id", section.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  return NextResponse.json({ success: true });
}
