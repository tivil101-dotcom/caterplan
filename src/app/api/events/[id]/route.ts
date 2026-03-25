import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";
import { generateEventId } from "@/lib/events/generate-event-id";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { supabase } = auth;

  const { data, error } = await supabase
    .from("events")
    .select("*, event_types(*), event_days(*, event_services(*)), event_clients(*, clients(id, name, company, email, phone)), venues(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Sort event days and their services
  if (data.event_days) {
    data.event_days.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    );
    for (const day of data.event_days) {
      if (day.event_services) {
        day.event_services.sort(
          (a: { sort_order: number }, b: { sort_order: number }) =>
            a.sort_order - b.sort_order
        );
      }
    }
  }

  // Sort event clients
  if (data.event_clients) {
    data.event_clients.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    );
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { supabase, organisationId } = auth;
  const body = await request.json();

  const { name, event_type_id, venue_id, notes, event_days, event_clients } =
    body as {
      name?: string;
      event_type_id?: string;
      venue_id?: string | null;
      notes?: string;
      event_days?: {
        date?: string;
        label?: string;
        services?: { name?: string; guest_count?: number }[];
      }[];
      event_clients?: { client_id: string; role?: string }[];
    };

  // Build the update object
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (notes !== undefined) updates.notes = notes?.trim() || null;
  if (venue_id !== undefined) updates.venue_id = venue_id || null;

  // If event type changed, regenerate event ID
  if (event_type_id) {
    updates.event_type_id = event_type_id;

    const { data: eventType } = await supabase
      .from("event_types")
      .select("letter_code")
      .eq("id", event_type_id)
      .single();

    if (eventType) {
      const firstDate =
        event_days?.[0]?.date ? new Date(event_days[0].date) : new Date();
      updates.event_id = generateEventId(eventType.letter_code, firstDate);
    }
  }

  if (Object.keys(updates).length > 0) {
    const { error } = await supabase
      .from("events")
      .update(updates)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Replace event days and services if provided
  if (event_days !== undefined) {
    // Delete existing days (cascades to event_services)
    await supabase.from("event_days").delete().eq("event_id", id);

    // Insert new days with services
    for (let i = 0; i < event_days.length; i++) {
      const day = event_days[i];

      const { data: insertedDay, error: dayError } = await supabase
        .from("event_days")
        .insert({
          event_id: id,
          organisation_id: organisationId,
          date: day.date || null,
          label: day.label?.trim() || null,
          sort_order: i,
        })
        .select("id")
        .single();

      if (dayError || !insertedDay) continue;

      const services = day.services?.length
        ? day.services
        : [{ name: "", guest_count: undefined }];

      const serviceRows = services.map((svc, j) => ({
        event_day_id: insertedDay.id,
        organisation_id: organisationId,
        name: svc.name?.trim() ?? "",
        guest_count: svc.guest_count ?? null,
        sort_order: j,
      }));

      await supabase.from("event_services").insert(serviceRows);
    }
  }

  // Replace event clients if provided
  if (event_clients !== undefined) {
    await supabase.from("event_clients").delete().eq("event_id", id);

    if (event_clients.length > 0) {
      const clientRows = event_clients.map((ec, i) => ({
        organisation_id: organisationId,
        event_id: id,
        client_id: ec.client_id,
        role: ec.role || "end_client",
        sort_order: i,
      }));

      await supabase.from("event_clients").insert(clientRows);
    }
  }

  // Fetch and return the updated event
  const { data: updated } = await supabase
    .from("events")
    .select("*, event_types(*), event_days(*, event_services(*)), event_clients(*, clients(id, name, company, email, phone)), venues(*)")
    .eq("id", id)
    .single();

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { supabase } = auth;

  const { error } = await supabase.from("events").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
