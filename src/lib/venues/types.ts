import type { CaterEvent } from "@/lib/events/types";

export interface Venue {
  id: string;
  organisation_id: string;
  name: string;
  address: string | null;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  parking: string | null;
  power_access: string | null;
  load_in_restrictions: string | null;
  kitchen_facilities: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  events?: CaterEvent[];
}
