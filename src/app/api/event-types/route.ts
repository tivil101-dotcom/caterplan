import { NextResponse } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";

export async function GET() {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabase } = auth;

  const { data, error } = await supabase
    .from("event_types")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
