import { NextResponse, type NextRequest } from "next/server";
import { getAuthenticatedClient } from "@/lib/supabase/api";
import { generateEventId } from "@/lib/events/generate-event-id";

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedClient();
  if (!auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { supabase } = auth;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const search = searchParams.get("search");

  let query = supabase
    .from("events")
    .select("*, event_types(*), service_days(*)")
    .order("created_at", { ascending: false });

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.or(`name.ilike.%${search}%,event_id.ilike.%${search}%`);
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

  const { name, event_type_id, notes, service_days } = body as {
    name: string;
    event_type_id: string;
    notes?: string;
    service_days?: { date?: string; guest_count?: number; label?: string }[];
  };

  if (!name?.trim()) {
    return NextResponse.json(
      { error: "Event name is required" },
      { status: 400 }
    );
  }

  if (!event_type_id) {
    return NextResponse.json(
      { error: "Event type is required" },
      { status: 400 }
    );
  }

  // Get event type for the letter code
  const { data: eventType, error: typeError } = await supabase
    .from("event_types")
    .select("letter_code")
    .eq("id", event_type_id)
    .single();

  if (typeError || !eventType) {
    return NextResponse.json(
      { error: "Invalid event type" },
      { status: 400 }
    );
  }

  // Determine date for event ID generation
  const firstDate =
    service_days?.[0]?.date ? new Date(service_days[0].date) : new Date();
  const eventId = generateEventId(eventType.letter_code, firstDate);

  // Insert the event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      organisation_id: organisationId,
      event_type_id,
      event_id: eventId,
      name: name.trim(),
      notes: notes?.trim() || null,
    })
    .select("id")
    .single();

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  // Insert service days
  if (service_days && service_days.length > 0) {
    const dayRows = service_days.map((day, i) => ({
      event_id: event.id,
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

  return NextResponse.json({ id: event.id, event_id: eventId }, { status: 201 });
}
