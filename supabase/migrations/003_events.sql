-- CaterPlan: Events, Event Types, Service Days
-- Run this in the Supabase SQL Editor

-- =============================================================================
-- 1. Event Types (org-scoped lookup table)
-- =============================================================================

CREATE TABLE public.event_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  letter_code TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, name),
  UNIQUE(organisation_id, letter_code)
);

ALTER TABLE public.event_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org event types"
  ON public.event_types FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org event types"
  ON public.event_types FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org event types"
  ON public.event_types FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org event types"
  ON public.event_types FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

-- =============================================================================
-- 2. Events table
-- =============================================================================

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  event_type_id UUID NOT NULL REFERENCES public.event_types(id),
  event_id TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enquiry'
    CHECK (status IN ('enquiry', 'confirmed', 'planning', 'execution', 'complete')),
  client_id UUID,
  venue_id UUID,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organisation_id, event_id)
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org events"
  ON public.events FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org events"
  ON public.events FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org events"
  ON public.events FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org events"
  ON public.events FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

-- =============================================================================
-- 3. Service Days table
-- =============================================================================

CREATE TABLE public.service_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  date DATE,
  guest_count INTEGER,
  label TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.service_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org service days"
  ON public.service_days FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org service days"
  ON public.service_days FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org service days"
  ON public.service_days FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org service days"
  ON public.service_days FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

-- =============================================================================
-- 4. Auto-update updated_at timestamp
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER events_set_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER event_types_set_updated_at
  BEFORE UPDATE ON public.event_types
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER service_days_set_updated_at
  BEFORE UPDATE ON public.service_days
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 5. Seed default event types on organisation creation
-- =============================================================================

CREATE OR REPLACE FUNCTION public.seed_default_event_types()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.event_types (organisation_id, name, letter_code)
  VALUES
    (NEW.id, 'Wedding', 'W'),
    (NEW.id, 'Corporate', 'C');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_organisation_created_seed_types
  AFTER INSERT ON public.organisations
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_default_event_types();

-- =============================================================================
-- 6. Backfill event types for existing organisations
-- =============================================================================

INSERT INTO public.event_types (organisation_id, name, letter_code)
SELECT o.id, t.name, t.code
FROM public.organisations o
CROSS JOIN (VALUES ('Wedding', 'W'), ('Corporate', 'C')) AS t(name, code)
WHERE NOT EXISTS (
  SELECT 1 FROM public.event_types et
  WHERE et.organisation_id = o.id AND et.name = t.name
);
