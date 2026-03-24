import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "./server";

interface AuthResult {
  supabase: SupabaseClient;
  user: User;
  organisationId: string;
}

/**
 * Get an authenticated Supabase client for API route handlers.
 * Returns the client, user, and their organisation ID.
 * Returns null if the user is not authenticated or has no org.
 */
export async function getAuthenticatedClient(): Promise<AuthResult | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null;

  const { data: orgId } = await supabase.rpc("get_user_organisation_id");

  if (!orgId) return null;

  return { supabase, user, organisationId: orgId as string };
}
