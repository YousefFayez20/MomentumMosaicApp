# Momentum Mosaic — Execution Roadmap (Part 2: Phases 4–5 & Engineering)

> Continuation of the operational blueprint. Covers reflection, intent, premium layer, and cross-cutting engineering concerns.

---

## Phase 4: Reflect & Intend

**Dominant objective:** Close the daily discipline loop with optional reflection (evening) and ephemeral intent (morning). The plan→execute→reflect cycle becomes complete.

**Duration estimate:** 6–8 working days

**Prerequisites:** Phase 3 complete (momentum score exists — reflection snapshots the score, intent displays alongside it).

---

### Milestone 4.1 — Backend: DailyReflection Entity & API

**Purpose:** Create the data model and API for daily reflections. One reflection per user per day, max 280 characters, storing a snapshot of that day's momentum score for future reference.

**User impact:** None yet — backend only.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | New `reflection` package with entity, repository, service, controller. |
| Backend | `DailyReflection` entity: `id (Long)`, `appUser (ManyToOne)`, `date (LocalDate)`, `content (String, max 280)`, `momentumScore (Integer)`, `createdAt (Instant)`. Unique constraint on `(user_id, date)`. |
| Backend | `ReflectionRepository`: `findByAppUserIdAndDate(userId, date)`, `findByAppUserIdAndDateBetween(userId, from, to)`. |
| Backend | `ReflectionService`: `saveReflection(userId, content)` — creates or updates today's reflection, snapshots current momentum score. `getTodayReflection(userId)`. `getReflections(userId, from, to)` — for premium weekly review later. |
| Backend | `ReflectionController`: `POST /api/reflections` (body: `{content}`), `GET /api/reflections/today`. |
| Database | Flyway migration: create `daily_reflection` table with columns and unique constraint. |

**Complexity:** Low-Medium. Standard CRUD module following existing patterns from fitness module. Risk: ensure `@Transactional` on `saveReflection` since it reads momentum score and writes reflection.

**Completion criteria:**
- POST creates/updates today's reflection
- GET returns today's reflection (or 204 if none)
- Content exceeding 280 chars is rejected with 400
- Duplicate POST for same day updates rather than creating a second record
- Momentum score is correctly snapshotted

**Validation:** POST a reflection → GET it back → verify content and momentumScore match. POST again same day → verify update, not duplicate.

---

### Milestone 4.2 — Backend: DailyIntent Entity & API

**Purpose:** Create the data model for ephemeral daily intent. One intent per user per day, max 100 characters. Auto-conceptually expires (yesterday's intent is irrelevant — the system only surfaces today's).

**User impact:** None yet — backend only.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | New `intent` package with entity, repository, service, controller. |
| Backend | `DailyIntent` entity: `id (Long)`, `appUser (ManyToOne)`, `date (LocalDate)`, `content (String, max 100)`, `createdAt (Instant)`. Unique constraint on `(user_id, date)`. |
| Backend | `IntentRepository`: `findByAppUserIdAndDate(userId, date)`. |
| Backend | `IntentService`: `setIntent(userId, content)` — creates or updates today's intent. `getTodayIntent(userId)`. |
| Backend | `IntentController`: `POST /api/intents` (body: `{content}`), `GET /api/intents/today`. |
| Database | Flyway migration: create `daily_intent` table. |

**Complexity:** Low. Simpler than reflection — no score snapshot, no date-range queries needed for free tier.

**Completion criteria:**
- POST creates/updates today's intent
- GET returns today's intent (or 204 if none)
- Content exceeding 100 chars is rejected with 400
- Yesterday's intent is not returned by `/today` endpoint

**Validation:** Set intent → retrieve → verify. Wait until next day (or manually test with different dates) → verify previous intent is not returned.

---

### Milestone 4.3 — Dashboard: Integrate Reflection & Intent

**Purpose:** Surface both elements on the dashboard in a way that feels natural and optional — not as separate features but as parts of the daily rhythm.

**User impact:** The dashboard now supports the full day cycle. Morning: set intent. Daytime: execute tasks. Evening: brief reflection. The system feels alive throughout the day.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | Add `apiClient.setIntent(content)`, `apiClient.getTodayIntent()`, `apiClient.saveReflection(content)`, `apiClient.getTodayReflection()` to `api.ts`. |
| Frontend | **Intent (top of dashboard):** If no intent set for today, show a subtle input: "What's your focus today?" — single line, submit on Enter. Once set, display as a quiet banner above the task list: italic text, muted styling, small "edit" icon. Not editable after first save (design decision — commit to your intent). |
| Frontend | **Reflection (bottom of dashboard):** Conditionally visible. Show when: (a) all tasks are completed, OR (b) it's after 6 PM local time, OR (c) a workout has been logged. Display as an inline card: "Anything to note about today?" with a text area (280 char limit, char counter). Submit button saves. If already submitted, show the reflection text with a subtle ✓. |
| Frontend | Include today's momentum score in the reflection area: "Today's momentum: 78" above the input. |

**Complexity:** Medium. The conditional visibility logic for reflection requires thoughtful implementation. Risk: time-of-day detection must use local time, not server time. Use `new Date().getHours()` on the client.

**Completion criteria:**
- Intent is settable from dashboard, displays throughout the day
- Reflection appears at the right time (tasks done / evening / workout logged)
- Both are optional — skipping either doesn't affect the experience
- Both persist correctly (refresh page → data still there)
- Character limits are enforced in UI and backend

**Validation:** Morning: set intent → verify it appears as banner. Complete tasks throughout day. Evening: verify reflection prompt appears. Submit reflection → refresh → verify persistence.

---

### Milestone 4.4 — Yesterday's Context

**Purpose:** When the user opens the app each morning, briefly show yesterday's reflection and intent as context for the new day. This creates continuity — yesterday's closing thought informs today's opening intention.

**User impact:** The day doesn't start from zero. The user sees: "Yesterday you reflected: 'Productive morning but lost focus after lunch. Need to protect afternoon deep work.' Your momentum was 72."

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | On dashboard load, fetch yesterday's reflection and intent via existing APIs with date parameters (or add `GET /api/reflections/yesterday` and `GET /api/intents/yesterday` convenience endpoints). |
| Frontend | Display as a collapsed/collapsible card above the intent input: "Yesterday" header, shows intent + reflection + score. Collapsed by default — one click to expand. |
| Backend | Add convenience endpoints or use date parameters: `GET /api/reflections?date=2026-05-06`. |

**Complexity:** Low. One additional API call and a collapsible UI element.

**Completion criteria:**
- Yesterday's reflection and intent are visible on dashboard (collapsed by default)
- If no reflection/intent yesterday, the card doesn't appear
- Yesterday's momentum score is shown alongside

**Validation:** Set reflection and intent today → next day, verify yesterday card appears with correct data.

---

### Milestone 4.5 — Phase 4 Integration & Polish

**Purpose:** Ensure the full daily loop flows smoothly and all new elements feel cohesive.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | Write tests for reflection and intent services — CRUD operations, date handling, character limits. |
| Frontend | Review dashboard layout with all elements present: yesterday context + intent banner + tasks + workout + momentum score + reflection prompt. Ensure it doesn't feel crowded — use proper spacing and conditional visibility. |
| Both | Complete walkthrough: Morning (set intent) → Daytime (start task, complete task, log workout) → Evening (write reflection). |

**Completion criteria:**
- Full daily loop works end-to-end
- Dashboard doesn't feel cluttered — elements appear/disappear based on context
- All new APIs have test coverage
- No regressions to Phase 1-3 functionality

---

### Phase 4 — Before/After Summary

| Dimension | Before | After |
|-----------|--------|-------|
| Morning experience | See tasks, start working | Set intent ("Focus on depth today") → see tasks → start |
| Evening experience | Nothing — just close the app | Reflection prompt captures one thought + snapshots the day's score |
| Day continuity | Each day starts from zero | Yesterday's reflection and intent provide context |
| Data generated | Tasks + workout logs | Tasks + workout logs + daily reflections + daily intents |
| Daily loop | Plan → Execute | Plan → Intend → Execute → Reflect (complete cycle) |

---

## Phase 5: Premium Layer

**Dominant objective:** Introduce the first monetization surface — weekly insights derived from accumulated user data. Gate it behind a subscription.

**Duration estimate:** 10–14 working days (largest phase — includes payment integration)

**Prerequisites:** Phase 4 complete (reflections provide data for insights, users have been accumulating history).

> [!IMPORTANT]
> **Do not start this phase until real users have at least 2-3 weeks of data.** Premium insights are meaningless without history. Deploy Phases 1-4, let data accumulate, then build Phase 5.

---

### Milestone 5.1 — Backend: InsightService

**Purpose:** Build the analytics engine that transforms raw data into weekly insight observations. No AI — arithmetic on existing entities with date-range queries.

**User impact:** None yet — computation layer only.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | New `insight` package with service and controller. No entity needed — insights are computed on-the-fly. |
| Backend | `InsightService.getWeeklyInsight(userId, weekStartDate)` returns a `WeeklyInsight` DTO containing: |
| | — `taskCompletionRate`: tasks completed / tasks created this week (%) |
| | — `averageMomentumScore`: mean of daily momentum scores (from snapshots in `DailyReflection.momentumScore`, or computed retrospectively) |
| | — `previousWeekMomentumAvg`: comparison to week before |
| | — `totalDeepMinutes`, `totalShallowMinutes`, `totalFitnessMinutes`: from completed tasks this week |
| | — `deepWorkRatio`: deep minutes / total minutes (%) |
| | — `workoutDaysCount`: from `DailyFitnessLog` entries this week |
| | — `currentStreak`: existing streak value |
| | — `longestStreakThisMonth`: computed from fitness logs |
| | — `estimationAccuracy`: average of `(actualMinutes / durationMinutes)` for completed tasks — shows if user over/under-estimates |
| | — `reflectionCount`: how many days this week had a reflection |
| Backend | Repository queries needed: `TaskRepository.findByAppUserIdAndCompletedAtBetween()`, `DailyFitnessLogRepository.findByAppUserIdAndDateBetween()`, `DailyReflectionRepository.findByAppUserIdAndDateBetween()`. |

**Complexity:** High. Many queries and computations, but each is straightforward arithmetic. Risk: performance — 6-8 queries per insight request. Acceptable for MVP; cache if needed later.

**Completion criteria:**
- `getWeeklyInsight()` returns accurate data for any given week
- All calculations verified against manual counts
- Edge cases handled: weeks with zero tasks, weeks with no workouts, weeks with no reflections

**Validation:** Create known test data for a specific week → call insight endpoint → verify every number matches manual calculation.

---

### Milestone 5.2 — Backend: Premium Gating

**Purpose:** Add subscription status to user model and middleware to gate premium endpoints.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | Add fields to `AppUser`: `boolean premiumActive = false`, `Instant premiumExpiresAt`. |
| Database | Flyway migration: add columns with defaults. |
| Backend | Create `@PremiumRequired` annotation or a `PremiumGuard` (similar to existing `ProfileGuard`) that checks `appUser.isPremiumActive()` and `premiumExpiresAt.isAfter(Instant.now())`. |
| Backend | Apply premium gate to: `GET /api/insights/weekly`, future `GET /api/reflections?from=&to=` (historical range). |
| Backend | Non-premium users hitting gated endpoints receive `403` with body `{"error": "PREMIUM_REQUIRED", "message": "..."}`. |

**Complexity:** Medium. Follow the existing `ProfileGuard` pattern. Risk: ensure the guard checks both `premiumActive` and expiration timestamp.

**Completion criteria:**
- Non-premium user gets 403 on gated endpoints
- Premium user (manually set in DB for testing) gets 200
- Guard correctly checks expiration — expired premium returns 403

**Validation:** Set `premiumActive = true` in DB → access insights → verify 200. Set `premiumExpiresAt` to past → verify 403.

---

### Milestone 5.3 — Frontend: Weekly Insights Page

**Purpose:** Build the premium content page that displays weekly insight data in a meaningful, visually clear format.

**User impact:** Premium users see their patterns for the first time. "I completed 82% of tasks this week, up from 71% last week. My deep work ratio is 55%." This is the moment the subscription feels worth it.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | New `/insights` page — protected by AuthGuard + premium check. |
| Frontend | Display weekly insight sections: (1) **Completion Summary** — task completion rate with week-over-week comparison. (2) **Momentum Trend** — average daily score this week vs last week, with simple visual (bar or spark line — no heavy chart library, use SVG). (3) **Focus Quality** — deep/shallow/fitness minute breakdown with percentages. (4) **Workout Consistency** — X of 7 days, with comparison. (5) **Estimation Accuracy** — "You estimated 8h 30m but completed in 7h 12m — you're getting more accurate." (6) **Streak Status** — current and longest this month. |
| Frontend | Week selector: allow navigating to previous weeks (within data range). |
| Frontend | Non-premium users who navigate here see a preview (blurred or partial data) with upgrade CTA. |
| Frontend | Add "Insights" nav item to `dashboard-layout.tsx` with a subtle premium badge icon. |

**Complexity:** High. Most complex frontend page. Risk: SVG visualizations can be time-consuming — keep them minimal (bars, not charts). Consider a simple table layout as MVP and iterate visually later.

**Completion criteria:**
- All 6 insight sections render with real data
- Week-over-week comparisons show directional arrows (↑↓)
- Week navigation works for historical weeks
- Non-premium view shows upgrade prompt
- Mobile responsive

**Validation:** Accumulate 2 weeks of test data → view insights for each week → verify numbers match manual calculation. Test non-premium view separately.

---

### Milestone 5.4 — Payment Integration

**Purpose:** Connect Stripe (or equivalent) for subscription management. Keep it minimal — a single subscription tier, monthly billing.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | Add Stripe SDK dependency. |
| Backend | `POST /api/subscription/checkout` — creates a Stripe Checkout Session and returns the URL. |
| Backend | Stripe webhook endpoint `POST /api/webhooks/stripe` — handles `checkout.session.completed` (set premium active), `customer.subscription.deleted` (deactivate premium), `invoice.payment_failed` (handle gracefully). |
| Backend | On successful payment: set `premiumActive = true`, `premiumExpiresAt = subscription period end`. |
| Frontend | "Upgrade to Premium" button on insights page (and optionally on profile page) → redirects to Stripe Checkout. |
| Frontend | After payment success, Stripe redirects back to app → refresh user state → premium content accessible. |

**Complexity:** High. Stripe integration has many edge cases (webhook verification, idempotency, failed payments). Risk: test thoroughly in Stripe test mode before production. Start with Stripe Checkout (hosted page) to minimize frontend payment UI work.

**Completion criteria:**
- Complete checkout flow works in Stripe test mode
- Successful payment activates premium
- Webhook correctly processes subscription events
- Cancellation deactivates premium at period end
- No double-charging on page refresh

**Validation:** Full test-mode cycle: click Upgrade → Stripe checkout → test card → redirect back → verify premium access. Cancel → verify access revoked at period end.

---

### Milestone 5.5 — Upgrade Nudge & Phase 5 Integration

**Purpose:** Create the natural upgrade moment for engaged free users, and ensure the complete premium flow is polished.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | After 14+ days of accumulated data, show a subtle card on the dashboard: "You've built 14 days of discipline data. See your patterns →" linking to the insights preview. Show this once, allow dismissal. |
| Frontend | On the insights preview (non-premium), show one real data point (e.g., task completion rate) and blur/lock the rest. Make the value visible enough to create desire. |
| Both | End-to-end testing: new user signup → 14 days of use → nudge appears → clicks through → sees preview → upgrades → full access. |

**Complexity:** Medium. The nudge timing requires tracking days-since-first-activity (derivable from `AppUser.createdAt` or first `Task.createdAt`).

**Completion criteria:**
- Nudge appears after 14+ days of data, not before
- Nudge is dismissible and doesn't return after dismissal
- Preview page shows enough value to motivate upgrade
- Full upgrade flow works end-to-end

---

### Phase 5 — Before/After Summary

| Dimension | Before | After |
|-----------|--------|-------|
| Revenue | $0 | Subscription-ready with Stripe |
| Data value | Accumulated but unsurfaced | Transformed into weekly insights |
| Premium content | Nothing gated | Weekly patterns, trends, estimation accuracy |
| Upgrade path | None | Natural nudge after 14 days → preview → checkout |
| User segmentation | All users identical | Free (daily loop) vs Premium (trajectory + depth) |

---

## Cross-Cutting: Engineering Discipline

These concerns span all phases. Address them incrementally alongside feature work.

### Technical Debt to Address During Execution

| Debt Item | When to Address | Why |
|-----------|----------------|-----|
| **Integrate Flyway** | Before Phase 2 Milestone 2.1 (first schema change) | All phases add migrations. Doing this once early prevents manual SQL forever. |
| **Add SLF4J logging** to services | During Phase 2 (new service methods are being written) | Log execution state transitions — essential for debugging focus sessions. |
| **Fix exception strategy** — replace `IllegalArgumentException` with `BadRequestException` | During Phase 2 (touching TaskService anyway) | Prevents raw 500 errors on validation failures. |
| **Add `@Transactional`** to write methods | During Phase 2 and 4 (new services being created) | New services should have it from day one. Retrofit existing services while nearby. |
| **Remove dead code** (unused JwtAuthenticationFilter, LoginController, CurrentUser, CustomUserDetailsService) | During Phase 1 (cleanup milestone) | Reduces confusion when working on auth-adjacent code. |

### Architectural Guardrails

| Rule | Rationale |
|------|-----------|
| **New modules follow the pattern: entity → repository → service → controller** | Consistency. Reflection and intent modules mirror the fitness module structure. |
| **Controllers never inject repositories** | Prevents the ProfileController anti-pattern from spreading to new code. |
| **One active task per user** (enforced in service, not DB) | Discipline tool identity — you focus on one thing at a time. |
| **No new frontend dependencies for visualization** | SVG/CSS solutions for the momentum gauge and insight charts. Keep `node_modules` lean. |
| **Every new entity gets `createdAt` and `updatedAt`** | Audit trail from day one. No retroactive migrations for timestamps. |

### Overengineering Risks to Avoid

| Temptation | Why to Resist | What to Do Instead |
|-----------|--------------|-------------------|
| Add Redis caching for momentum score | Score is computed from < 50 rows per user. DB is fine at MVP scale. | Add caching only if profiling shows the dashboard endpoint exceeding 200ms. |
| Build a notification system for streaks | Engagement through value, not interruption. Premature. | Users check their own streak — that's discipline. |
| Create an admin dashboard | No users to administrate yet. | Query the DB directly for admin needs. |
| Add WebSocket real-time updates | HTTP refresh-on-action is sufficient for a single-user-at-a-time product. | Use SWR/polling on the frontend if near-real-time is desired. |
| Multi-tier premium (Basic/Pro/Enterprise) | One tier is enough until proven otherwise. | Single premium tier at $4/month. Expand tiers only with data showing demand. |

---

## Cumulative Progress Map

After each phase, this is what the product looks like:

| Capability | After Phase 1 | After Phase 2 | After Phase 3 | After Phase 4 | After Phase 5 |
|-----------|:---:|:---:|:---:|:---:|:---:|
| Today-oriented dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Profile/Settings page | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inline workout logging | ✅ | ✅ | ✅ | ✅ | ✅ |
| Simplified fitness page | ✅ | ✅ | ✅ | ✅ | ✅ |
| Task execution states | — | ✅ | ✅ | ✅ | ✅ |
| Focus sessions with elapsed time | — | ✅ | ✅ | ✅ | ✅ |
| Contextual completion feedback | — | ✅ | ✅ | ✅ | ✅ |
| Actual vs estimated time tracking | — | ✅ | ✅ | ✅ | ✅ |
| Momentum score (daily) | — | — | ✅ | ✅ | ✅ |
| Yesterday comparison | — | — | ✅ | ✅ | ✅ |
| Rest day handling | — | — | ✅ | ✅ | ✅ |
| Daily intent | — | — | — | ✅ | ✅ |
| Daily reflection | — | — | — | ✅ | ✅ |
| Yesterday's context | — | — | — | ✅ | ✅ |
| Complete plan→execute→reflect loop | — | — | — | ✅ | ✅ |
| Weekly insights (premium) | — | — | — | — | ✅ |
| Premium subscription (Stripe) | — | — | — | — | ✅ |
| Upgrade flow with nudge | — | — | — | — | ✅ |

---

## What to Reject During Development

When tempted to add something not in this roadmap, apply this filter:

```
1. Does it help the user execute TODAY?          → Maybe (evaluate)
2. Does it help the user understand TRAJECTORY?  → Phase 5 (premium)
3. Does it help the user organize or store?      → No (wrong product)
4. Does it make the product broader?             → No (identity drift)
5. Does it require a new page/navigation?        → Strong skepticism
6. Is the user asking for it after daily use?    → Listen carefully
7. Am I building it because it's interesting?    → Stop. Ship what's planned.
```

---

## Estimated Total Timeline

| Phase | Duration | Cumulative |
|-------|----------|-----------|
| Phase 1: Dashboard Reorientation | 5–7 days | Week 1 |
| Phase 2: Task Execution States | 7–10 days | Weeks 2–3 |
| Phase 3: Momentum Score | 3–4 days | Week 3–4 |
| Phase 4: Reflect & Intend | 6–8 days | Weeks 4–5 |
| *Pause: Deploy, accumulate user data (2–3 weeks)* | — | Weeks 5–8 |
| Phase 5: Premium Layer | 10–14 days | Weeks 8–10 |

**Total active development: ~5–6 weeks across ~10 calendar weeks.**

The pause between Phase 4 and Phase 5 is deliberate — premium insights require accumulated data to be meaningful. Use the pause to fix remaining technical debt, write tests, and observe how real users interact with the daily loop.
