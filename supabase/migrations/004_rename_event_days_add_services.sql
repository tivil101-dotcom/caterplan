-- CaterPlan: Rename service_days → event_days, add event_services
-- Run this in the Supabase SQL Editor

-- =============================================================================
-- 1. Rename service_days table to event_days
-- =============================================================================

ALTER TABLE public.service_days RENAME TO event_days;

-- Remove guest_count from event_days (now lives on event_services)
ALTER TABLE public.event_days DROP COLUMN IF EXISTS guest_count;

-- Rename RLS policies
ALTER POLICY "Users can view own org service days" ON public.event_days
  RENAME TO "Users can view own org event days";

ALTER POLICY "Users can insert own org service days" ON public.event_days
  RENAME TO "Users can insert own org event days";

ALTER POLICY "Users can update own org service days" ON public.event_days
  RENAME TO "Users can update own org event days";

ALTER POLICY "Users can delete own org service days" ON public.event_days
  RENAME TO "Users can delete own org event days";

-- =============================================================================
-- 2. Create event_services table
-- =============================================================================

CREATE TABLE public.event_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_day_id UUID NOT NULL REFERENCES public.event_days(id) ON DELETE CASCADE,
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  guest_count INTEGER,
  sort_order INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.event_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org event services"
  ON public.event_services FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org event services"
  ON public.event_services FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org event services"
  ON public.event_services FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org event services"
  ON public.event_services FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

CREATE TRIGGER event_services_set_updated_at
  BEFORE UPDATE ON public.event_services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
