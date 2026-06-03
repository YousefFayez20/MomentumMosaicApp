# Architecture and Domain Knowledge

This document preserves high-level architectural understanding for AI sessions. It is not an implementation inventory.

## System Shape

Momentum Mosaic uses a client-server architecture.

- Frontend: Next.js, React, TypeScript, Tailwind, Radix UI, lucide-react.
- Backend: Java 21, Spring Boot, REST JSON API, Spring Security, OAuth/JWT, JPA, Flyway, MySQL.
- API contract: JSON over REST, with shared frontend types in `momentum-mosaic-dashboard/lib/api.ts`.

## Major Domains

### User

The user has identity, authentication state, profile completion state, and biometric reference data.

Profile data supports personalization and nutrition reference values. It should not dominate the daily workspace unless it becomes directly actionable.

### Auth and Profile State

The app recognizes three states:

- Unauthenticated: no valid JWT, redirect to login.
- Profile incomplete: authenticated but missing required profile data, redirect to complete profile.
- Authenticated: valid token and completed profile, allow protected app surfaces.

OAuth login uses the backend Google OAuth entrypoint. The frontend stores the JWT in `localStorage` and sends it as a bearer token.

### Task

A Task is a commitment with:

- owner
- title
- type
- duration estimate
- optional planned date
- lifecycle status
- start/completion timestamps
- actual minutes when completed from an active session

Tasks are not just checklist items. They are the operational unit of execution.

### Task Type

`TaskType` values:

- `DEEP`: high-value protected work, shown as Deep Focus.
- `SHALLOW`: smaller operational work, shown as Light Focus.
- `FITNESS`: physical discipline work, shown as Fitness.

No generic `OTHER` type should return without a deliberate decision.

### Task Status

`TaskStatus` values:

- `PLANNED`: available to start or complete.
- `IN_PROGRESS`: current active focus session.
- `COMPLETED`: finished and included in completed task history.

The lifecycle is:

```text
PLANNED -> IN_PROGRESS -> COMPLETED
PLANNED -> COMPLETED
IN_PROGRESS -> PLANNED
```

The last transition is abandon behavior. It should be neutral.

### Fitness Log

Fitness records whether the user worked out on a day. Fitness is a daily discipline signal and contributes to momentum. The workout streak is emotionally important but should not become punishment-oriented.

### Momentum Snapshot

A Momentum Snapshot stores a date-level momentum state. It exists to preserve trend and rhythm over time rather than recalculate all meaning from scratch on every UI render.

### Momentum Summary

Momentum Summary is the user-facing signal for current rhythm. It includes:

- state
- display label
- trend
- rhythm position
- context message

Momentum Summary should guide context and motivation, not become a complex analytics product.

### Dashboard Response

Dashboard data aggregates user, task, fitness, and momentum summaries for the Momentum Workspace. This API supports the "what does today require?" surface.

### Study Workspace

The Study Workspace is a focused execution environment for learning and deep work. It consists of:

- **WorkspaceSection**: Groups workspaces (e.g., "DSA", "System Design").
- **Workspace**: The actual execution environment.
- **WorkspaceEntry**: Plain text notes within the workspace. Strict plain text prevents feature creep into rich-text knowledge management.
- **WorkspaceResource**: References and external links to keep the focus session self-contained.

## Domain Relationships

- Tasks provide planned and completed execution signals.
- Focus Sessions are task states, not separate entities today.
- Fitness contributes a daily physical discipline signal.
- Momentum combines task completion, deep work, workout signal, and intentionality.
- The Momentum Workspace composes task, fitness, and momentum data into the primary daily experience.
- The Study Workspace connects DEEP focus tasks with execution-oriented notes and resources, preventing knowledge base bloat.

## System Boundaries

- The frontend should own presentation, optimistic interaction, route guards, and client-side composition.
- The backend should own identity, authorization, domain rules, persistence, and momentum calculation.
- Shared API meaning should remain stable and documented when changed.
- Avoid duplicating business rules in the frontend when the backend is the domain authority.

## Architectural Direction

Prefer small, explicit domain additions over broad platform abstractions. Add new concepts only when they strengthen the execution loop or preserve important product meaning.

Do not over-document implementation details here. Use this file to help future agents understand the domain before reading code.
