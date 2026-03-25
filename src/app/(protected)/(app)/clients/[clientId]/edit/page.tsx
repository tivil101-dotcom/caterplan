"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClientForm } from "@/components/clients/client-form";
import type { Client } from "@/lib/clients/types";

export default function EditClientPage() {
  const router = useRouter();
  const { clientId } =useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/clients/${clientId}`)
      .then((res) => res.json())
      .then((data) => {
        setClient(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [clientId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!client) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/clients/${clientId}`}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to client
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Edit client
      </h1>
      <ClientForm
        client={client}
        onSuccess={() => router.push(`/clients/${clientId}`)}
      />
    </div>
  );
}
