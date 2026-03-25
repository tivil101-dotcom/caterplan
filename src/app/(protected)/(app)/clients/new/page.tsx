"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClientForm } from "@/components/clients/client-form";

export default function NewClientPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        New client
      </h1>
      <ClientForm onSuccess={(id) => router.push(`/clients/${id}`)} />
    </div>
  );
}
