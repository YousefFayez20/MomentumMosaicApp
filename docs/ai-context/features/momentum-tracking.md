# Momentum Tracking

## Purpose

Momentum Tracking translates daily execution into a stable rhythm signal. It helps the user understand whether they are building, maintaining, recovering, or losing momentum.

## Philosophy

Momentum should be a compass, not a scoreboard. It should provide context and direction without shaming the user or turning discipline into a game.

The signal exists to support the next day of execution.

## Canonical Terms

- Momentum Tracking
- Momentum Snapshot
- Momentum Summary
- Momentum State
- Momentum Trend
- Rhythm Score
- Rhythm Position
- Workspace Signal

## Current Behavior

The backend calculates daily rhythm using deep work presence, follow-through, workout signal, and intentionality. It stores daily Momentum Snapshots and returns a Momentum Summary with state, display label, trend, rhythm position, and context message.

Current state values:

- `DORMANT`
- `RECOVERING`
- `BUILDING`
- `STEADY`
- `STRONG`
- `LOCKED_IN`
- `COOLING`

Current trend values:

- `RISING`
- `STABLE`
- `FALLING`

## Boundaries

Momentum Tracking must not become:

- a leaderboard
- a punishment system
- a complex quantified-self analytics suite
- a black-box score with no behavioral meaning
- the dominant surface over today's execution

## Relationships

- Task System supplies completed minutes, deep minutes, planned remaining minutes, and actual/focus minutes.
- Fitness System supplies workout signal.
- Momentum Workspace displays the summary as Workspace Signal.
- Future reflection may add qualitative context, but only if it supports execution.

## Future Direction

Momentum can become more meaningful through weekly insight, recovery context, and pattern recognition after enough history exists. Free daily value should remain simple; deeper trajectory analysis can become premium territory later.

## AI Guidance

When changing this feature:

- Keep the state names stable.
- Make score changes explainable.
- Avoid adding metrics that do not change user behavior.
- Avoid shame language for falling or dormant states.
- Test calculator boundaries and trend/state transitions.
