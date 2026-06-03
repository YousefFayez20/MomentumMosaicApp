# Stable Terminology

This document prevents naming drift across AI sessions and implementation work.

Use these names consistently in product docs, prompts, UI planning, and code discussions. Code may still use existing enum/API names where already established.

## Canonical Product Terms

| Term | Meaning | Notes |
| --- | --- | --- |
| Momentum Mosaic | Product name | Always use full name in formal docs. |
| Daily Discipline System | Product category | Preferred positioning, not "productivity dashboard." |
| Momentum Workspace | The primary today-oriented dashboard/workspace | Preferred product term for the dashboard experience. |
| Execution List | The ordered set of planned/open tasks for today | Use instead of generic "to-do list" when discussing product intent. |
| Focus Mode | The immersive active-session UI | Existing UI/component term. |
| Focus Session | A task actively being executed | Tied to `TaskStatus.IN_PROGRESS`. |
| Current Focus | The one task currently in progress | Only one should exist per user. |
| Next Commitment | The next planned task surfaced for action | Used in the dashboard UI. |
| Workspace Signal | Compact momentum/support signal in the workspace | Existing UI label. |
| Momentum State | Qualitative state derived from momentum | See `MomentumState`. |
| Momentum Trend | Direction of recent momentum | See `MomentumTrend`. |
| Deep Focus | User-facing label for `TaskType.DEEP` | High-value protected work. |
| Light Focus | User-facing label for `TaskType.SHALLOW` | Smaller operational work. |
| Fitness | User-facing label for `TaskType.FITNESS` | Physical discipline signal. |
| Study Workspace | Execution-centered study surface | Not a knowledge base. |
| Workspace Section | Category grouping for Study Workspaces | E.g., "DSA", "System Design". |
| Workspace Entry | Plain text note within a Study Workspace | Restricted to plain text to enforce execution focus. |
| Context Resources | Session-support material for a workspace | Resources that help execution, not an archive. |

## Code Terms That Must Stay Stable

| Code Term | Values |
| --- | --- |
| `TaskType` | `DEEP`, `SHALLOW`, `FITNESS` |
| `TaskStatus` | `PLANNED`, `IN_PROGRESS`, `COMPLETED` |
| `MomentumState` | `DORMANT`, `RECOVERING`, `BUILDING`, `STEADY`, `STRONG`, `LOCKED_IN`, `COOLING` |
| `MomentumTrend` | `RISING`, `STABLE`, `FALLING` |

## Preferred Replacements

| Avoid | Prefer | Reason |
| --- | --- | --- |
| Productivity app | Daily Discipline System | More opinionated and accurate. |
| Dashboard | Momentum Workspace | Keeps the primary surface action-oriented. |
| To-do list | Execution List | Tasks are commitments, not just items. |
| Timer | Focus Session or Focus Mode | The timer is only part of execution. |
| Pomodoro | Focus Session | Momentum Mosaic is not a rigid interval method. |
| Celebration | Completion acknowledgement | Keeps tone dignified. |
| Shallow task | Light Focus | Better user-facing tone. |
| Notes database | Study Workspace notes | Prevents second-brain drift. |
| Knowledge management | Context Resources or Study Workspace | Avoids Notion-style expansion. |

## Forbidden Drift

Do not introduce new names for existing concepts unless a durable decision updates this file.

Avoid:

- "Project Workspace" for Momentum Workspace
- "Habit Score" for Momentum State or Momentum Summary
- "Task Board" for Execution List
- "Sprint" for Focus Session
- "Knowledge Base" for Study Workspace
- "Reward System" for completion feedback

## Naming Rule For New Features

Name new concepts by the behavior they support, not by generic software category.

Good:

- Daily Intention
- Focus Session Reflection
- Recovery Signal

Risky:

- Notes
- Inbox
- Projects
- Boards
- Goals Hub
- Analytics Center
