"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { VenueForm } from "@/components/venues/venue-form";
import type { Venue } from "@/lib/venues/types";

export default function EditVenuePage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/venues/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setVenue(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href={`/venues/${id}`}
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to venue
      </Link>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Edit venue
      </h1>
      <VenueForm
        venue={venue}
        onSuccess={() => router.push(`/venues/${id}`)}
      />
    </div>
  );
}
