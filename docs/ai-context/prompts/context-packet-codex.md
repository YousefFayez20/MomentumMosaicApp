# Context Packet: Codex

Use this when asking Codex to implement or review code in this repository.

```md
You are working in the Momentum Mosaic repository.

Load these context docs first:

- docs/ai-context/00-context-index.md
- docs/ai-context/01-product-identity.md
- docs/ai-context/02-terminology.md
- docs/ai-context/05-implementation-constraints.md

Then load only the relevant feature spec from docs/ai-context/features/.

Goal:
[Describe the specific change.]

Constraints:

- Preserve Momentum Mosaic as a Daily Discipline System.
- Keep terminology stable.
- Read the relevant code before editing.
- Keep changes scoped.
- Add or update tests when behavior changes.
- Do not introduce unsupported feature directions.

Expected output:

- Implement the change.
- Run practical verification.
- Summarize files changed, behavior changed, and tests run.
```
