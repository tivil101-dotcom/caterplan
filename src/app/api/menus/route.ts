import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";
import { getDefaultSections } from "@/lib/menus/types";
import type { ServiceStyle } from "@/lib/menus/types";

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabase, organisationId } = auth;
  const { searchParams } = new URL(request.url);
  const serviceStyle = searchParams.get("service_style");
  const search = searchParams.get("search");

  let query = supabase
    .from("menus")
    .select("*, menu_sections(id, name, sort_order, menu_items(id))")
    .eq("organisation_id", organisationId)
    .eq("is_template", true)
    .order("created_at", { ascending: false });

  if (serviceStyle && serviceStyle !== "all") {
    query = query.eq("service_style", serviceStyle);
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabase, organisationId } = auth;
  const body = await request.json();

  const { name, description, menu_type, service_style, is_template, event_service_id } =
    body as {
      name: string;
      description?: string;
      menu_type?: string;
      service_style?: string | null;
      is_template?: boolean;
      event_service_id?: string | null;
    };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Menu name is required" },
      { status: 400 }
    );
  }

  const { data: menu, error } = await supabase
    .from("menus")
    .insert({
      organisation_id: organisationId,
      name: name.trim(),
      description: description?.trim() || null,
      menu_type: menu_type || "food",
      service_style: service_style || null,
      is_template: is_template ?? true,
      event_service_id: event_service_id || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Create default sections based on service style
  const defaultSections = getDefaultSections(
    (service_style as ServiceStyle) || null
  );

  if (defaultSections.length > 0) {
    const sectionRows = defaultSections.map((name, i) => ({
      organisation_id: organisationId,
      menu_id: menu.id,
      name,
      sort_order: i,
    }));

    await supabase.from("menu_sections").insert(sectionRows);
  }

  return NextResponse.json(menu, { status: 201 });
}
