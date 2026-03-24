import Link from "next/link";
import { Calendar, Users } from "lucide-react";
import { StatusBadge } from "./status-badge";
import type { CaterEvent } from "@/lib/events/types";

interface EventCardProps {
  event: CaterEvent;
}

export function EventCard({ event }: EventCardProps) {
  const firstDay = event.service_days?.[0];
  const totalGuests = event.service_days?.reduce(
    (sum, d) => sum + (d.guest_count ?? 0),
    0
  );
  const formattedDate = firstDay?.date
    ? new Date(firstDay.date + "T00:00:00").toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "No date set";
  const dayCount = event.service_days?.length ?? 0;

  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-lg border border-zinc-200 bg-white p-4 transition-shadow hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-400">{event.event_id}</p>
          <h3 className="mt-0.5 truncate font-medium text-zinc-900 dark:text-white">
            {event.name}
          </h3>
          <p className="mt-0.5 text-xs text-zinc-500">
            {event.event_types?.name}
          </p>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
        <span className="flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5" />
          {formattedDate}
          {dayCount > 1 && ` (+${dayCount - 1} days)`}
        </span>
        {totalGuests ? (
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {totalGuests} guests
          </span>
        ) : null}
      </div>
    </Link>
  );
}
