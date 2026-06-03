# Momentum Workspace

## Purpose

The Momentum Workspace is the primary daily surface. It should answer: "What does today require, and what should I do next?"

## Philosophy

The workspace is not a passive dashboard. It is an execution environment that brings together the current focus, next commitments, completed work, workout status, and momentum signal.

Today matters more than lifetime totals. The user should understand the day within seconds.

## Canonical Terms

- Momentum Workspace
- Current Focus
- Next Commitment
- Execution List
- Workspace Signal
- Momentum History
- Focus Mode

## Current Behavior

The dashboard aggregates task, fitness, and momentum data. It surfaces active/planned tasks, completed tasks for today, focus actions, an optional active Focus Mode overlay, and a Workspace Signal backed by Momentum Summary.

## Boundaries

The Momentum Workspace must not become:

- a passive analytics dashboard
- a profile/reference data page
- a generic project board
- a feed
- a marketing-style home page
- a place for every possible metric

## Relationships

- Task System supplies planned, in-progress, and completed work.
- Focus System controls Current Focus and Focus Mode.
- Fitness System supplies workout status and streak context.
- Momentum Tracking supplies Workspace Signal and Momentum History context.
- Auth/Profile determines whether the user can access the workspace.

## Future Direction

The workspace should continue moving toward present-tense execution: clearer daily planning, stronger next-action hierarchy, better closure after completion, and lightweight reflection when the day or focus session ends.

## AI Guidance

When changing this feature:

- Keep the next action obvious.
- Prefer today's commitments over historical totals.
- Do not add large static stats without a daily action reason.
- Keep support signals secondary to execution.
- Preserve the "one active commitment" model.
