import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ itemId: string; altItemId: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { itemId, altItemId } = await params;
  const { supabase } = auth;

  const { error } = await supabase
    .from("menu_item_alternatives")
    .delete()
    .eq("menu_item_id", itemId)
    .eq("alternative_item_id", altItemId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
