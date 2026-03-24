# CaterPlan — Tech Stack

## Overview

The stack is chosen for speed of development, ease of deployment, and compatibility with Claude Code as the primary development tool. All decisions here are starting points — they can change as the project evolves.

---

## Core Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | Next.js (App Router) | Full-stack React framework. Handles frontend + API routes in one project. Excellent Claude Code support. |
| **Language** | TypeScript | Type safety catches errors early. One language across frontend and backend. |
| **Database** | Supabase (Postgres) | Managed Postgres with built-in auth, row-level security, and a generous free tier. Avoids rolling custom auth. |
| **Auth** | Supabase Auth | Comes with Supabase. Handles sign-up, login, password reset, session management. |
| **Hosting** | Vercel | Purpose-built for Next.js. Free tier is solid for early stage. Deploys on git push. |
| **Styling** | Tailwind CSS | Utility-first CSS. Claude Code handles it well. Fast to iterate with. |
| **UI Components** | shadcn/ui (likely) | Pre-built, customisable components built on Tailwind. Not a dependency — components are copied into the project. |

---

## Why This Stack

1. **One language everywhere** — TypeScript on frontend and backend means no context switching
2. **Minimal infrastructure management** — Supabase and Vercel handle hosting, scaling, and database management
3. **Fast to ship** — Next.js + Vercel means deploy in minutes, not hours
4. **Claude Code friendly** — all of these tools are well-understood by Claude and produce good results
5. **Free to start** — Supabase free tier (50k monthly active users, 500MB database) and Vercel free tier cover early development easily
6. **Scales when needed** — if the project grows, both Supabase and Vercel have paid tiers that scale without re-architecting

---

## Source Control

**GitHub** — standard Git workflow. Main branch is production. Feature branches for new work.

Repository setup TBC.

---

## Development Environment

- **Claude Code** as the primary coding tool
- Local development using `next dev`
- Supabase CLI for local database development (optional — can also develop against the hosted Supabase instance)

---

## What's Deliberately Not Included (Yet)

| Thing | Why Not |
|---|---|
| **Mobile app** | Web-first. If needed later, the web app can be made responsive or a PWA. |
| **Email service** | Not needed until we have features that require notifications (e.g. client confirmations). Supabase handles auth emails. |
| **Payment processing** | No billing features in V1. |
| **CI/CD pipeline** | Vercel handles deployment. No need for custom pipelines yet. |
| **Testing framework** | Will add when there's enough code to justify it. Don't want to set up testing infrastructure before there's anything to test. |
| **Analytics** | Not needed yet. Can add Vercel Analytics or similar later. |

---

## Decision Log

Decisions about the stack should be logged here as they're made.

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-24 | Initial stack: Next.js + Supabase + Vercel + Tailwind | Best balance of speed, simplicity, and Claude Code compatibility for a solo developer. |
