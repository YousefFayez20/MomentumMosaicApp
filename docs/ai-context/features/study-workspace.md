# Study Workspace

## Purpose

The Study Workspace is a focused room for learning work. It gives the user the materials, notes, and session context needed to execute a study block without leaving Momentum Mosaic.

## Philosophy

The Study Workspace is for execution, not curation.

It should feel like a quiet library carrel: a place to sit down, focus, learn, write, and leave a useful trace. It must not become a second brain or knowledge management database.

## Canonical Terms

- Study Workspace
- Subject
- Workspace
- Context Resources
- Study Session
- Study Reflection
- Scratchpad

## Current Behavior

The backend MVP is implemented with a bounded hierarchy: `WorkspaceSection` -> `Workspace` -> `WorkspaceEntry` and `WorkspaceResource`. Notes (`WorkspaceEntry`) are strictly plain text to enforce execution over curation. Users can manage resources to keep sessions self-contained. The frontend is meant to connect these workspaces to DEEP Focus Sessions.

## Boundaries

The Study Workspace must not become:

- Notion
- a knowledge graph
- a block database
- a wiki
- a nested folder system beyond a simple hierarchy
- a rich media gallery
- an everything dashboard

Notes exist to support execution. Resources exist to keep the current session self-contained.

## Relationships

- Task System supplies DEEP study tasks.
- Focus System can launch a Study Session from the workspace.
- Momentum Tracking benefits from completed DEEP work.
- Reflections may capture what the user understood or remains confused about.

## Future Direction

Implemented MVP:

- bounded `WorkspaceSection` -> `Workspace` structure
- strictly plain text `WorkspaceEntry` (notes)
- `WorkspaceResource` (context links)
- connection to DEEP Focus Sessions (planned frontend UI)

Later:

- Study Reflection at session end
- lightweight scratchpad/canvas if it supports thinking without turning into a whiteboard product

## AI Guidance

When changing this feature:

- Optimize for active learning and flow continuity.
- Keep notes constrained.
- Avoid folder/tag/link expansion.
- Do not add graph views or block-editor complexity.
- Keep the focus session visually connected to the study context when possible.
