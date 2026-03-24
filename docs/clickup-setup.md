# CaterPlan — ClickUp Setup

## Overview

CaterPlan work is tracked in a **separate Space** within the Dines ClickUp workspace, independent from Tim's Dines work.

**Important:** Claude should never touch anything outside of the two CaterPlan lists below.

---

## Space & List IDs

| Item | ID | URL |
|---|---|---|
| **CaterPlan Space** | `90126807038` | — |
| **Project Plan list** | `901216602639` | https://app.clickup.com/25704406/v/l/li/901216602639 |
| **Development list** | `901216602636` | https://app.clickup.com/25704406/v/l/li/901216602636 |

**Task link format:** `https://app.clickup.com/t/[task_id]`

Whenever Claude creates a task, adds a comment, or takes any other action on a ClickUp task, the confirmation message must include a hyperlink to the task.

---

## Two-List Structure

### Project Plan List

Tim's personal project management list. Tracks the high-level project phases and scope decisions.

Currently contains **Project-type tasks** for each development phase:

| Task | Priority | What It Tracks |
|---|---|---|
| Phase 1: MVP (V1a) | High | The core MVP — linked to all dev tickets |
| Phase 2: Commercial Features (V1b) | Normal | Contracts, invoicing, doc management |
| Phase 3: Resources & Supply Chain | Normal | Stock, equipment tracking, suppliers |
| Phase 4: Reporting & Analytics | Low | GP reporting, kitchen finance |
| Phase 5: Client-Facing | Low | Client portal, proposal approval |
| Phase 6: Polish & Scale | Low | Data import, integrations, notifications |

### Development List

A Kanban board tracking the actual development work. Build tasks that Claude Code will implement. All Phase 1 dev tickets are linked to the Phase 1 project task on the Project Plan list.

**Statuses (confirmed):**

| Status | Purpose |
|---|---|
| **Backlog** | Defined but not yet being worked on |
| **Blocked** | Can't progress — needs a decision or dependency |
| **Ready to Build** | Scoped enough for Claude Code to pick up |
| **In Progress** | Currently being built with Claude Code |
| **Testing** | Built — Tim is testing whether it works as expected |
| **Done** (closed) | Working and deployed |

This is simpler than a traditional dev workflow because there's no code review step (no other developers), no separate QA team, and no staging environment initially. Tim tests it himself and either it works or it goes back to In Progress.

---

## Priority Columns

Same as Dines setup:

| Priority | Usage |
|---|---|
| Urgent | Needs doing now |
| High | Active focus |
| Normal | Coming up soon |
| Low | Backlog / nice to have |

---

## Documentation Approach

- **ClickUp** is for task tracking and short decision notes only
- **Long-form documentation** (product overview, data model, MVP scope, tech stack) lives as markdown files in the GitHub repo under `/docs`
- Claude Code can read and update the docs in the repo
- This avoids the formatting limitations of ClickUp descriptions for detailed documents

---

## Working Model

Tim manages the project entirely through Claude (claude.ai and Claude Code). The workflow is:

1. **Claude.ai** — project management, product design, ClickUp management, drafting Claude Code prompts
2. **Claude Code** — builds features, writes code, handles Git
3. **Tim** — product decisions, testing, feedback via voice (Wispr Flow)

Tim does not type in ClickUp directly. All ClickUp updates go through Claude.ai.

---

## Notes

- This is a side project — don't over-process it. The ClickUp setup should help Tim stay organised, not add overhead.
- No due dates needed unless Tim wants them. For a side project, priorities matter more than deadlines.
- The Project Plan list is Tim's view of what needs doing. The Development list is the build queue for Claude Code.
- No Epic task type — the Phase project tasks on the Project Plan list serve as the high-level containers. Tags can be added later if grouping dev tickets becomes useful.
