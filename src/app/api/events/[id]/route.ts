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
    .select("*, event_types(*), service_days(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  // Sort service days by sort_order
  if (data.service_days) {
    data.service_days.sort(
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

  const { name, event_type_id, notes, service_days } = body as {
    name?: string;
    event_type_id?: string;
    notes?: string;
    service_days?: { date?: string; guest_count?: number; label?: string }[];
  };

  // Build the update object
  const updates: Record<string, unknown> = {};
  if (name !== undefined) updates.name = name.trim();
  if (notes !== undefined) updates.notes = notes?.trim() || null;

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
        service_days?.[0]?.date ? new Date(service_days[0].date) : new Date();
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

  // Replace service days if provided
  if (service_days !== undefined) {
    // Delete existing
    await supabase.from("service_days").delete().eq("event_id", id);

    // Insert new
    if (service_days.length > 0) {
      const dayRows = service_days.map((day, i) => ({
        event_id: id,
        organisation_id: organisationId,
        date: day.date || null,
        guest_count: day.guest_count || null,
        label: day.label?.trim() || null,
        sort_order: i,
      }));

      const { error: daysError } = await supabase
        .from("service_days")
        .insert(dayRows);

      if (daysError) {
        return NextResponse.json({ error: daysError.message }, { status: 500 });
      }
    }
  }

  // Fetch and return the updated event
  const { data: updated } = await supabase
    .from("events")
    .select("*, event_types(*), service_days(*)")
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
