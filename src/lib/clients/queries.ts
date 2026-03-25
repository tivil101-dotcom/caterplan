import type { SupabaseClient } from "@supabase/supabase-js";

const CLIENT_DETAIL_SELECT =
  "*, event_clients(id, role, sort_order, events(id, event_id, name, status, event_types(name), event_days(date, sort_order)))";

/**
 * Fetch a single client with event history via event_clients.
 * Shared between the API route and the server component.
 */
export async function fetchClientById(
  supabase: SupabaseClient,
  clientId: string
) {
  return supabase
    .from("clients")
    .select(CLIENT_DETAIL_SELECT)
    .eq("id", clientId)
    .single();
}
