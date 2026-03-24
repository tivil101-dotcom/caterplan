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

export interface ServiceDay {
  id: string;
  event_id: string;
  organisation_id: string;
  date: string | null;
  guest_count: number | null;
  label: string | null;
  sort_order: number;
  created_at: string;
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
  service_days?: ServiceDay[];
}

/** Input shape for creating/updating service days (no id yet) */
export interface ServiceDayInput {
  date: string;
  guest_count: number | null;
  label: string;
  sort_order: number;
}
