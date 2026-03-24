import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DashboardContent } from "./dashboard-content";

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

  return (
    <DashboardContent
      userName={profile.full_name ?? "User"}
      userEmail={profile.email ?? user.email ?? ""}
      userRole={profile.role}
      organisationName={
        (profile.organisations as { name: string } | null)?.name ??
        "No organisation"
      }
    />
  );
}
