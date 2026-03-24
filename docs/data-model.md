# CaterPlan — Data Model

## Status

Updated 2026-03-24 following MVP scoping session. This reflects the entities and relationships needed for V1a. The actual database schema will be built out as features are developed — this is the directional guide.

---

## Core Entities

### Organisation
The catering company using the platform. Top-level container for all data. Every other entity belongs to an organisation, enforced via Supabase row-level security.

- Name, contact details, branding
- Settings and preferences (e.g. default event ID naming convention, VAT rate)
- Subscription/plan info (future)

### User
A person within the organisation who logs into the platform.

- Name, email, role
- Belongs to one Organisation
- Role-based access: admin, event manager, kitchen, view-only
- Auth via Google OAuth (Supabase Auth)

### Event
A specific catering job — the central object in the system. Everything else hangs off this.

- Event ID: auto-generated, format `[Type letter][YYMMDD][4-char reference]` e.g. `W250705ANSI`. Editable, convention customisable per organisation
- Event type: user-defined (defaults: Wedding, Corporate)
- Status: Enquiry → Confirmed → Planning → Execution → Complete
- Notes / special requirements (free text)
- Links to: client, venue, service days, menus, budget, staffing, equipment, tastings

### Service Day
A single day within an event. Enables multi-day events where each day has different guest counts, menus, staffing, and timelines.

- Date
- Guest count (for this day/service)
- Belongs to one Event
- Links to: timeline entries, menus (per day), staffing (per day), outmess

For single-day events, there is one service day. For multi-day events (e.g. Friday welcome party + Saturday wedding), each day is a separate service day.

### Client
The person or company booking the catering.

- Name, company, contact details
- Notes / preferences
- Event history (derived from linked events)
- Future: login access to a client portal (Phase 5)

### Venue
A location where events take place. Reusable across events.

- Name, address, contact person, contact details
- Practical info: parking, power access, load-in restrictions, kitchen facilities
- Notes (free text)
- Can be linked to multiple events

---

## Menu Entities

### Menu
A collection of dishes/items for a specific event service or as a reusable template.

- Name / description
- Type: food menu or drinks menu
- Service style: sharing, plated, buffet, food station, canapés (informational)
- Can be **event-specific** (customised for one event) or a **template** (reusable starting point)
- Linked to an event (and optionally a specific service day) or standalone as template
- Ordered sections/courses within the menu

### Menu Section
A grouping within a menu (e.g. antipasto, primo, secondo, dolce, late night, reception drinks, evening bar).

- Name
- Display order
- Belongs to one Menu

### Menu Item
An individual dish, drink, or product within a menu section.

- Name, description
- Dietary flags: vegetarian (V), vegan (VG), gluten-free (GF), dairy-free (DF), nut-free (NF), halal — standardised set
- Allergen information (free text)
- Portion size / quantity notes
- Prep notes
- Display order within section
- Alternative options (e.g. "Vegan nut cheese available on request") — linked alternative items or free text

### Drink Spec
Extended detail for drinks menu items — cocktail recipes, wine details, etc.

- Linked to a Menu Item
- Ingredients with quantities (e.g. "40ml espresso, 50ml vodka, 20ml coffee liqueur")
- Glass type
- Garnish
- Method notes

---

## Budget Entities

### Budget
The financial plan for an event. One budget per event. Contains all cost lines.

- Linked to one Event
- Commission: percentage, assignable to venue name or event organiser name
- VAT rate (configurable, default 20%)
- Breakages deposit amount (separate from main total, tracked as refundable)
- Calculated fields: total cost, total client price, total GP, GP%, per-person cost

### Budget Line Item
A single cost line within the budget.

- Category: Food, Drink, Staff, Equipment, Miscellaneous
- Description
- Cost type: per head or flat
- Quantity
- Unit cost
- Total cost (calculated: quantity × unit cost)
- Mark-up percentage (can vary per line)
- Client price per person (calculated)
- Client total price (calculated)
- GP £ and GP% (calculated)
- Display order within category
- Notes

---

## People & Logistics Entities

### Guest Dietary Entry
Named dietary requirements for individual guests at an event.

- Guest name
- Allergies / intolerances (free text)
- Severity flag: major allergy vs preference
- Notes
- Linked to Event

### Staff Entry
A staffing line for an event — a role with count, hours, and costing.

- Role (from user-configurable list: head chef, chef, catering manager, etc.)
- Headcount
- Hours
- Hourly rate
- Total cost (calculated)
- Linked to a specific service day
- Notes (e.g. "NO TRAVEL TIME AM", shift pattern details)
- Cost feeds into budget Staff category

### Outmess Entry
Staff and other meals provided during an event.

- Meal type: cold, hot
- Count
- Service time / label (e.g. "staff lunch", "staff dinner", "staff late food")
- Recipients: staff, venue contact, client, production
- Linked to a specific service day
- Notes

### Equipment Entry
An equipment item needed for the event.

- Category: chairs, linen, crockery & cutlery, glassware, tables, BOH equipment, miscellaneous
- Description
- Quantity
- Per-person quantity multiplier (optional — e.g. 1.5 glasses per person)
- Unit cost
- Total cost (calculated)
- Notes (hire company, SKU references — free text for V1)
- Cost feeds into budget Equipment category
- Linked to Event

---

## Operational Entities

### Timeline Entry
A single entry in the event run sheet / timeline.

- Time (HH:MM)
- Activity description
- Linked to a specific service day
- Display order (sorted by time)
- Notes
- Category/tag: optional, for colour coding (warning, presentation, ops note)

### Tasting
A tasting session linked to an event.

- Date, time, location
- Attendees (names — free text)
- Status: planned → completed
- Notes / decisions
- Linked to one Event

### Tasting Item
An item that was or will be tasted.

- Linked to a Tasting
- Linked to a Menu Item (optional — may be something not on the menu yet)
- Name, description
- Kit / crockery used
- Photos (file uploads)
- Notes / feedback
- Outcome: confirmed, changed, rejected

---

## Key Relationships

```
Organisation
  ├── Users
  ├── Clients
  ├── Venues
  ├── Menu Templates
  │     ├── Menu Sections
  │     │     └── Menu Items (+ Drink Specs)
  │
  └── Events
        ├── Client (link)
        ├── Venue (link)
        ├── Service Days
        │     ├── Timeline Entries
        │     ├── Menus (event-specific, per day)
        │     │     ├── Menu Sections
        │     │     │     └── Menu Items (+ Drink Specs)
        │     ├── Staff Entries
        │     └── Outmess Entries
        ├── Budget
        │     └── Budget Line Items
        ├── Guest Dietary Entries
        ├── Equipment Entries
        └── Tastings
              └── Tasting Items (+ photos)
```

---

## Important Design Considerations

1. **Menus are not fixed products** — the same dish can have different costs and descriptions across events. Per-event customisation is the default.

2. **Templates vs event-specific** — users create menu templates, then copy them to events. Changes to an event menu never affect the template. This is a copy-on-use model, not a reference.

3. **Multi-tenancy** — every table has an `organisation_id` column. Supabase RLS policies enforce data isolation. This is non-negotiable from day one.

4. **Multi-day events** — handled via Service Days. One event can have multiple service days, each with independent guest counts, menus, staffing, and timelines. Single-day events simply have one service day.

5. **Guest count complexity** — guest counts are per service day, not per event. An event with a Friday welcome party (55 guests) and Saturday wedding (65 guests) has two service days with different counts.

6. **Budget as financial engine** — the budget is the source of truth for all pricing. Proposals, invoices, and client-facing summaries derive from it. Mark-up percentages vary per line item. Commission is event-level.

7. **Invoicing happens before the event** — pre-event invoicing with deposit schedule is the default. Breakages deposit is tracked separately and is refundable. Post-event invoicing is supported as an edge case.

8. **Kitchen sheet pulls from other entities** — the kitchen sheet is not a separate data store. It pulls menus, dietaries, staffing, drinks, and timeline from their respective entities and presents them in a kitchen-focused view.

9. **Dietary requirements are per-guest** — not just counts. Individual guests are tracked by name with specific requirements. Major allergies are visually distinct from preferences.

10. **Event IDs are meaningful** — auto-generated with a convention (`W250705ANSI`) but editable. The convention is customisable per organisation.
