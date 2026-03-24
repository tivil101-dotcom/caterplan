"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Plus } from "lucide-react";
import { StatusBadge } from "@/components/events/status-badge";
import {
  EVENT_STATUSES,
  getEventTotalGuests,
  type CaterEvent,
  type EventStatus,
} from "@/lib/events/types";

interface DashboardContentProps {
  userName: string;
  upcomingEvents: CaterEvent[];
  statusCounts: Record<string, number>;
}

export function DashboardContent({
  userName,
  upcomingEvents,
  statusCounts,
}: DashboardContentProps) {
  const totalEvents = Object.values(statusCounts).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-zinc-500">Welcome back, {userName}</p>
        </div>
        <Link href="/events/new">
          <Button size="sm">
            <Plus className="mr-1 h-4 w-4" />
            New event
          </Button>
        </Link>
      </div>

      {/* Status counts */}
      {totalEvents > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {EVENT_STATUSES.map((s) => {
            const count = statusCounts[s] ?? 0;
            if (count === 0) return null;
            return (
              <div
                key={s}
                className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-sm dark:border-zinc-800"
              >
                <StatusBadge status={s as EventStatus} />
                <span className="font-medium text-zinc-700 dark:text-zinc-300">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Upcoming events */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Upcoming events</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center py-6 text-center">
              <Calendar className="mb-2 h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="text-sm text-zinc-500">No upcoming events</p>
              <Link href="/events/new">
                <Button size="sm" variant="outline" className="mt-3">
                  Create your first event
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingEvents.map((event) => {
                const firstDay = event.event_days?.[0];
                const totalGuests = getEventTotalGuests(event);
                return (
                  <Link
                    key={event.id}
                    href={`/events/${event.id}`}
                    className="flex items-center justify-between rounded-md border border-zinc-100 px-3 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                        {event.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {firstDay?.date
                          ? new Date(
                              firstDay.date + "T00:00:00"
                            ).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })
                          : "No date"}
                        {totalGuests > 0 ? ` · ${totalGuests} guests` : ""}
                      </p>
                    </div>
                    <StatusBadge status={event.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
