# CaterPlan — Session Handover (v2)

## Context

Updated 2026-03-25 after first build session. Tim is building a catering-specific event management platform as a side project, using Claude.ai for project management and Claude Code for development. Tim uses Wispr Flow (voice-to-text) and does not type — everything is voice-driven.

---

## What's Been Done

### Completed Tickets

| # | Ticket | Task ID | Notes |
|---|---|---|---|
| 1 | Dev Environment Setup | 869cm77rj | Next.js + Supabase + Vercel + shadcn/ui. Deployed and live. |
| 2 | Auth & Multi-Tenancy | 869cm77rt | Google OAuth, org creation, profiles, RLS. Working. |
| 3 | App Shell & Navigation | 869cm77t1 | Sidebar (desktop), hamburger menu (mobile), top bar with user menu. |
| 4 | Event Management — Core | 869cm77tg | CRUD, event types, event days, event services, status workflow, dashboard updates. |
| 5 | Client Management | 869cm77uc | CRUD, search, event history, inline creation from event form. |
| 6 | Venue Management | 869cm7896 | CRUD, practical details, search, inline creation from event form. |
| 7 | Multiple Clients per Event | 869cmt2rj | Junction table with roles (end_client, organiser, event_company). Multi-client form, detail pages updated. |
| 7a | Menu Builder — Core | 869cm78am | menus, menu_sections, menu_items, menu_item_alternatives tables. Full API, /menus list page, full-page editor with DnD reordering, dietary flags, 14 UK allergens, item alternatives. |

### Key Design Changes During Build

* **Service Days renamed to Event Days** — throughout the codebase and data model
* **Event Services added** — new layer under Event Days. Multiple services per day (breakfast, lunch, dinner) with independent guest counts
* **Menus link to services** — not event days. Breakfast service gets a breakfast menu, dinner gets a dinner menu
* **Staffing is per event day** — staff work across services. Has arrival/departure times. 8-hour break flag planned.
* **Multiple clients per event** — junction table (event_clients) with roles (end_client, organiser, event_company). Replaces old single client_id FK on events. Data migrated.
* **Mobile navigation** — changed from bottom nav to hamburger menu with slide-out sidebar
* **Venue practical details** — display within the venue card on event detail page
* **Custom event types** — can be added inline from the event form (not just Wedding/Corporate)

### Architecture Principles Established

* **API-first** — every feature has complete API routes. UI is just one consumer. Future MCP server is another.
* **AI-readable data** — descriptive column names, readable enum values (not numbers), plain text for notes
* **PostgreSQL COMMENT statements** — all future migrations must include COMMENT ON TABLE and COMMENT ON COLUMN so AI reading the schema understands the data model
* **RLS on everything** — org-scoped, no exceptions
* **Mobile-first** — all features work on phone browsers

---

## Environment

| Thing | Value |
|---|---|
| **Live URL** | https://caterplan-plum.vercel.app |
| **GitHub repo** | https://github.com/tivil101-dotcom/caterplan |
| **Supabase project** | CaterPlan (zgzusmffsrdutyktlatn) |
| **Supabase URL** | https://zgzusmffsrdutyktlatn.supabase.co |
| **Region** | Europe |
| **Claude Code permissions** | Bypass permissions enabled |

---

## What's Next

### Immediate Next Tickets

1. **Menu Builder** (869cm78am) — High priority. Needs planning session before building. Most catering-specific feature. Most catering-specific feature.

### After That

1. Budget & Costing (869cm78bp)
2. Guest & Dietary Management (869cm78cf)
3. Staffing (869cm78dk)
4. Equipment (869cm78fc)
5. Kitchen Sheet — Structured (869cm78gv)
6. Kitchen Sheet — Ops View (869cm78h8)
7. Tasting Management (869cm78k4)
8. Dashboard & Search (869cm78n3)
9. Event Status Transition Restrictions (869cmt2ud) — build after core features exist

### Future

* **AI Integration** — MCP Server + In-App AI Features (869cm8xq6) — on Project Plan list

---

## ClickUp Structure

**CRITICAL:** Claude should never touch anything outside these two lists.

| List | ID | Purpose |
|---|---|---|
| **Project Plan** | 901216602639 | High-level phases and scope |
| **Development** | 901216602636 | Build tasks for Claude Code |

---

## Working Model

| Who | What They Do |
|---|---|
| **Tim** | Product decisions, testing, feedback via voice (Wispr Flow). Never types in ClickUp or code. |
| **Claude.ai** | Project management, product design, ClickUp management, drafts Claude Code prompts |
| **Claude Code** | Builds features, writes code, handles Git, updates docs in the repo |

### Workflow

1. Claude.ai and Tim agree what to build next
2. Claude.ai drafts a detailed prompt for Claude Code
3. Tim pastes it into Claude Code
4. Claude Code builds it, pushes to GitHub, Vercel auto-deploys
5. Tim tests the deployed version
6. Tim feeds back to Claude.ai, who updates ClickUp and drafts fixes if needed

---

## Key Principles

* Tim manages everything through Claude — no typing in ClickUp, no writing code
* ClickUp is for task tracking and short notes only
* Long-form documentation lives in GitHub repo `/docs` AND Claude.ai project knowledge (both should match)
* Claude Code reads and updates docs in the repo
* Mobile-optimised is a day-one requirement for CaterPlan
* All migrations must include PostgreSQL COMMENT statements for AI readability
* All features must have complete API routes (API-first architecture)

---

## Reference Documents Available

Real-world documents from a Jimmy Garcia Catering wedding event (Anne & Simone, July 2025, Euridge Manor) were uploaded and reviewed during scoping:

* Proposal PDF (client-facing, branded, 23 pages)
* Budget spreadsheet (internal, line-item costing with mark-ups and GP — Excel)
* Contract (booking form with payment terms and T&Cs)
* Tasting sheet (planned menu, kit, drinks — Word doc)
* Kitchen sheet (9-page operational document — timings, menus, allergens, staffing, drinks, equipment, logistics)

These should be re-uploaded if Claude Code needs to reference them when building specific features.
