-- CaterPlan: PostgreSQL COMMENT statements for AI-readable schema
-- Run this in the Supabase SQL Editor
--
-- These comments make the database schema self-documenting. Any tool or AI
-- reading pg_catalog / information_schema can understand what each table
-- and column is for without needing external documentation.

-- =============================================================================
-- organisations
-- =============================================================================

COMMENT ON TABLE public.organisations IS
  'A catering company using the CaterPlan platform. Top-level tenant container — every other entity belongs to an organisation. Multi-tenancy is enforced via RLS using organisation_id.';

COMMENT ON COLUMN public.organisations.id IS 'Primary key (UUID). Referenced by all other tables as organisation_id for tenant isolation.';
COMMENT ON COLUMN public.organisations.name IS 'Display name of the catering company, e.g. "Jimmy Garcia Catering".';
COMMENT ON COLUMN public.organisations.contact_email IS 'Primary contact email for the organisation.';
COMMENT ON COLUMN public.organisations.contact_phone IS 'Primary contact phone number for the organisation.';
COMMENT ON COLUMN public.organisations.address IS 'Business address of the organisation.';
COMMENT ON COLUMN public.organisations.settings IS 'JSON object for organisation-level settings and preferences (e.g. default VAT rate, naming conventions). Schema is flexible.';
COMMENT ON COLUMN public.organisations.created_at IS 'Timestamp when the organisation was created.';
COMMENT ON COLUMN public.organisations.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

-- =============================================================================
-- profiles
-- =============================================================================

COMMENT ON TABLE public.profiles IS
  'App-specific user profile that extends Supabase auth.users. Created automatically by a trigger when a user signs up via Google OAuth. Links a user to their organisation and assigns a role.';

COMMENT ON COLUMN public.profiles.id IS 'Primary key (UUID). References auth.users(id). One profile per authenticated user.';
COMMENT ON COLUMN public.profiles.organisation_id IS 'The organisation this user belongs to. NULL until the user completes onboarding and creates or joins an organisation.';
COMMENT ON COLUMN public.profiles.full_name IS 'User''s display name, populated from Google OAuth metadata on first sign-in.';
COMMENT ON COLUMN public.profiles.email IS 'User''s email address, populated from Google OAuth on first sign-in.';
COMMENT ON COLUMN public.profiles.role IS 'Access level within the organisation. One of: admin (full access), event-manager (manage events), kitchen (read-only kitchen-relevant data), view-only (read-only everything). Enforced in application logic and some RLS policies.';
COMMENT ON COLUMN public.profiles.created_at IS 'Timestamp when the profile was created (on first sign-in).';
COMMENT ON COLUMN public.profiles.updated_at IS 'Timestamp of the last update.';

-- =============================================================================
-- event_types
-- =============================================================================

COMMENT ON TABLE public.event_types IS
  'User-defined event categories per organisation, e.g. Wedding, Corporate, Birthday. Each type has a single-character letter code used in auto-generated event IDs. Default types (Wedding=W, Corporate=C) are seeded when an organisation is created.';

COMMENT ON COLUMN public.event_types.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.event_types.organisation_id IS 'The organisation this event type belongs to. Scoped per-tenant — each org has its own set of types.';
COMMENT ON COLUMN public.event_types.name IS 'Display name of the event type, e.g. "Wedding", "Corporate", "Birthday". Unique within an organisation.';
COMMENT ON COLUMN public.event_types.letter_code IS 'Single-character code used as a prefix in auto-generated event IDs, e.g. "W" for Wedding produces IDs like W250705ANSI. Unique within an organisation.';
COMMENT ON COLUMN public.event_types.created_at IS 'Timestamp when the event type was created.';
COMMENT ON COLUMN public.event_types.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

-- =============================================================================
-- events
-- =============================================================================

COMMENT ON TABLE public.events IS
  'The central entity in CaterPlan — a catering job/event. Everything else (menus, budgets, staffing, equipment) hangs off an event. Tracks the full lifecycle from initial enquiry through to completion. Every enquiry is an event in "enquiry" status — there is no separate enquiry entity.';

COMMENT ON COLUMN public.events.id IS 'Primary key (UUID). Internal identifier used in URLs and foreign keys.';
COMMENT ON COLUMN public.events.organisation_id IS 'The organisation this event belongs to. Used for RLS tenant isolation.';
COMMENT ON COLUMN public.events.event_type_id IS 'References the event type (e.g. Wedding, Corporate). Determines the letter code prefix in the event_id.';
COMMENT ON COLUMN public.events.event_id IS 'Human-readable event identifier, auto-generated in the format [TypeLetter][YYMMDD][4-char-ref], e.g. W250705ANSI. Unique within the organisation. Editable by users.';
COMMENT ON COLUMN public.events.name IS 'Display name of the event, e.g. "Smith & Jones Wedding" or "Acme Corp Summer Party".';
COMMENT ON COLUMN public.events.status IS 'Current position in the event lifecycle workflow. One of: enquiry (initial contact), confirmed (client has committed), planning (active preparation), execution (event is happening), complete (event finished). Progresses linearly but can be set to any status.';
COMMENT ON COLUMN public.events.client_id IS 'Optional reference to the client who booked this event. NULL if no client assigned yet. FK to clients(id), SET NULL on delete.';
COMMENT ON COLUMN public.events.venue_id IS 'Optional reference to the venue where this event takes place. NULL if no venue assigned yet. FK to venues(id), SET NULL on delete.';
COMMENT ON COLUMN public.events.notes IS 'Free-text notes and special requirements for the event.';
COMMENT ON COLUMN public.events.created_at IS 'Timestamp when the event was created.';
COMMENT ON COLUMN public.events.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

-- =============================================================================
-- event_days
-- =============================================================================

COMMENT ON TABLE public.event_days IS
  'A single day within an event. Supports multi-day events where each day has different services, guest counts, menus, staffing, and timelines. A single-day event has one event_day. Previously named "service_days" — renamed in migration 004.';

COMMENT ON COLUMN public.event_days.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.event_days.event_id IS 'The event this day belongs to. Cascading delete — removing the event removes all its days.';
COMMENT ON COLUMN public.event_days.organisation_id IS 'The organisation this day belongs to. Denormalised from the parent event for RLS performance.';
COMMENT ON COLUMN public.event_days.date IS 'The calendar date of this event day. NULL if not yet confirmed.';
COMMENT ON COLUMN public.event_days.label IS 'Optional descriptive label, e.g. "Welcome Party", "Wedding Day", "Day 2". Useful for multi-day events.';
COMMENT ON COLUMN public.event_days.sort_order IS 'Display order among the event''s days. 0-indexed.';
COMMENT ON COLUMN public.event_days.created_at IS 'Timestamp when this day was created.';
COMMENT ON COLUMN public.event_days.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

-- =============================================================================
-- event_services
-- =============================================================================

COMMENT ON TABLE public.event_services IS
  'A service/meal within an event day, e.g. Breakfast, Lunch, Dinner, Evening Reception. Each event day has one or more services, each with its own guest count. The total guest count for a day is the MAX of its services (same guests across services, not additive).';

COMMENT ON COLUMN public.event_services.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.event_services.event_day_id IS 'The event day this service belongs to. Cascading delete — removing the day removes all its services.';
COMMENT ON COLUMN public.event_services.organisation_id IS 'The organisation this service belongs to. Denormalised for RLS.';
COMMENT ON COLUMN public.event_services.name IS 'Name of the service, e.g. "Breakfast", "Dinner", "Evening Reception". Empty string for simple single-service events.';
COMMENT ON COLUMN public.event_services.guest_count IS 'Number of guests for this specific service. NULL if not yet confirmed. Day-level guest count is the MAX across its services.';
COMMENT ON COLUMN public.event_services.sort_order IS 'Display order among the day''s services. 0-indexed.';
COMMENT ON COLUMN public.event_services.notes IS 'Free-text notes specific to this service.';
COMMENT ON COLUMN public.event_services.created_at IS 'Timestamp when this service was created.';
COMMENT ON COLUMN public.event_services.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

-- =============================================================================
-- clients
-- =============================================================================

COMMENT ON TABLE public.clients IS
  'A person or company that books catering events. Reusable across multiple events. Stores contact details and preferences (e.g. dietary preferences, communication style). Deleting a client sets client_id to NULL on linked events.';

COMMENT ON COLUMN public.clients.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.clients.organisation_id IS 'The organisation this client belongs to. Used for RLS tenant isolation.';
COMMENT ON COLUMN public.clients.name IS 'Client''s full name or primary contact name, e.g. "Sarah Johnson".';
COMMENT ON COLUMN public.clients.company IS 'Company or organisation the client represents, if applicable.';
COMMENT ON COLUMN public.clients.email IS 'Client''s email address.';
COMMENT ON COLUMN public.clients.phone IS 'Client''s phone number.';
COMMENT ON COLUMN public.clients.address IS 'Client''s postal/billing address.';
COMMENT ON COLUMN public.clients.notes IS 'Free-text notes about the client.';
COMMENT ON COLUMN public.clients.preferences IS 'Client preferences relevant to catering, e.g. "prefers Italian food", "allergic to shellfish", "always wants a tasting before confirming".';
COMMENT ON COLUMN public.clients.created_at IS 'Timestamp when the client was created.';
COMMENT ON COLUMN public.clients.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';

-- =============================================================================
-- venues
-- =============================================================================

COMMENT ON TABLE public.venues IS
  'A location where catering events take place. Reusable across multiple events. Stores contact details and practical operational information (parking, power, load-in, kitchen facilities) that kitchen and ops teams need when planning events at this venue. Deleting a venue sets venue_id to NULL on linked events.';

COMMENT ON COLUMN public.venues.id IS 'Primary key (UUID).';
COMMENT ON COLUMN public.venues.organisation_id IS 'The organisation this venue belongs to. Used for RLS tenant isolation.';
COMMENT ON COLUMN public.venues.name IS 'Display name of the venue, e.g. "The Grand Hall", "Battersea Arts Centre".';
COMMENT ON COLUMN public.venues.address IS 'Full address of the venue.';
COMMENT ON COLUMN public.venues.contact_person IS 'Name of the venue''s primary contact person.';
COMMENT ON COLUMN public.venues.contact_email IS 'Email of the venue''s contact person.';
COMMENT ON COLUMN public.venues.contact_phone IS 'Phone number of the venue''s contact person.';
COMMENT ON COLUMN public.venues.parking IS 'Practical info: parking availability, capacity, restrictions. Important for delivery vehicles and staff.';
COMMENT ON COLUMN public.venues.power_access IS 'Practical info: electrical supply details, e.g. "32A supply in kitchen area, extension leads needed for marquee".';
COMMENT ON COLUMN public.venues.load_in_restrictions IS 'Practical info: access constraints for loading equipment and supplies, e.g. "Rear access only, low clearance 2.1m, loading bay 7am-10am".';
COMMENT ON COLUMN public.venues.kitchen_facilities IS 'Practical info: on-site kitchen equipment and capabilities, e.g. "Full commercial kitchen with 6-burner range, double oven, walk-in fridge".';
COMMENT ON COLUMN public.venues.notes IS 'Free-text notes about the venue.';
COMMENT ON COLUMN public.venues.created_at IS 'Timestamp when the venue was created.';
COMMENT ON COLUMN public.venues.updated_at IS 'Timestamp of the last update. Auto-set by trigger.';
