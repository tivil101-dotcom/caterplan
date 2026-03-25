import type { CaterEvent, EventClientRole } from "@/lib/events/types";

export interface ClientEventLink {
  id: string;
  role: EventClientRole;
  sort_order: number;
  events: {
    id: string;
    event_id: string;
    name: string;
    status: string;
    event_types?: { name: string };
    event_days?: { date: string | null; sort_order: number }[];
  };
}

export interface Client {
  id: string;
  organisation_id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  notes: string | null;
  preferences: string | null;
  created_at: string;
  updated_at: string;
  events?: CaterEvent[];
  event_clients?: ClientEventLink[];
}
