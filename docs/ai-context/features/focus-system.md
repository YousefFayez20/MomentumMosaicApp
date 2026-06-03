# Focus System

## Purpose

The Focus System turns tasks into active commitments. It supports the transition from planning to execution by letting the user start, hold, complete, or abandon a Focus Session.

## Philosophy

Focus is not just a timer. It is execution presence.

The user declared a commitment with a task and duration. Focus Mode protects that commitment and gives the user a clear way to complete or return from it.

## Canonical Terms

- Focus System
- Focus Mode
- Focus Session
- Current Focus
- One active commitment
- Complete Session
- Abandon Session

## Current Behavior

Tasks move through `PLANNED -> IN_PROGRESS -> COMPLETED`. Starting a task creates the active session state. Completing records completion and actual minutes when possible. Abandoning returns an in-progress task to planned.

The frontend presents Focus Mode as an immersive overlay with elapsed time, progress against estimated duration, completion, and abandon confirmation.

## Boundaries

The Focus System must not become:

- a rigid Pomodoro method
- a multi-task timer
- a surveillance system
- a punitive accountability tool
- a noisy reward loop

## Relationships

- Task System owns the task and duration.
- Momentum Workspace launches and displays the Current Focus.
- Momentum Tracking uses completed work and focus minutes as signals.
- Study Workspace may launch DEEP work sessions in a context-preserving way.

## Future Direction

Future improvements may add end-of-session reflection, better inline focus behavior for study workspaces, and more contextual completion acknowledgement.

## AI Guidance

When changing this feature:

- Preserve one active `IN_PROGRESS` task per user.
- Treat duration as a commitment, not a rigid alarm.
- Keep abandon neutral and reversible to planned.
- Keep completion feedback dignified and brief.
- Do not introduce Pomodoro language unless explicitly decided.
