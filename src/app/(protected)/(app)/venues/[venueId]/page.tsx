import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VenueDetail } from "@/components/venues/venue-detail";
import { fetchVenueById } from "@/lib/venues/queries";
import type { Venue } from "@/lib/venues/types";

export default async function VenueDetailPage({
  params,
}: {
  params: Promise<{ venueId: string }>;
}) {
  const { venueId } = await params;
  const supabase = await createClient();

  const { data, error } = await fetchVenueById(supabase, venueId);

  if (error || !data) {
    notFound();
  }

  return <VenueDetail venue={data as Venue} />;
}
