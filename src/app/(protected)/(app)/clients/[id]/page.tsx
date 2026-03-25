import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientDetail } from "@/components/clients/client-detail";
import type { Client } from "@/lib/clients/types";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clients")
    .select(
      "*, events(id, event_id, name, status, event_types(name), event_days(date, sort_order))"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    notFound();
  }

  return <ClientDetail client={data as Client} />;
}
