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
    .select("*, event_types(*), event_days(*, event_services(*)), clients(*), venues(*)")
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

  const { name, event_type_id, client_id, venue_id, notes, event_days } =
    body as {
      name: string;
      event_type_id: string;
      client_id?: string | null;
      venue_id?: string | null;
      notes?: string;
      event_days?: {
        date?: string;
        label?: string;
        services?: { name?: string; guest_count?: number }[];
      }[];
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
    event_days?.[0]?.date ? new Date(event_days[0].date) : new Date();
  const eventId = generateEventId(eventType.letter_code, firstDate);

  // Insert the event
  const { data: event, error: eventError } = await supabase
    .from("events")
    .insert({
      organisation_id: organisationId,
      event_type_id,
      event_id: eventId,
      name: name.trim(),
      client_id: client_id || null,
      venue_id: venue_id || null,
      notes: notes?.trim() || null,
    })
    .select("id")
    .single();

  if (eventError) {
    return NextResponse.json({ error: eventError.message }, { status: 500 });
  }

  // Insert event days and their services
  if (event_days && event_days.length > 0) {
    for (let i = 0; i < event_days.length; i++) {
      const day = event_days[i];

      const { data: insertedDay, error: dayError } = await supabase
        .from("event_days")
        .insert({
          event_id: event.id,
          organisation_id: organisationId,
          date: day.date || null,
          label: day.label?.trim() || null,
          sort_order: i,
        })
        .select("id")
        .single();

      if (dayError || !insertedDay) {
        return NextResponse.json(
          { error: dayError?.message ?? "Failed to create event day" },
          { status: 500 }
        );
      }

      // Insert services for this day
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

      const { error: svcError } = await supabase
        .from("event_services")
        .insert(serviceRows);

      if (svcError) {
        return NextResponse.json({ error: svcError.message }, { status: 500 });
      }
    }
  }

  return NextResponse.json(
    { id: event.id, event_id: eventId },
    { status: 201 }
  );
}
