import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./dashboard-content";
import type { CaterEvent } from "@/lib/events/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, organisations(*)")
    .eq("id", user.id)
    .single();

  // No organisation yet — send to onboarding
  if (!profile?.organisation_id) {
    redirect("/onboarding");
  }

  // Fetch upcoming events (next 5 that aren't complete)
  const { data: upcomingEvents } = await supabase
    .from("events")
    .select("*, event_types(*), service_days(*)")
    .neq("status", "complete")
    .order("created_at", { ascending: false })
    .limit(5);

  // Fetch status counts
  const { data: allEvents } = await supabase
    .from("events")
    .select("status");

  const statusCounts: Record<string, number> = {};
  allEvents?.forEach((e: { status: string }) => {
    statusCounts[e.status] = (statusCounts[e.status] ?? 0) + 1;
  });

  return (
    <DashboardContent
      userName={profile.full_name ?? "User"}
      upcomingEvents={(upcomingEvents as CaterEvent[]) ?? []}
      statusCounts={statusCounts}
    />
  );
}
