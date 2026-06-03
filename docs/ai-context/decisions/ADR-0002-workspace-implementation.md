# ADR-0002: Study Workspace Implementation

Status: Accepted
Date: 2026-06-01

## Context

Momentum Mosaic requires a "Study Workspace" to act as a focused execution environment for deep learning sessions. The risk with any workspace/note-taking feature is "second-brain bloat"—evolving into a complex wiki, block editor, or generic knowledge graph. This contradicts the app's core philosophy of remaining an execution-oriented Daily Discipline System.

## Decision

The Study Workspace backend MVP has been implemented with a strictly bounded hierarchical model and constrained capabilities:
1. **WorkspaceSection**: Groups workspaces (e.g., "DSA", "System Design").
2. **Workspace**: The actual execution environment.
3. **WorkspaceEntry**: Notes within the workspace. Crucially, the content is strictly plain text (`TEXT` column). There is no rich text, HTML, or markdown parsing supported at the domain level to prevent bloat.
4. **WorkspaceResource**: References/links to external materials to keep the session self-contained.

## Tradeoffs

Gains:
- Prevents feature creep and "Notion-ification".
- Fast, predictable backend queries.
- Clear separation between deep work tasks and the study materials supporting them.
- Forces the user to use the workspace for execution/scratchpad thinking rather than curation.

Costs:
- Users cannot format their notes (no bold, italics, tables, etc.).
- Cannot embed images directly into entries.
- Simple hierarchy might frustrate users wanting nested folders.

## Consequences

The frontend implementation must respect these constraints. The UI should not present a rich text editor. The focus must remain on connecting a `DEEP` focus session to a specific `Workspace`, allowing users to read their plain text notes and resources without friction.

## Related Docs

- `docs/ai-context/features/study-workspace.md`
- `docs/ai-context/04-architecture-domain.md`
