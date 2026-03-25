"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { EventDayFields } from "./event-day-fields";
import { SearchableSelect } from "@/components/ui/searchable-select";
import type {
  CaterEvent,
  EventType,
  EventDayInput,
  EventClientInput,
  EventClientRole,
} from "@/lib/events/types";
import { CLIENT_ROLE_LABELS, EVENT_CLIENT_ROLES } from "@/lib/events/types";
import type { Client } from "@/lib/clients/types";
import type { Venue } from "@/lib/venues/types";

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
  const [venueId, setVenueId] = useState<string | null>(
    event?.venue_id ?? null
  );
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

  // Multi-client state
  const [eventClients, setEventClients] = useState<EventClientInput[]>(
    event?.event_clients?.map((ec) => ({
      client_id: ec.client_id,
      role: ec.role,
    })) ?? []
  );

  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline new type creation
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeCode, setNewTypeCode] = useState("");
  const [isCreatingType, setIsCreatingType] = useState(false);
  const [typeError, setTypeError] = useState<string | null>(null);

  // Inline new client creation (now per-row)
  const [showNewClient, setShowNewClient] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [isCreatingClient, setIsCreatingClient] = useState(false);
  const [newClientTargetIndex, setNewClientTargetIndex] = useState<number>(-1);

  // Inline new venue creation
  const [showNewVenue, setShowNewVenue] = useState(false);
  const [newVenueName, setNewVenueName] = useState("");
  const [isCreatingVenue, setIsCreatingVenue] = useState(false);

  useEffect(() => {
    fetch("/api/event-types")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setEventTypes(data);
          if (!eventTypeId && data.length > 0) setEventTypeId(data[0].id);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchClients = useCallback(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClients(data);
      });
  }, []);

  const fetchVenues = useCallback(() => {
    fetch("/api/venues")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setVenues(data);
      });
  }, []);

  useEffect(() => {
    fetchClients();
    fetchVenues();
  }, [fetchClients, fetchVenues]);

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

    setEventTypes((prev) => [...prev, data]);
    setEventTypeId(data.id);
    setNewTypeName("");
    setNewTypeCode("");
    setShowNewType(false);
    setIsCreatingType(false);
  }

  async function handleCreateClient() {
    if (!newClientName.trim()) return;
    setIsCreatingClient(true);

    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newClientName.trim() }),
    });
    const data = await res.json();

    if (res.ok) {
      setClients((prev) => [...prev, data]);
      // If we were adding to a specific row, set it there
      if (newClientTargetIndex >= 0) {
        setEventClients((prev) => {
          const updated = [...prev];
          updated[newClientTargetIndex] = {
            ...updated[newClientTargetIndex],
            client_id: data.id,
          };
          return updated;
        });
      } else {
        // Adding a brand new row
        setEventClients((prev) => [
          ...prev,
          { client_id: data.id, role: "end_client" as EventClientRole },
        ]);
      }
      setNewClientName("");
      setShowNewClient(false);
      setNewClientTargetIndex(-1);
    }
    setIsCreatingClient(false);
  }

  async function handleCreateVenue() {
    if (!newVenueName.trim()) return;
    setIsCreatingVenue(true);

    const res = await fetch("/api/venues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newVenueName.trim() }),
    });
    const data = await res.json();

    if (res.ok) {
      setVenues((prev) => [...prev, data]);
      setVenueId(data.id);
      setNewVenueName("");
      setShowNewVenue(false);
    }
    setIsCreatingVenue(false);
  }

  // Client row helpers
  function addClientRow() {
    setEventClients((prev) => [
      ...prev,
      { client_id: "", role: "end_client" as EventClientRole },
    ]);
  }

  function removeClientRow(index: number) {
    setEventClients((prev) => prev.filter((_, i) => i !== index));
  }

  function updateClientRow(
    index: number,
    field: keyof EventClientInput,
    value: string
  ) {
    setEventClients((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  }

  // Filter out already-selected clients for each row
  function getAvailableClients(currentIndex: number) {
    const selectedIds = eventClients
      .filter((_, i) => i !== currentIndex)
      .map((ec) => ec.client_id);
    return clients.filter((c) => !selectedIds.includes(c.id));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Event name is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Filter out empty client rows
    const validClients = eventClients.filter((ec) => ec.client_id);

    const body = {
      name: name.trim(),
      event_type_id: eventTypeId,
      venue_id: venueId,
      notes,
      event_days: eventDays,
      event_clients: validClients,
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

      {/* Clients (multi) */}
      <div className="space-y-2">
        <Label>Clients</Label>
        {eventClients.length > 0 && (
          <div className="space-y-2">
            {eventClients.map((ec, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <SearchableSelect
                    value={ec.client_id || null}
                    onChange={(val) =>
                      updateClientRow(index, "client_id", val ?? "")
                    }
                    options={getAvailableClients(index).map((c) => ({
                      value: c.id,
                      label: c.company
                        ? `${c.name} (${c.company})`
                        : c.name,
                    }))}
                    placeholder="Select a client..."
                    onCreateNew={() => {
                      setNewClientTargetIndex(index);
                      setShowNewClient(true);
                    }}
                    createNewLabel="Add new client"
                    disabled={isSubmitting}
                  />
                </div>
                <select
                  value={ec.role}
                  onChange={(e) =>
                    updateClientRow(index, "role", e.target.value)
                  }
                  disabled={isSubmitting}
                  className="h-9 rounded-lg border border-input bg-transparent px-2 py-1 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50 dark:bg-zinc-900"
                >
                  {EVENT_CLIENT_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {CLIENT_ROLE_LABELS[r]}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 shrink-0 p-0 text-zinc-400 hover:text-red-600"
                  onClick={() => removeClientRow(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addClientRow}
          disabled={isSubmitting}
        >
          <Plus className="mr-1 h-3 w-3" />
          Add client
        </Button>

        {showNewClient && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="mb-2 text-xs font-medium text-zinc-500">
              Quick-add client
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Client name"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                disabled={isCreatingClient}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreateClient}
                disabled={isCreatingClient || !newClientName.trim()}
              >
                {isCreatingClient ? "..." : "Add"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowNewClient(false);
                  setNewClientTargetIndex(-1);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Venue */}
      <div className="space-y-2">
        <Label>Venue</Label>
        <SearchableSelect
          value={venueId}
          onChange={setVenueId}
          options={venues.map((v) => ({
            value: v.id,
            label: v.address ? `${v.name} — ${v.address}` : v.name,
          }))}
          placeholder="Select a venue..."
          onCreateNew={() => setShowNewVenue(true)}
          createNewLabel="Add new venue"
          disabled={isSubmitting}
        />
        {showNewVenue && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900">
            <p className="mb-2 text-xs font-medium text-zinc-500">
              Quick-add venue
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="Venue name"
                value={newVenueName}
                onChange={(e) => setNewVenueName(e.target.value)}
                disabled={isCreatingVenue}
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={handleCreateVenue}
                disabled={isCreatingVenue || !newVenueName.trim()}
              >
                {isCreatingVenue ? "..." : "Add"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setShowNewVenue(false)}
              >
                Cancel
              </Button>
            </div>
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
