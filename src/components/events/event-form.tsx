"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ServiceDayFields } from "./service-day-fields";
import type { CaterEvent, EventType, ServiceDayInput } from "@/lib/events/types";

interface EventFormProps {
  event?: CaterEvent;
  onSuccess: (eventId: string) => void;
}

const EMPTY_SERVICE_DAY: ServiceDayInput = {
  date: "",
  guest_count: null,
  label: "",
  sort_order: 0,
};

export function EventForm({ event, onSuccess }: EventFormProps) {
  const isEdit = !!event;

  const [name, setName] = useState(event?.name ?? "");
  const [eventTypeId, setEventTypeId] = useState(event?.event_type_id ?? "");
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [serviceDays, setServiceDays] = useState<ServiceDayInput[]>(
    event?.service_days?.map((d) => ({
      date: d.date ?? "",
      guest_count: d.guest_count,
      label: d.label ?? "",
      sort_order: d.sort_order,
    })) ?? [{ ...EMPTY_SERVICE_DAY }]
  );

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/event-types")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEventTypes(data);
          if (!eventTypeId && data.length > 0) {
            setEventTypeId(data[0].id);
          }
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Event name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const body = {
      name: name.trim(),
      event_type_id: eventTypeId,
      notes,
      service_days: serviceDays,
    };

    const url = isEdit ? `/api/events/${event.id}` : "/api/events";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setIsSubmitting(false);
      return;
    }

    onSuccess(isEdit ? event.id : data.id);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Event name *</Label>
        <Input
          id="name"
          placeholder="e.g. Smith & Jones Wedding"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="eventType">Event type</Label>
        <select
          id="eventType"
          value={eventTypeId}
          onChange={(e) => setEventTypeId(e.target.value)}
          disabled={isSubmitting}
          className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-zinc-900"
        >
          {eventTypes.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <ServiceDayFields value={serviceDays} onChange={setServiceDays} />

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any special requirements or notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
          {isSubmitting
            ? isEdit
              ? "Saving..."
              : "Creating..."
            : isEdit
              ? "Save changes"
              : "Create event"}
        </Button>
      </div>
    </form>
  );
}
