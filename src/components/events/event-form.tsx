"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { EventDayFields } from "./event-day-fields";
import type {
  CaterEvent,
  EventType,
  EventDayInput,
} from "@/lib/events/types";

interface EventFormProps {
  event?: CaterEvent;
  onSuccess: (eventId: string) => void;
}

const EMPTY_EVENT_DAY: EventDayInput = {
  date: "",
  label: "",
  sort_order: 0,
  services: [{ name: "", guest_count: null }],
};

export function EventForm({ event, onSuccess }: EventFormProps) {
  const isEdit = !!event;

  const [name, setName] = useState(event?.name ?? "");
  const [eventTypeId, setEventTypeId] = useState(event?.event_type_id ?? "");
  const [notes, setNotes] = useState(event?.notes ?? "");
  const [eventDays, setEventDays] = useState<EventDayInput[]>(
    event?.event_days?.map((d) => ({
      date: d.date ?? "",
      label: d.label ?? "",
      sort_order: d.sort_order,
      services:
        d.event_services?.map((s) => ({
          name: s.name,
          guest_count: s.guest_count,
        })) ?? [{ name: "", guest_count: null }],
    })) ?? [{ ...EMPTY_EVENT_DAY }]
  );

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline new type creation
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCode, setNewTypeCode] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);

  function fetchEventTypes() {
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
  }

  useEffect(() => {
    fetchEventTypes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreateType() {
    if (!newTypeName.trim() || !newTypeCode.trim()) {
      setTypeError("Both name and letter code are required.");
      return;
    }

    setIsCreatingType(true);
    setTypeError(null);

    const res = await fetch("/api/event-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newTypeName.trim(),
        letter_code: newTypeCode.trim(),
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setTypeError(data.error ?? "Failed to create event type.");
      setIsCreatingType(false);
      return;
    }

    // Add to list and select it
    setEventTypes((prev) => [...prev, data]);
    setEventTypeId(data.id);
    setNewTypeName("");
    setNewTypeCode("");
    setShowNewType(false);
    setIsCreatingType(false);
  }

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
      event_days: eventDays,
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

      {/* Event type with inline creation */}
      <div className="space-y-2">
        <Label htmlFor="eventType">Event type</Label>
        <div className="flex gap-2">
          <select
            id="eventType"
            value={eventTypeId}
            onChange={(e) => setEventTypeId(e.target.value)}
            disabled={isSubmitting}
            className="flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-zinc-900"
          >
            {eventTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.letter_code})
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="shrink-0"
            onClick={() => setShowNewType(!showNewType)}
          >
            <Plus className="mr-1 h-3 w-3" />
            New
          </Button>
        </div>

        {showNewType && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="mb-2 text-xs font-medium text-zinc-500">
              Add new event type
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Name (e.g. Birthday)"
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                disabled={isCreatingType}
                className="flex-1"
              />
              <Input
                placeholder="Code"
                value={newTypeCode}
                onChange={(e) => setNewTypeCode(e.target.value.slice(0, 1))}
                disabled={isCreatingType}
                maxLength={1}
                className="w-16 text-center uppercase"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreateType}
                disabled={isCreatingType}
              >
                {isCreatingType ? "..." : "Add"}
              </Button>
            </div>
            {typeError && (
              <p className="mt-1 text-xs text-red-600">{typeError}</p>
            )}
          </div>
        )}
      </div>

      <EventDayFields value={eventDays} onChange={setEventDays} />

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
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 sm:flex-none"
        >
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
