# Profile and Auth

## Purpose

Profile and Auth determine who the user is, whether they can access the app, and whether the system has enough profile data to personalize reference values.

## Philosophy

Authentication should stay invisible once complete. Profile completion should be a small gate that enables personalization, not a large onboarding system.

Profile data is reference data. It should support the daily experience without taking over the Momentum Workspace.

## Canonical Terms

- Authenticated
- Unauthenticated
- Profile Incomplete
- Complete Profile
- User Summary
- Nutrition Reference

## Current Behavior

The backend uses Google OAuth and JWT-based API authentication. The frontend stores `jwt_token` in local storage and sends it as a bearer token.

The app recognizes:

- unauthenticated users
- authenticated users with incomplete profiles
- authenticated users with complete profiles

Protected routes require authentication and completed profile state.

## Boundaries

Profile and Auth must not become:

- a large account management product
- a social identity system
- a settings labyrinth
- a dashboard replacement

## Relationships

- User profile supplies biometric data for macro/reference calculations.
- Auth state gates Dashboard, Tasks, Fitness, and Profile.
- Fitness System uses profile data for nutrition reference.
- Momentum Workspace should not be dominated by profile data.

## Future Direction

Future work may add goal preference, subscription status, or lightweight settings if they directly support daily discipline or product operations.

## AI Guidance

When changing this feature:

- Keep route protection strict.
- Preserve clear handling of `401` and profile-incomplete `403`.
- Keep profile completion minimal.
- Do not expose protected data while redirecting.
- Keep profile reference data out of the primary workspace unless actionable.
