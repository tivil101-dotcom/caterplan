import type { SupabaseClient } from "@supabase/supabase-js";

const EVENT_SELECT =
  "*, event_types(*), event_days(*, event_services(*)), event_clients(*, clients(id, name, company, email, phone)), venues(*)";

/**
 * Fetch a single event with all nested data, sorted.
 * Shared between the API route and the server component.
 */
export async function fetchEventById(
  supabase: SupabaseClient,
  eventId: string
) {
  const { data, error } = await supabase
    .from("events")
    .select(EVENT_SELECT)
    .eq("id", eventId)
    .single();

  if (error) return { data: null, error };

  // Sort nested arrays
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

  if (data.event_clients) {
    data.event_clients.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    );
  }

  return { data, error: null };
}

/**
 * Fetch events list with optional filters.
 */
export async function fetchEvents(
  supabase: SupabaseClient,
  opts?: { status?: string; search?: string }
) {
  let query = supabase
    .from("events")
    .select(EVENT_SELECT)
    .order("created_at", { ascending: false });

  if (opts?.status && opts.status !== "all") {
    query = query.eq("status", opts.status);
  }

  if (opts?.search) {
    query = query.or(
      `name.ilike.%${opts.search}%,event_id.ilike.%${opts.search}%`
    );
  }

  return query;
}
