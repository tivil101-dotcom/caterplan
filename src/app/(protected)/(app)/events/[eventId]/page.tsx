import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventDetail } from "@/components/events/event-detail";
import { fetchEventById } from "@/lib/events/queries";
import type { CaterEvent } from "@/lib/events/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const supabase = await createClient();

  const { data, error } = await fetchEventById(supabase, eventId);

  if (error || !data) {
    notFound();
  }

  return <EventDetail event={data as CaterEvent} />;
}
