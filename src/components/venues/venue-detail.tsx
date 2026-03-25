"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Car,
  Edit,
  Mail,
  MapPin,
  Phone,
  Plug,
  Trash2,
  Truck,
  UtensilsCrossed,
  User,
} from "lucide-react";
import { StatusBadge } from "@/components/events/status-badge";
import type { Venue } from "@/lib/venues/types";
import type { EventStatus } from "@/lib/events/types";

interface VenueDetailProps {
  venue: Venue;
}

interface PracticalItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function PracticalItem({ icon, label, value }: PracticalItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500">
        {icon}
        {label}
      </div>
      <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
        {value}
      </p>
    </div>
  );
}

export function VenueDetail({ venue }: VenueDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/venues/${venue.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/venues");
    } else {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [venue.id, router]);

  const events = (venue.events ?? []) as Array<{
    id: string;
    event_id: string;
    name: string;
    status: EventStatus;
    event_types?: { name: string };
    event_days?: { date: string | null; sort_order: number }[];
  }>;

  const hasPracticalDetails =
    venue.parking ||
    venue.power_access ||
    venue.load_in_restrictions ||
    venue.kitchen_facilities;

  return (
    <div className="space-y-6">
      <Link
        href="/venues"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to venues
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {venue.name}
          </h1>
          {venue.address && (
            <p className="mt-0.5 text-sm text-zinc-500">{venue.address}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/venues/${venue.id}/edit`}>
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

      {showDeleteConfirm && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Delete this venue? Events linked to it will keep their data but the
            venue reference will be removed.
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 bg-red-100 text-red-700 hover:bg-red-200"
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

      {/* Contact info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {venue.contact_person && (
            <p className="flex items-center gap-2">
              <User className="h-4 w-4 text-zinc-400" />
              {venue.contact_person}
            </p>
          )}
          {venue.contact_email && (
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-400" />
              {venue.contact_email}
            </p>
          )}
          {venue.contact_phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-400" />
              {venue.contact_phone}
            </p>
          )}
          {venue.address && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              {venue.address}
            </p>
          )}
          {!venue.contact_person &&
            !venue.contact_email &&
            !venue.contact_phone && (
              <p className="text-zinc-400">No contact details added.</p>
            )}
        </CardContent>
      </Card>

      {/* Practical details — prominent reference card */}
      {hasPracticalDetails && (
        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-base">Practical details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {venue.parking && (
              <PracticalItem
                icon={<Car className="h-3.5 w-3.5" />}
                label="Parking"
                value={venue.parking}
              />
            )}
            {venue.power_access && (
              <PracticalItem
                icon={<Plug className="h-3.5 w-3.5" />}
                label="Power access"
                value={venue.power_access}
              />
            )}
            {venue.load_in_restrictions && (
              <PracticalItem
                icon={<Truck className="h-3.5 w-3.5" />}
                label="Load-in restrictions"
                value={venue.load_in_restrictions}
              />
            )}
            {venue.kitchen_facilities && (
              <PracticalItem
                icon={<UtensilsCrossed className="h-3.5 w-3.5" />}
                label="Kitchen facilities"
                value={venue.kitchen_facilities}
              />
            )}
          </CardContent>
        </Card>
      )}

      {venue.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {venue.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Event history */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Event history</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p className="text-sm text-zinc-400">No events at this venue yet.</p>
          ) : (
            <div className="space-y-2">
              {events.map((event) => {
                const firstDay = event.event_days
                  ?.sort((a, b) => a.sort_order - b.sort_order)?.[0];
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
                        {event.event_id}
                        {firstDay?.date &&
                          ` · ${new Date(firstDay.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
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
