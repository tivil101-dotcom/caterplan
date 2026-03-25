-- CaterPlan: Clients & Venues
-- Run this in the Supabase SQL Editor

-- =============================================================================
-- 1. Clients table
-- =============================================================================

CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  company TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  preferences TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org clients"
  ON public.clients FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org clients"
  ON public.clients FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org clients"
  ON public.clients FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Admins can delete own org clients"
  ON public.clients FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

CREATE TRIGGER clients_set_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 2. Venues table
-- =============================================================================

CREATE TABLE public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  contact_person TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  parking TEXT,
  power_access TEXT,
  load_in_restrictions TEXT,
  kitchen_facilities TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org venues"
  ON public.venues FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org venues"
  ON public.venues FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org venues"
  ON public.venues FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Admins can delete own org venues"
  ON public.venues FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

CREATE TRIGGER venues_set_updated_at
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 3. Foreign key constraints on events
-- =============================================================================

ALTER TABLE public.events
  ADD CONSTRAINT fk_events_client
  FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;

ALTER TABLE public.events
  ADD CONSTRAINT fk_events_venue
  FOREIGN KEY (venue_id) REFERENCES public.venues(id) ON DELETE SET NULL;
