# Implementation Prompt Template

Use this when handing a planned change to an implementation agent.

```md
Repository: Momentum Mosaic

Load context:

- docs/ai-context/00-context-index.md
- docs/ai-context/01-product-identity.md
- docs/ai-context/02-terminology.md
- docs/ai-context/05-implementation-constraints.md
- docs/ai-context/features/[relevant-feature].md

Implementation goal:
[Concrete behavior to implement.]

Scope:

- In scope: [files/surfaces/behaviors]
- Out of scope: [explicit non-goals]

Behavior requirements:

- [Requirement 1]
- [Requirement 2]
- [Requirement 3]

Acceptance checks:

- [Check 1]
- [Check 2]
- [Check 3]

Verification:

- Run relevant backend tests for domain/API changes.
- Run frontend build/lint for UI changes where practical.
- For docs-only changes, verify file paths and links.

Expected response:

- Summary of changes.
- Tests or checks run.
- Any follow-up risks.
```
