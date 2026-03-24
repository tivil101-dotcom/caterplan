"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "./status-badge";
import { StatusWorkflow } from "./status-workflow";
import {
  getEventDayGuestCount,
  getEventTotalGuests,
  type CaterEvent,
  type EventStatus,
} from "@/lib/events/types";

interface EventDetailProps {
  event: CaterEvent;
}

const PLACEHOLDER_SECTIONS = [
  "Menus",
  "Budget",
  "Dietary Requirements",
  "Staffing",
  "Equipment",
  "Kitchen Sheet",
  "Tastings",
];

export function EventDetail({ event: initialEvent }: EventDetailProps) {
  const router = useRouter();
  const [event, setEvent] = useState(initialEvent);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const totalGuests = getEventTotalGuests(event);

  const handleStatusChange = useCallback(
    async (status: EventStatus) => {
      const res = await fetch(`/api/events/${event.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setEvent((prev) => ({ ...prev, status }));
      }
    },
    [event.id]
  );

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/events/${event.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/events");
    } else {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [event.id, router]);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-400">{event.event_id}</p>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {event.name}
          </h1>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-sm text-zinc-500">
              {event.event_types?.name}
            </span>
            <StatusBadge status={event.status} />
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/events/${event.id}/edit`}>
            <Button variant="outline" size="sm">
              <Edit className="mr-1 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Are you sure you want to delete this event? This cannot be undone.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 bg-red-100 text-red-700 hover:bg-red-200 dark:border-red-800 dark:bg-red-900 dark:text-red-200"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Status workflow */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusWorkflow
            currentStatus={event.status}
            onStatusChange={handleStatusChange}
          />
        </CardContent>
      </Card>

      {/* Event days with nested services */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Event days
            {totalGuests > 0 && (
              <span className="ml-2 text-sm font-normal text-zinc-500">
                {totalGuests} total guests
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {event.event_days && event.event_days.length > 0 ? (
            <div className="space-y-4">
              {event.event_days.map((day) => {
                const dayGuests = getEventDayGuestCount(day);
                return (
                  <div
                    key={day.id}
                    className="rounded-md border border-zinc-100 dark:border-zinc-800"
                  >
                    {/* Day header */}
                    <div className="flex items-center justify-between px-3 py-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">
                            {day.label || "Event day"}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {day.date
                              ? new Date(
                                  day.date + "T00:00:00"
                                ).toLocaleDateString("en-GB", {
                                  weekday: "short",
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "No date set"}
                          </p>
                        </div>
                      </div>
                      {dayGuests > 0 && (
                        <span className="flex items-center gap-1 text-sm text-zinc-500">
                          <Users className="h-3.5 w-3.5" />
                          {dayGuests}
                        </span>
                      )}
                    </div>

                    {/* Services */}
                    {day.event_services && day.event_services.length > 0 && (
                      <div className="border-t border-zinc-100 px-3 py-2 dark:border-zinc-800">
                        <div className="space-y-1">
                          {day.event_services.map((svc) => (
                            <div
                              key={svc.id}
                              className="flex items-center justify-between py-0.5 text-sm"
                            >
                              <span className="text-zinc-600 dark:text-zinc-400">
                                {svc.name || "Service"}
                              </span>
                              {svc.guest_count != null && (
                                <span className="text-xs text-zinc-400">
                                  {svc.guest_count} guests
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No event days added.</p>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      {event.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {event.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Placeholder sections */}
      <div className="grid gap-3 sm:grid-cols-2">
        {PLACEHOLDER_SECTIONS.map((section) => (
          <Card key={section}>
            <CardHeader>
              <CardTitle className="text-base">{section}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-400">Coming soon</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
