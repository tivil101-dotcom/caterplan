import type { CaterEvent } from "@/lib/events/types";

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
}
