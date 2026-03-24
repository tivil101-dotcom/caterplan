# CaterPlan — Product Overview

## What It Is

CaterPlan is a web-based platform designed specifically for catering companies to plan, manage, and execute events.

---

## The Problem

Existing event management software doesn't work well for catering companies. The core issues:

1. **Built for event companies, not caterers** — most event management tools are designed for end-to-end event companies who plan everything: venue, photographers, transport, entertainment, and catering. The caterer is treated as one supplier among many. Some tools are venue-focused (managing bookings for a specific space), but either way the caterer's specific operational needs are secondary.

2. **Fixed pricing models don't fit** — event tools assume fixed-price items (e.g. "1 table = £X"). Catering doesn't work like that. Menus have variable cost prices, items change between events, and a single event might have multiple custom menus.

3. **Menu customisation is an edge case, not the norm** — in most event tools, the "product" is static. In catering, the menu is often bespoke per event and per client. The tool needs to treat customisation as the default, not an exception.

4. **No single source of truth** — caterers end up using spreadsheets, documents, and generic tools to manage what should be a single workflow. Documents are duplicated, versioning is difficult, and information doesn't always match up across different files. CaterPlan should be the source of truth for everything to do with one event.

---

## How Catering Companies Get Work

Catering companies typically receive work through three routes:

1. **Direct from end clients** — a private client contacts the caterer directly for a wedding, party, corporate event, etc.
2. **Via event companies** — an event planning company is organising a larger event and brings in the caterer as part of the package
3. **Via venue lists** — a venue maintains a list of approved caterers, and clients choose from that list

In all three cases, the caterer treats it as a standard quote → job workflow. The source of the enquiry doesn't fundamentally change how they plan and execute the event. Sometimes the caterer also helps find the venue, blurring the line between caterer and event planner, but the core workflow remains the same.

---

## Who It's For

**Primary user:** The catering company itself — event managers, operations managers, and business owners who plan and manage events.

**Kitchen access:** Kitchen teams should also be able to log in to see relevant kitchen information (menus, quantities, prep notes, dietary requirements) without needing to wade through the full event management side.

The tool is internal-facing. The catering company uses it to manage their own events, menus, and operations.

**Future consideration:** A client-facing portal where prospective or booked clients can view proposals, confirm details, or communicate with the caterer. This is out of scope for V1 but should be kept in mind architecturally.

---

## Design Partner

**Jimmy Garcia Catering** (jimigarciacatering.co.uk) — a London-based catering company. Tim worked there for 6 years and still manages their IT. They are currently using EventWorks and would be good people to talk to about what works and what doesn't.

Note: Jimmy Garcia have not formally agreed to be a design partner yet, but Tim has a strong existing relationship and expects they'd be willing to provide feedback.

---

## What Makes Catering Different

Key characteristics of catering operations that generic event tools don't handle well:

- **Menus are the product** — and they change per event, per client, and sometimes per dietary requirement
- **Cost prices vary** — the same dish can have different costs depending on ingredient prices, quantities, and season
- **Events have complex logistics** — staff, equipment, transport, venue access, setup times
- **Multiple service styles** — sit-down, buffet, canapés, food stations, street food — each with different planning needs
- **Proposals are iterative** — clients go back and forth on menus, quantities, and budgets before confirming
- **Invoicing typically happens before the event** — usually with a deposit taken for potential damages on kit, which is refunded afterwards. There are edge cases where payment happens post-event, so the system needs to be flexible, but pre-event invoicing is the norm.
- **Documents are duplicated and version-controlled badly** — the same event information exists in multiple spreadsheets and documents that don't stay in sync. A single source of truth is the core value proposition.
- **Multi-day events are common** — a wedding might have a Friday welcome party and a Saturday ceremony, each with different menus, guest counts, and staffing
- **The kitchen sheet is the operational bible** — a comprehensive document covering timings, menus, allergens, staffing, drinks specs, equipment, and logistics. Currently managed as a Word/PDF document that goes through multiple versions

---

## Tim's Unique Position

Tim has:
- 6 years of direct experience working in catering operations
- Current experience working for a tech company (Dines) building hospitality software
- An ongoing relationship with a catering company willing to provide feedback
- First-hand knowledge of where existing tools fall short

This combination of domain knowledge and tech exposure is the foundation for the product.

---

## Endgame

Tim doesn't think there's a large enough standalone market for catering-specific event management to build a viable business around it. The project is primarily:

1. **A learning exercise** — an interesting project to build solo and develop technical skills
2. **A potential acquisition target** — the most realistic commercial outcome would be selling the catering-specific module to an existing event management software company (like EventWorks) who would integrate it into their platform

If it did become a product, a SaaS subscription model would be the likely approach — but that's a distant consideration, not a current priority.

### What This Means for How We Build

- **Focus on the unique catering logic** — menu builder, variable costing, dietary management, per-event customisation, kitchen sheet. This is the differentiating value. An acquirer would already have CRM, auth, invoicing, diary management — they'd be buying the catering-specific features they don't have.
- **Keep generic features minimal** — don't over-invest in auth flows, CRM, or invoicing. Build just enough to make the product functional, but the effort should go into the catering-specific parts.
- **Code quality matters** — well-structured, documented code with a clean API is more valuable than a scrappy prototype if someone is evaluating it for integration. This doesn't mean over-engineering — it means clean separation of concerns, good naming, and a sensible architecture.
- **Build it as a self-contained module where possible** — the catering features should be cleanly separable from the generic platform scaffolding. This makes it easier for an acquirer to lift out the valuable parts.

---

## Competitor Landscape

### EventWorks (geteventworks.com) — Primary Reference

UK-based all-in-one event management platform. The closest existing tool and the one Jimmy Garcia currently uses.

**What it does well:**
- Full event lifecycle: enquiry → quote → job → invoice
- Diary and calendar management across venues/people
- Job costing and quoting with export to PDF
- Integrations with Xero, Sage, and MailChimp
- Customisable workflows and form templates per event type
- Resource management (rooms, equipment, people)
- File storage per event/customer

**Where it falls short for caterers:**
- Menu management is not a first-class concept
- Pricing models assume relatively fixed supplier costs
- No deep support for menu customisation, dietary management, or per-event menu iteration
- The quote → job workflow doesn't naturally handle the back-and-forth of menu development

**Key advantage:** Jimmy Garcia already uses EventWorks, so Tim has direct access to real user feedback on what works and what's missing.

### Other Competitors Worth Knowing About

| Tool | Focus | Notes |
|---|---|---|
| **Caterease** (caterease.com) | Catering-specific | US-focused. 50k+ users. Has menu management, recipes, packing lists, staff scheduling. Desktop-origin, now SaaS. Expensive with add-on pricing model. |
| **Total Party Planner** (totalpartyplanner.com) | Catering-specific | US-focused. Menu costing, BEOs, invoicing, staffing. Built by caterers. |
| **BetterCater** (bettercater.com) | Catering-specific | US-focused. Budget-friendly ($57/mo). Proposals, menus, pack lists, calendar. Mobile-optimised. |
| **Tripleseat** (tripleseat.com) | Venues & restaurants | More venue/restaurant focused than catering-specific. Large, expensive. Good for booking management but not deep on catering operations. |
| **Sprwt** (sprwt.io) | Catering | Online ordering, proposals, invoicing, kitchen reports. Includes website builder. |
| **Infor Sales & Catering** | Enterprise hospitality | Large-scale hotel/convention centre tool. Overkill for independent caterers. |

**Key observation:** Most catering-specific tools are US-focused. The UK market is underserved — EventWorks is the main player, and it's a general event tool rather than catering-first. This could be relevant if CaterPlan ever becomes a product.

When designing CaterPlan features, EventWorks should be the primary reference point — not to copy, but to understand the baseline and where CaterPlan can differentiate by being catering-first.

---

## Scope Status

**MVP scope (V1a) has been defined.** See `mvp-scope.md` for the full breakdown. The MVP covers: events, menus, budget/costing, guest & dietary management, staffing, equipment, kitchen sheet (kitchen + ops views), tasting management, dashboard, and search. Future phases cover commercial features (contracts, invoicing), resource management, reporting, and a client portal.
