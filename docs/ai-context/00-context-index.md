# Momentum Mosaic AI Context Index

This directory is the durable AI context system for Momentum Mosaic. It is designed for short, reusable context loading across Codex, ChatGPT, Claude, IDE agents, UI generators, and implementation planning tools.

Momentum Mosaic is a Daily Discipline System. It helps the user plan the day, enter focused execution, protect one active commitment, and build momentum through consistency.

## How To Use This Directory

Start here, then load only the smallest set of docs needed for the task.

Always load:

- `01-product-identity.md`
- `02-terminology.md`

Load by task:

- UI or interaction work: `03-ux-ui-principles.md` plus the relevant feature spec.
- Backend or domain work: `04-architecture-domain.md` plus the relevant feature spec.
- New features, refactors, dependencies, or scope questions: `05-implementation-constraints.md`.
- AI session process, planning, review, or multi-agent handoff: `06-ai-workflows.md`.
- Reopened product or architecture decisions: the relevant file in `decisions/`.

## Context Packets

### Backend Task Change

Load:

- `01-product-identity.md`
- `02-terminology.md`
- `04-architecture-domain.md`
- `05-implementation-constraints.md`
- `features/task-system.md`
- `features/focus-system.md` when task status or execution state changes

Use when changing task APIs, lifecycle rules, persistence, validation, or dashboard task data.

### UI Redesign

Load:

- `01-product-identity.md`
- `02-terminology.md`
- `03-ux-ui-principles.md`
- the relevant feature spec

Use when changing dashboard, task, focus, fitness, profile, or workspace screens.

### Feature Planning

Load:

- `01-product-identity.md`
- `02-terminology.md`
- `03-ux-ui-principles.md`
- `05-implementation-constraints.md`
- the closest existing feature spec

Use when deciding whether a new capability belongs in Momentum Mosaic and how it should be shaped.

### Architecture Review

Load:

- `01-product-identity.md`
- `02-terminology.md`
- `04-architecture-domain.md`
- `05-implementation-constraints.md`
- relevant ADRs

Use when reviewing a design for product drift, over-engineering, or domain inconsistency.

### AI Code Review

Load:

- `02-terminology.md`
- `04-architecture-domain.md`
- `05-implementation-constraints.md`
- the relevant feature spec

Review for bugs, regressions, missing tests, architectural drift, terminology drift, and violations of product identity.

## Current Project Shape

- Backend: Java 21, Spring Boot, REST JSON API, Spring Security, OAuth/JWT, JPA, Flyway, MySQL.
- Frontend: Next.js, React, TypeScript, Tailwind, Radix UI, lucide-react.
- Main surfaces: Dashboard/Momentum Workspace, Tasks, Fitness, Profile, Login, Complete Profile.
- Core domains: User, Task, Fitness Log, Momentum Snapshot, Dashboard summary, Auth/profile state.

## Source Of Truth Priority

When context conflicts:

1. Current code and tests win for implemented behavior.
2. `docs/ai-context/` wins for product philosophy, terminology, and intended direction.
3. ADRs win for durable decisions.
4. `oldartifacts/` is historical reference only.

## Maintenance Rule

Keep these docs small. Update them only when a product principle, domain concept, canonical term, workflow, or durable decision changes. Do not turn this into implementation diary documentation.
