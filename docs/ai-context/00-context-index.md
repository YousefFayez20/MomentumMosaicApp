# Momentum Mosaic AI Context Index

This directory is the durable AI context system for Momentum Mosaic. It is designed for short, reusable context loading across Codex, ChatGPT, Claude, IDE agents, UI generators, and implementation planning tools.

Momentum Mosaic is a Daily Discipline System. It helps the user plan the day, enter focused execution, protect one active commitment, and build momentum through consistency.

> [!TIP]
> For a complete, single-file transfer packet containing all project accomplishments, mathematical models, API schemas, and architectural history, see [`docs/MASTER_PROJECT_CONTEXT.md`](../MASTER_PROJECT_CONTEXT.md).

---

## How To Use This Directory

Start here, then load only the smallest set of docs needed for the task.

**Always load:**
- `01-product-identity.md`
- `02-terminology.md`

**Load by task:**
- **UI or interaction work**: `03-ux-ui-principles.md` plus the relevant feature spec in `features/`.
- **Backend or domain work**: `04-architecture-domain.md` plus the relevant feature spec in `features/`.
- **New features, refactors, dependencies, or scope questions**: `05-implementation-constraints.md`.
- **AI session process, planning, review, or multi-agent handoff**: `06-ai-workflows.md`.
- **Reopened product or architecture decisions**: the relevant file in `decisions/`.

---

## Context Packets

### Backend Task & Workspace Change
**Load:**
- `01-product-identity.md`
- `02-terminology.md`
- `04-architecture-domain.md`
- `05-implementation-constraints.md`
- `features/task-system.md`
- `features/study-workspace.md`
- `features/focus-system.md`

*Use when changing workspace hierarchy, task APIs, lifecycle rules, persistence, validation, or dashboard aggregation.*

### UI Redesign & Interaction Polish
**Load:**
- `01-product-identity.md`
- `02-terminology.md`
- `03-ux-ui-principles.md`
- Relevant feature spec (`features/study-workspace.md`, `features/momentum-workspace.md`, etc.)

*Use when modifying dashboard, tasks, focus mode, deep writing overlay, fitness, profile, or workspace canvases.*

### Feature Planning
**Load:**
- `01-product-identity.md`
- `02-terminology.md`
- `03-ux-ui-principles.md`
- `05-implementation-constraints.md`
- The closest existing feature spec

*Use when deciding whether a new capability belongs in Momentum Mosaic and how it should be shaped.*

### Architecture Review
**Load:**
- `01-product-identity.md`
- `02-terminology.md`
- `04-architecture-domain.md`
- `05-implementation-constraints.md`
- Relevant ADRs (`decisions/ADR-0001-context-system.md`, `decisions/ADR-0002-workspace-implementation.md`)

*Use when reviewing a design for product drift, over-engineering, or domain inconsistency.*

---

## Current Project Shape

- **Backend**: Java 21, Spring Boot 4.0, REST JSON API, Spring Security, OAuth/JWT, JPA/Hibernate, Flyway (V12–V19), MySQL 8.4, Jsoup.
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Radix UI, Lucide React, Framer Motion.
- **Main surfaces**: Dashboard/Momentum Workspace, Study Workspace (with Deep Writing distraction-free canvas), Tasks & Active Focus Mode, Fitness Tracker, Profile & Biometrics, Login, Complete Profile.
- **Core domains**: User (AppUser), Task, Fitness Log, Momentum Snapshot & Calculator, Study Workspace (Sections, Workspaces, Entries, Resources), Dashboard Summary, Auth/Profile State.

---

## Source Of Truth Priority

When context conflicts:
1. **Current code and tests** win for implemented behavior.
2. `docs/ai-context/` wins for product philosophy, terminology, and intended direction.
3. `docs/MASTER_PROJECT_CONTEXT.md` wins for end-to-end multi-chat synthesis, domain math, and cross-cutting architecture.
4. ADRs win for durable decisions.
5. `oldartifacts/` is historical reference only.

---

## Maintenance Rule

Keep these docs small. Update them only when a product principle, domain concept, canonical term, workflow, or durable decision changes. Do not turn this into implementation diary documentation.
