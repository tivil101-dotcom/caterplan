-- CaterPlan: Multiple Clients per Event (with roles)
-- Run this in the Supabase SQL Editor
--
-- Replaces the single client_id FK on events with a many-to-many
-- junction table (event_clients) supporting roles: end_client,
-- organiser, event_company.

-- =============================================================================
-- 1. Create event_clients junction table
-- =============================================================================

CREATE TABLE public.event_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'end_client',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  CONSTRAINT event_clients_unique_pair UNIQUE (event_id, client_id),
  CONSTRAINT event_clients_valid_role CHECK (role IN ('end_client', 'organiser', 'event_company'))
);

CREATE INDEX idx_event_clients_event_id ON public.event_clients(event_id);
CREATE INDEX idx_event_clients_client_id ON public.event_clients(client_id);

-- =============================================================================
-- 2. RLS policies
-- =============================================================================

ALTER TABLE public.event_clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own org event_clients"
  ON public.event_clients FOR SELECT
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can insert own org event_clients"
  ON public.event_clients FOR INSERT
  WITH CHECK (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can update own org event_clients"
  ON public.event_clients FOR UPDATE
  USING (organisation_id = public.get_user_organisation_id());

CREATE POLICY "Users can delete own org event_clients"
  ON public.event_clients FOR DELETE
  USING (organisation_id = public.get_user_organisation_id());

-- =============================================================================
-- 3. Updated-at trigger
-- =============================================================================

CREATE TRIGGER event_clients_set_updated_at
  BEFORE UPDATE ON public.event_clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 4. Migrate existing data
-- =============================================================================
-- For every event that has a client_id, create an event_clients row
-- with role 'end_client' and sort_order 0.

INSERT INTO public.event_clients (organisation_id, event_id, client_id, role, sort_order)
SELECT organisation_id, id, client_id, 'end_client', 0
FROM public.events
WHERE client_id IS NOT NULL;

-- =============================================================================
-- 5. Remove old client_id column from events
-- =============================================================================

-- Drop the FK constraint first
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS fk_events_client;

-- Drop the column
ALTER TABLE public.events DROP COLUMN IF EXISTS client_id;

-- =============================================================================
-- 6. PostgreSQL COMMENT statements for AI readability
-- =============================================================================

COMMENT ON TABLE public.event_clients IS
  'Junction table linking events to clients with roles. An event can have multiple clients (e.g. end client, organiser, event company). Replaces the old single client_id FK on events. Sort order determines display priority — the first client (sort_order 0) is considered the primary client.';

COMMENT ON COLUMN public.event_clients.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.event_clients.organisation_id IS 'The organisation this link belongs to. Used for RLS tenant isolation.';
COMMENT ON COLUMN public.event_clients.event_id IS 'The event this client is linked to. Cascading delete — removing the event removes all its client links.';
COMMENT ON COLUMN public.event_clients.client_id IS 'The client linked to this event. Cascading delete — removing the client removes the link (but not the event).';
COMMENT ON COLUMN public.event_clients.role IS 'The role this client plays on the event. One of: end_client (the person/company being catered for), organiser (the event planner/coordinator), event_company (the company managing the event). Default is end_client.';
COMMENT ON COLUMN public.event_clients.sort_order IS 'Display order among the event''s clients. 0-indexed. The first client (sort_order 0) is considered the primary client shown in list views.';
COMMENT ON COLUMN public.event_clients.created_at IS 'Timestamp when this client-event link was created.';
COMMENT ON COLUMN public.event_clients.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

-- Update the events table comment to remove client_id reference
COMMENT ON TABLE public.events IS
  'The central entity in CaterPlan — a catering job/event. Everything else (menus, budgets, staffing, equipment) hangs off an event. Tracks the full lifecycle from initial enquiry through to completion. Every enquiry is an event in "enquiry" status — there is no separate enquiry entity. Clients are linked via the event_clients junction table (many-to-many with roles).';

-- Update clients table comment
COMMENT ON TABLE public.clients IS
  'A person or company that books catering events. Reusable across multiple events. Stores contact details and preferences (e.g. dietary preferences, communication style). Linked to events via the event_clients junction table with roles (end_client, organiser, event_company).';
