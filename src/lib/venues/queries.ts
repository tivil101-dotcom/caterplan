import type { SupabaseClient } from "@supabase/supabase-js";

const VENUE_DETAIL_SELECT =
  "*, events(id, event_id, name, status, event_types(name), event_days(date, sort_order))";

/**
 * Fetch a single venue with event history.
 * Shared between the API route and the server component.
 */
export async function fetchVenueById(
  supabase: SupabaseClient,
  venueId: string
) {
  return supabase
    .from("venues")
    .select(VENUE_DETAIL_SELECT)
    .eq("id", venueId)
    .single();
}
