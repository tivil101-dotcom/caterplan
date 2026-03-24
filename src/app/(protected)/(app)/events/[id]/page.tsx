import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EventDetail } from "@/components/events/event-detail";
import type { CaterEvent } from "@/lib/events/types";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("events")
    .select("*, event_types(*), service_days(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  // Sort service days by sort_order
  if (data.service_days) {
    data.service_days.sort(
      (a: { sort_order: number }, b: { sort_order: number }) =>
        a.sort_order - b.sort_order
    );
  }

  return <EventDetail event={data as CaterEvent} />;
}
