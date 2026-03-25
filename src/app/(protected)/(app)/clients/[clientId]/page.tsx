import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ClientDetail } from "@/components/clients/client-detail";
import { fetchClientById } from "@/lib/clients/queries";
import type { Client } from "@/lib/clients/types";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const supabase = await createClient();

  const { data, error } = await fetchClientById(supabase, clientId);

  if (error || !data) {
    notFound();
  }

  return <ClientDetail client={data as Client} />;
}
