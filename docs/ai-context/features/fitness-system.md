# Fitness System

## Purpose

The Fitness System captures physical discipline as a daily signal. It supports workout logging, streak continuity, and profile-based nutrition reference values.

## Philosophy

Fitness is part of daily momentum. The workout signal should be simple, frequent, and emotionally meaningful.

The streak is the product's strongest retention primitive, but it must remain supportive rather than punitive.

## Canonical Terms

- Fitness
- Workout Log
- Workout Streak
- Daily Workout Status
- Fitness Summary
- Nutrition Reference

## Current Behavior

The backend tracks whether the user worked out on a given day and exposes today's status, total workout days, streak, and macro/reference calculations. The dashboard and fitness page can display workout status and allow logging.

Profile biometrics support nutrition reference values such as calories and protein range.

## Boundaries

The Fitness System must not become:

- a full workout programming app
- a calorie tracker
- a nutrition diary
- a body transformation platform
- a second dashboard full of duplicated metrics

Nutrition values should remain reference data unless the product adds a clear, actionable nutrition workflow.

## Relationships

- Profile/Auth supplies biometric data.
- Momentum Tracking uses workout status as a rhythm signal.
- Momentum Workspace may expose daily workout logging because it is a frequent action.
- Fitness tasks can represent physical commitments, but workout logging remains the daily check-in signal.

## Future Direction

Future improvements may clarify streak milestones, improve daily workout logging, and connect fitness completion more clearly to momentum. Nutrition should only expand when goal selection and logging become real workflows.

## AI Guidance

When changing this feature:

- Keep daily logging simple.
- Do not duplicate dashboard content unnecessarily on the fitness page.
- Keep streak feedback neutral after missed days.
- Treat nutrition as reference unless making it actionable.
- Avoid adding full workout or food tracking without a deliberate product decision.
