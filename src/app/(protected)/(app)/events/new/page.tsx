"use client";

import { useRouter } from "next/navigation";
import { EventForm } from "@/components/events/event-form";

export default function NewEventPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
        Create event
      </h1>
      <p className="mt-1 text-sm text-zinc-500">
        Set up a new catering event
      </p>
      <div className="mt-6">
        <EventForm onSuccess={(id) => router.push(`/events/${id}`)} />
      </div>
    </div>
  );
}
