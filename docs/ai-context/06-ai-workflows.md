# AI Workflows

Use these workflows to keep AI-assisted work consistent, token-efficient, and aligned with Momentum Mosaic.

## General Loading Pattern

1. Load `00-context-index.md`.
2. Load `01-product-identity.md`.
3. Load `02-terminology.md`.
4. Load only the feature spec and principles needed for the task.
5. Read current code before planning or editing.

Do not paste the entire context system into every prompt. Use context packets.

## Planning Workflow

Use for product changes, new features, and architecture decisions.

1. Load product identity, terminology, UX principles, implementation constraints, and the closest feature spec.
2. State the intended user behavior.
3. Identify product risks and anti-goals.
4. Propose the smallest useful implementation.
5. Define acceptance checks.
6. Create or update an ADR only if the decision is durable.

## Implementation Workflow

Use for coding agents.

1. Load the smallest context packet.
2. Inspect the relevant code, tests, API types, and UI entrypoints.
3. Implement the scoped change.
4. Add or update tests based on risk.
5. Verify build/test/lint where practical.
6. Summarize behavior changed, files touched, and any context docs that need updates.

## UI Generator Workflow

Use for visual or layout agents.

1. Load product identity, terminology, UX principles, and the target feature spec.
2. Preserve operational density and low cognitive load.
3. Build the actual app surface, not a landing page.
4. Keep the next action visible.
5. Avoid decorative complexity that distracts from execution.
6. Verify mobile and desktop layouts.

## Code Review Workflow

Review in this order:

1. User-visible regressions.
2. Domain rule violations.
3. Auth, ownership, and data consistency bugs.
4. Product identity or terminology drift.
5. Missing tests for changed behavior.
6. Over-engineering or unsupported feature direction.

Findings should cite files and lines when possible.

## Multi-Agent Handoff

When handing off to another AI tool, include:

- task goal
- loaded context files
- current code areas inspected
- decisions already made
- acceptance checks
- tests run or not run
- unresolved risks

Keep handoffs short. Link context files instead of pasting them.

## When To Update Context

Update context docs when:

- a canonical term changes
- a domain concept is added or removed
- a feature boundary changes
- the product philosophy changes
- a durable architecture decision is made
- a recurring AI mistake needs prevention

Do not update context docs for:

- small bug fixes
- styling tweaks
- one-off implementation details
- temporary experiments

## Prompting Rule

Every AI prompt should separate:

- product context
- task goal
- files or surfaces involved
- constraints
- expected output

This reduces token waste and prevents agents from inventing missing product direction.
