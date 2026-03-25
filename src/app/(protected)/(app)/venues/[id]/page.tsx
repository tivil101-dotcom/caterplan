import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VenueDetail } from "@/components/venues/venue-detail";
import type { Venue } from "@/lib/venues/types";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("venues")
    .select(
      "*, events(id, event_id, name, status, event_types(name), event_days(date, sort_order))"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return <VenueDetail venue={data as Venue} />;
}
