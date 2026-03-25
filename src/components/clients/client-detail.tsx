"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Building2,
  Edit,
  Mail,
  MapPin,
  Phone,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "@/components/events/status-badge";
import { CLIENT_ROLE_LABELS } from "@/lib/events/types";
import type { Client, ClientEventLink } from "@/lib/clients/types";
import type { EventClientRole, EventStatus } from "@/lib/events/types";

interface ClientDetailProps {
  client: Client;
}

export function ClientDetail({ client }: ClientDetailProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = useCallback(async () => {
    setIsDeleting(true);
    const res = await fetch(`/api/clients/${client.id}`, { method: "DELETE" });
    if (res.ok) {
      router.push("/clients");
    } else {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [client.id, router]);

  const eventLinks = (client.event_clients ?? []) as ClientEventLink[];

  return (
    <div className="space-y-6">
      <Link
        href="/clients"
        className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to clients
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
            {client.name}
          </h1>
          {client.company && (
            <p className="mt-0.5 text-sm text-zinc-500">{client.company}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/clients/${client.id}/edit`}>
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
            Delete this client? They will be removed from all linked events.
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
          <CardTitle className="text-base">Contact details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {client.company && (
            <p className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-zinc-400" />
              {client.company}
            </p>
          )}
          {client.email && (
            <p className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-zinc-400" />
              {client.email}
            </p>
          )}
          {client.phone && (
            <p className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-zinc-400" />
              {client.phone}
            </p>
          )}
          {client.address && (
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400" />
              {client.address}
            </p>
          )}
          {!client.email && !client.phone && !client.address && (
            <p className="text-zinc-400">No contact details added.</p>
          )}
        </CardContent>
      </Card>

      {client.preferences && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Preferences</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {client.preferences}
            </p>
          </CardContent>
        </Card>
      )}

      {client.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-zinc-700 dark:text-zinc-300">
              {client.notes}
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
          {eventLinks.length === 0 ? (
            <p className="text-sm text-zinc-400">No events linked yet.</p>
          ) : (
            <div className="space-y-2">
              {eventLinks.map((link) => {
                const event = link.events;
                const firstDay = event.event_days
                  ?.sort((a, b) => a.sort_order - b.sort_order)?.[0];
                return (
                  <Link
                    key={link.id}
                    href={`/events/${event.id}`}
                    className="flex items-center justify-between rounded-md border border-zinc-100 px-3 py-2 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-zinc-900 dark:text-white">
                          {event.name}
                        </p>
                        <span className="shrink-0 rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                          {CLIENT_ROLE_LABELS[link.role as EventClientRole]}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        {event.event_id}
                        {firstDay?.date &&
                          ` · ${new Date(firstDay.date + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}`}
                      </p>
                    </div>
                    <StatusBadge status={event.status as EventStatus} />
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
