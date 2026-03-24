"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, Search } from "lucide-react";
import Link from "next/link";
import { EventCard } from "./event-card";
import { EVENT_STATUSES, STATUS_LABELS, type CaterEvent, type EventStatus } from "@/lib/events/types";

export function EventList() {
  const [events, setEvents] = useState<CaterEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<EventStatus | "all">("all");
  const [search, setSearch] = useState("");

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (search.trim()) params.set("search", search.trim());

    const res = await fetch(`/api/events?${params}`);
    if (res.ok) {
      const data = await res.json();
      setEvents(data);
    }
    setIsLoading(false);
  }, [statusFilter, search]);

  useEffect(() => {
    const timer = setTimeout(fetchEvents, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchEvents, search]);

  return (
    <div className="space-y-4">
      {/* Search + filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input
            placeholder="Search events..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as EventStatus | "all")
          }
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-zinc-900"
        >
          <option value="all">All statuses</option>
          {EVENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-300 py-16 text-center dark:border-zinc-700">
          <Calendar className="mb-3 h-10 w-10 text-zinc-300 dark:text-zinc-600" />
          <h3 className="font-medium text-zinc-900 dark:text-white">
            No events yet
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Create your first event to get started.
          </p>
          <Link href="/events/new">
            <Button className="mt-4" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              New event
            </Button>
          </Link>
        </div>
      )}

      {/* Event list */}
      {!isLoading && events.length > 0 && (
        <div className="grid gap-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
