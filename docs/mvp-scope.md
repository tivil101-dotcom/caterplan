# CaterPlan — MVP Scope (V1a)

## Status

Agreed on 2026-03-24 between Tim and Claude. This document captures the full MVP scope and is the primary reference for Claude Code when building features.

---

## What the MVP Includes

The MVP is the core loop that demonstrates CaterPlan's unique value: **events + menus + budget/costing + kitchen sheet**. It covers everything a catering company needs to plan an event from enquiry through to execution, using a single source of truth instead of scattered spreadsheets and documents.

---

## Feature Areas

### 1. Auth & Multi-Tenancy

- Google OAuth via Supabase Auth (no email/password for V1)
- Organisation setup — top-level container for all data
- Role-based access: admin, event manager, kitchen, view-only
- Row-level security on every table from day one
- All initial users will have Google accounts

### 2. App Shell & Navigation

- Sidebar navigation (desktop), bottom nav or hamburger (mobile)
- Navigation: Dashboard, Events, Menus, Clients, Venues
- Mobile-optimised from day one — not a retrofit
- User avatar/menu with logout

### 3. Event Management

- Create/edit events with: client, date(s), venue, guest count, event type, status, notes
- Custom event types — user-defined (defaults: Wedding, Corporate)
- Auto-generated event ID: `[Type letter][YYMMDD][4-char reference]` e.g. `W250705ANSI`. Suggested as default, users can set their own naming convention
- Event status workflow: Enquiry → Confirmed → Planning → Execution → Complete (fixed for V1, customisable later)
- Event list view with search and filter by status, date, type
- Calendar view of events
- Multi-day event support — one event, multiple "service days," each with own guest count, menus, staffing, timeline
- Event detail page as the hub for all event information
- Every enquiry is an event in "enquiry" status — no separate entity

### 4. Client Management

- Client record: name, company, contact details, notes/preferences
- Client list view with search
- Event history per client
- Client portal is Phase 5 — internal only for V1

### 5. Venue Management

- Venue register: name, address, contact person, contact details
- Practical fields: parking, power access, load-in restrictions, kitchen facilities, notes
- Venue list with search
- Link venues to events — reusable across events
- Venue details auto-populate on event when selected, but can be overridden per event

### 6. Menu Builder

- Menus with items grouped by course/section (e.g. antipasto, primo, secondo, dolce, late night)
- Menu item fields: name, description, dietary flags (V, VG, GF, DF, NF, halal), allergen info, portion/quantity notes, prep notes
- Multiple menus per event (reception charcuterie, dinner, late night pizza, drinks)
- Vegetarian/vegan/dietary alternatives per item (e.g. "Vegan nut cheese available on request")
- Menu templates — reusable starting points, copy to event, changes don't affect template
- Per-event menu customisation is the default, not an edge case
- Drinks menus — cocktails, wine, soft drinks with specs/recipes (ingredients, quantities, glass type, garnish)
- Menu item reordering within sections

### 7. Budget & Costing

- Line-item budget with categories: Food, Drink, Staff, Equipment, Miscellaneous
- Per line item: description, cost type (per head/flat), quantity, unit cost, total cost, mark-up %, client price PP, client total, GP (£ and %)
- Category subtotals and overall totals with auto-calculation
- Commission: variable %, assignable to venue or event organiser, feeds into GP
- VAT calculation (configurable rate)
- Breakages deposit: separate, tracked as refundable, not in main total
- **Internal view**: full detail — unit costs, mark-ups, GP. Admin/event manager only
- **Client-facing view**: simplified pricing summary, no mark-ups or GP visible
- Per-person cost summary
- One budget per event
- Mark-up % can vary per line item
- Staff food/outmess as cost line with zero client charge
- Tasting as cost line with configurable client charge

### 8. Guest & Dietary Management

- Per-service guest counts (e.g. Friday: 55, Saturday: 65) linked to service days
- Named dietary requirements: guest name, specific allergies/intolerances, notes
- Distinguish major allergies from preferences (visual flag)
- Dietary summary view: aggregate counts (3 vegetarian, 2 vegan, etc.)
- Allergen warnings that surface on menus and kitchen sheet

### 9. Staffing

- Staff roles (user-configurable): head chef, chef, catering manager, floor/bar manager, waiting staff, wine waiter, cocktail barman, porter, driver porter, etc.
- Per entry: role, headcount, hours, hourly rate, total cost
- Per-day staffing for multi-day events
- Staff costs feed into budget automatically
- Outmess tracking: meal type (cold/hot), count per service, venue contact meals, client meals
- Staff transport and accommodation as notes (costed in budget)
- V1 is roles and counts — named staff assignments are V1b+

### 10. Equipment

- Equipment list per event with quantities and costs
- Categories: chairs, linen, crockery & cutlery, glassware, tables, BOH equipment, miscellaneous
- Per item: description, quantity, unit cost, total cost, notes
- Equipment totals feed into budget
- Rich-text notes for hire company references and SKUs (structured supplier fields in Phase 3)
- Per-person quantity multipliers where relevant

### 11. Kitchen Sheet — Structured

Structured data (proper fields/tables):
- Event timeline / run sheet: time-ordered entries per service day
- Menus with allergens: pulled from menu builder, dietary flags prominent
- Named dietary requirements: pulled from guest management, major allergies highlighted
- Staffing summary: roles, headcount, shift times per day
- Drinks breakdown: full specs pulled from drinks menus
- Outmess details: what/when/count per service
- Logistics header: event name, job code, dates, venue, guest counts, key contacts

Rich-text notes (free text, structured later):
- Décor and presentation notes
- Equipment breakdown notes
- Transport notes
- Kitchen order list

Output:
- Printable/exportable PDF
- Colour coding for warnings, presentation notes, ops notes
- Mobile-friendly for on-site reference

### 12. Kitchen Sheet — Ops View

Same underlying data, different view focused on operations:
- Timeline / run sheet
- Staffing details
- Transport & logistics
- Venue details and contacts
- Guest counts per service
- Dietary summary (counts, not per-guest detail)
- Equipment overview

Does NOT show: detailed menu items, cocktail recipes, ingredient lists.
Toggle between kitchen view and ops view from the event page.
Printable/exportable and mobile-friendly.

### 13. Tasting Management

- Create tasting linked to event, pre-populated from event menus
- Tasting details: date, time, location, attendees
- Planned items: menu items to taste, kit/crockery to show, drinks
- Add photos during/after (attached to items)
- Notes and decisions: confirmed, changed, rejected
- Tasting decisions update event menus
- Record dietary notes discovered during tasting
- Tasting status: planned → completed
- One event can have multiple tastings

### 14. Dashboard & Search

- Upcoming events (next 7/14/30 days)
- Events needing attention: missing information, overdue actions
- Quick stats: events this month, total revenue, average GP
- Quick-create event button
- Recent activity
- Global search: events by client name, event name, event ID, venue
- Event list filtering and sorting

---

## What's NOT in the MVP

These are documented for future phases:

| Feature | Phase | Notes |
|---|---|---|
| Contract generation | Phase 2 | Generate from event data, T&Cs template, PDF, status tracking |
| Digital signatures | Phase 2/5 | Likely needs DocuSign or similar |
| Invoicing | Phase 2 | Generate from budget, payment schedule, PDF |
| Document storage & versioning | Phase 2 | Version history on proposals |
| Communication log | Phase 2 | Track emails/calls per event |
| Event cloning | Phase 2 | Copy existing event as starting point |
| In-app notifications | Phase 2 | Contract not signed, payment due, etc. |
| Stock/inventory management | Phase 3 | Owned equipment register |
| Cross-event resource tracking | Phase 3 | Conflict detection across events |
| Own vs hire per event | Phase 3 | Central equipment with allocation |
| Supplier management | Phase 3 | Hire companies, imported price lists |
| Event GP reporting | Phase 4 | With own-vs-hire nuance |
| Kitchen finance view | Phase 4 | Weekly spend vs revenue |
| Cross-event analytics | Phase 4 | Revenue by period, type, client |
| Client portal | Phase 5 | Client login, proposal approval |
| Data import | Phase 6 | Import from spreadsheets/other systems |
| Xero integration | Phase 6 | Push invoices to accounting |
| Ingredient-level costing | Not planned | Kitchen finance view covers the need |

---

## Key Design Principles

1. **Menus are not fixed products** — per-event customisation is the default, not an edge case
2. **Templates exist for efficiency** — but changes to event menus never affect templates
3. **Multi-tenancy from day one** — Supabase RLS, data isolation between organisations
4. **Mobile-optimised** — no native app, but everything works on phone browsers
5. **Kitchen sheet is the operational bible** — structured where it matters (timings, menus, dietaries), flexible where detail varies (décor, crockery)
6. **Budget is the financial engine** — everything derives from it (proposals, invoices, GP)
7. **Single source of truth** — one event page with everything accessible from it

---

## Reference Material

Real-world documents from a Jimmy Garcia Catering wedding event are available as reference:
- Proposal PDF (client-facing, branded)
- Budget spreadsheet (internal, line-item costing with mark-ups and GP)
- Contract (booking form with payment terms and T&Cs)
- Tasting sheet (planned menu, kit, drinks, with notes)
- Kitchen sheet (9-page operational document — timings, menus, allergens, staffing, drinks, equipment, logistics)

These documents informed the MVP scope and should be referenced when building features to ensure CaterPlan handles real-world complexity.
