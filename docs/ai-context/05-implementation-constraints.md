# Implementation Constraints

These constraints protect Momentum Mosaic from over-engineering, feature drift, and product identity loss.

## Project-Wide Rules

- Keep changes scoped to the feature being changed.
- Prefer existing frameworks and patterns over new abstractions.
- Preserve the current frontend/backend separation.
- Keep domain rules on the backend when they affect persistence or authorization.
- Keep UI copy aligned with the serious-coach product voice.
- Favor simple schemas and explicit state transitions.
- Update AI context docs or ADRs when durable meaning changes.

## Forbidden Directions

Do not add:

- generic project management boards
- nested folders beyond a clearly justified simple hierarchy
- knowledge graph features
- backlinks or graph views
- Notion-style block editing
- social feeds
- leaderboards
- heavy gamification systems
- complex notification systems without a daily-action reason
- analytics pages that do not guide action
- another task-like inbox under a different name

## MVP Boundaries

For new capabilities, prefer the narrowest useful version:

- one primary workflow
- one clear lifecycle
- minimal configuration
- no power-user settings unless required
- no advanced history views until basic daily value is proven

## Anti-Complexity Rules

- If a feature requires users to maintain a new system, it is suspicious.
- If a feature duplicates tasks, it should probably be folded into tasks.
- If a feature stores information indefinitely, define its lifecycle.
- If a feature adds a new surface, justify why an existing surface cannot host it.
- If a feature needs extensive explanation in the UI, simplify the feature.

## Stack Constraints

Current stack:

- Backend: Java 21, Spring Boot, JPA, Flyway, MySQL, Spring Security.
- Frontend: Next.js, React, TypeScript, Tailwind, Radix UI, lucide-react.

Default to this stack. Add dependencies only when they solve a real problem better than local code and do not pull the product toward an unsupported direction.

## Testing Expectations

Backend changes:

- Test domain rules, lifecycle transitions, ownership, validation, and controller behavior.
- Add repository or migration coverage when persistence changes are risky.

Frontend changes:

- Verify build/lint where practical.
- Check responsive behavior for primary surfaces.
- Verify focus/session interactions manually when browser state matters.

Docs-only changes:

- Verify links/paths and file names.
- No runtime tests required.

## Documentation Rule

This context system is not a corporate documentation system. Keep docs practical, short, and useful for AI loading. Prefer stable philosophy and domain meaning over detailed implementation commentary.
