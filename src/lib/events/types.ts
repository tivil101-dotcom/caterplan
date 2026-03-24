export type EventStatus =
  | "enquiry"
  | "confirmed"
  | "planning"
  | "execution"
  | "complete";

export const EVENT_STATUSES: EventStatus[] = [
  "enquiry",
  "confirmed",
  "planning",
  "execution",
  "complete",
];

export const STATUS_LABELS: Record<EventStatus, string> = {
  enquiry: "Enquiry",
  confirmed: "Confirmed",
  planning: "Planning",
  execution: "Execution",
  complete: "Complete",
};

export interface EventType {
  id: string;
  organisation_id: string;
  name: string;
  letter_code: string;
  created_at: string;
}

export interface EventService {
  id: string;
  event_day_id: string;
  organisation_id: string;
  name: string;
  guest_count: number | null;
  sort_order: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface EventDay {
  id: string;
  event_id: string;
  organisation_id: string;
  date: string | null;
  label: string | null;
  sort_order: number;
  created_at: string;
  event_services?: EventService[];
}

/** Named CaterEvent to avoid collision with DOM Event type */
export interface CaterEvent {
  id: string;
  organisation_id: string;
  event_type_id: string;
  event_id: string;
  name: string;
  status: EventStatus;
  client_id: string | null;
  venue_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  event_types?: EventType;
  event_days?: EventDay[];
}

/** Input for creating/updating event services */
export interface EventServiceInput {
  name: string;
  guest_count: number | null;
}

/** Input for creating/updating event days with nested services */
export interface EventDayInput {
  date: string;
  label: string;
  sort_order: number;
  services: EventServiceInput[];
}

/** Get max guest count for an event day (not additive — same guests across services) */
export function getEventDayGuestCount(day: { event_services?: EventService[] }): number {
  if (!day.event_services?.length) return 0;
  return Math.max(...day.event_services.map((s) => s.guest_count ?? 0));
}

/** Get total max guest count across all days of an event */
export function getEventTotalGuests(event: { event_days?: EventDay[] }): number {
  if (!event.event_days?.length) return 0;
  return event.event_days.reduce((sum, day) => sum + getEventDayGuestCount(day), 0);
}
