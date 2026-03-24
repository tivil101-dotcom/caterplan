export interface Profile {
  id: string;
  organisation_id: string | null;
  full_name: string | null;
  email: string | null;
  role: "admin" | "event-manager" | "kitchen" | "view-only";
  created_at: string;
  updated_at: string;
}

export interface Organisation {
  id: string;
  name: string;
  contact_email: string | null;
  contact_phone: string | null;
  address: string | null;
  settings: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}
