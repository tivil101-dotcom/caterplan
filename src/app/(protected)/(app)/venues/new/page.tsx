"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VenueForm } from "@/components/venues/venue-form";

export default function NewVenuePage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/venues"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to venues
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        New venue
      </h1>
      <VenueForm onSuccess={(id) => router.push(`/venues/${id}`)} />
    </div>
  );
}
