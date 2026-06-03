# Task System

## Purpose

The Task System captures what the user intends to do and gives each commitment enough shape to support execution: type, duration, planned timing, and lifecycle state.

## Philosophy

Tasks are commitments, not generic reminders. The system should help the user decide, start, and complete work, not collect unlimited future intentions.

Task type is opinionated. Momentum Mosaic distinguishes Deep Focus, Light Focus, and Fitness because different kinds of work have different discipline value.

## Canonical Terms

- Task
- Execution List
- Deep Focus
- Light Focus
- Fitness
- Planned
- In Progress
- Completed
- Next Commitment

## Current Behavior

Tasks have `TaskType` values `DEEP`, `SHALLOW`, and `FITNESS`. They have `TaskStatus` values `PLANNED`, `IN_PROGRESS`, and `COMPLETED`. They include a title, duration, optional planned date, timestamps, completion flag, and actual minutes.

The frontend can create, update, start, complete, abandon, delete, and list tasks.

## Boundaries

The Task System must not become:

- a full project management system
- a kanban board
- a nested project hierarchy
- a second notes/inbox system
- a catch-all database for every idea

Avoid restoring a generic `OTHER` category unless a durable decision explains why.

## Relationships

- Focus System uses task status to create Focus Sessions.
- Momentum Workspace displays the Execution List and Next Commitment.
- Momentum Tracking uses completed minutes, deep minutes, remaining planned minutes, and focus minutes.
- Fitness tasks complement but do not replace workout logging.

## Future Direction

Future direction should improve daily planning, faster task creation, better scheduling by day, and clearer prioritization without expanding into heavyweight project management.

## AI Guidance

When changing this feature:

- Keep task creation fast.
- Keep task types limited and meaningful.
- Do not duplicate tasks with another list concept.
- Protect ownership and lifecycle rules on the backend.
- Update API types and tests when task fields or transitions change.
