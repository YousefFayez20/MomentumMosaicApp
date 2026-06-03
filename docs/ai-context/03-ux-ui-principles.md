# UX and UI Principles

Momentum Mosaic UI should reduce cognitive load and preserve execution presence. The interface should help the user understand the day, start the next commitment, and stay inside the work.

## Navigation Philosophy

- Primary navigation should reflect core daily surfaces: Momentum Workspace, Tasks, Fitness, Profile.
- The Momentum Workspace is the arrival surface after authentication.
- Avoid adding navigation items for small utilities. Fold them into the relevant existing surface.
- Do not make the user leave the primary surface for frequent daily actions when the action can live naturally there.

## Continuity-Oriented UX

The product should preserve context through the loop:

```text
Plan -> Start Focus -> Work -> Complete -> Continue
```

Rules:

- Starting a Focus Session should feel like entering the task, not opening a disconnected timer.
- Completing a session should return the user to the next useful state.
- Abandoning a session should return the task to planned without moral judgment.
- If notes or workspace content exists, focus UI should not unnecessarily break the user's visual context.

## Focus-State Behavior

- Only one Current Focus should be active.
- Focus Mode should make the active task feel protected.
- Peripheral UI may dim, recede, or become unavailable while focus is active.
- Time feedback should support awareness, not create pressure.
- Completion feedback should be brief, contextual, and earned.

## Layout Philosophy

- Prefer calm density over sparse marketing composition.
- The app is an operational tool, not a landing page.
- Group related execution elements into clear surfaces.
- Avoid nested cards and decorative card stacks.
- Use structure, spacing, and hierarchy to reduce scanning cost.
- Keep the next action visible.

## Low Cognitive Load Rules

- Do not ask the user to categorize more than necessary.
- Do not create parallel places to store the same kind of intention.
- Do not add persistent notes, inboxes, or lists without a clear lifecycle.
- Prefer one strong primary action per surface.
- Use progressive disclosure for secondary information.

## Visual Hierarchy Rules

- Current Focus outranks upcoming tasks.
- Today's execution needs outrank lifetime metrics.
- Streak and momentum signals support the workspace; they should not dominate it.
- Nutrition and biometric values are reference data unless tied to an actionable daily goal.
- Momentum history is useful as context, not as the main action.

## Feedback Tone

Use dignified acknowledgement:

- "Focus block complete."
- "That's your third deep work session today."
- "Momentum building. Keep showing up."

Avoid spectacle:

- exaggerated praise
- patronizing copy
- punishment for missed streaks
- social comparison
- noisy animations that distract from the next action

## Immersion Principles

- Immersion should protect attention, not hide necessary tools.
- Focus visuals should feel calm and serious.
- Motion should be subtle and purposeful.
- Avoid UI that looks like a game reward loop.
- Avoid adding explanatory text inside the app that describes how the app works.

## Mobile Behavior

- The next action must remain obvious on small screens.
- Text must not overlap, truncate awkwardly, or depend on viewport-scaled font sizes.
- Dense surfaces should stack predictably.
- Focus actions must remain reachable without hunting.
