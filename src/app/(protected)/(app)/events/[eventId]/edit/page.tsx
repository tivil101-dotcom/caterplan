"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { EventForm } from "@/components/events/event-form";
import type { CaterEvent } from "@/lib/events/types";

export default function EditEventPage() {
  const params = useParams<{ eventId: string }>();
  const router = useRouter();
  const [event, setEvent] = useState<CaterEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/events/${params.eventId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvent(data);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [params.eventId]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!event) {
    return (
      <p className="text-sm text-zinc-500">Event not found.</p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Edit event
      </h1>
      <p className="mt-1 text-sm text-zinc-500">{event.event_id}</p>
      <div className="mt-6">
        <EventForm
          event={event}
          onSuccess={() => router.push(`/events/${event.id}`)}
        />
      </div>
    </div>
  );
}
