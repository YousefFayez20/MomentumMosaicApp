# Momentum Mosaic — Execution Roadmap (Part 1: Phases 1–3)

> Operational blueprint for solo developer execution. Each phase produces visible product improvement.

---

## Phase 1: Dashboard Reorientation

**Dominant objective:** Make the dashboard answer "What does today require?" instead of "Here are your lifetime stats."

**Duration estimate:** 5–7 working days

**Prerequisites:** None — this phase touches only frontend restructuring and one minor backend adjustment.

---

### Milestone 1.1 — Create Profile/Settings Page

**Purpose:** Extract static reference data (height, weight, BMI, nutrition targets) from the dashboard into a dedicated page. This clears the dashboard for today-focused content and creates a natural home for future user preferences (notification settings, subscription status, goal selection).

**User impact:** The dashboard feels lighter. Reference data is still accessible but no longer competes with daily action. Users who want to check their protein targets navigate to their profile — a natural mental model.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | New `/profile` page using existing `UserSummary` data from `apiClient.getMacros()`. Display height, weight, BMI (computed), protein range, calorie targets (cut/maintain/bulk). |
| Frontend | Add "Profile" nav item to `dashboard-layout.tsx` navigation array (after Fitness). Use `User` icon from lucide. |
| Backend | No changes. `GET /api/fitness/macros` and `GET /api/auth/me` already provide all needed data. |
| Database | No changes. |

**Complexity:** Low. New page consuming existing endpoints. No architectural risk.

**Completion criteria:**
- `/profile` page renders with all current nutrition and physical data
- Navigation includes Profile link
- Page is protected by `AuthGuard`
- All data matches what was previously shown on dashboard

**Validation:** Open dashboard — physical profile card and nutrition targets card should be absent. Open profile — all data present and accurate.

---

### Milestone 1.2 — Restructure Dashboard Primary View

**Purpose:** Replace the current 4-stat-card header and 2-column layout with a today-oriented structure. Today's tasks and today's workout status become the primary content.

**User impact:** First impression shifts from "here's a report" to "here's your day." Users immediately see what they need to do and whether they've worked out.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | Restructure `dashboard/page.tsx`. Remove the Physical Profile card, Nutrition Targets card, Total Workouts stat card, and Total Focus stat card. |
| Frontend | Promote the "Recent Active Tasks" section to primary position — show ALL active tasks (not just 3), grouped by `taskType`: DEEP first, then SHALLOW, then FITNESS. Each shows title, duration, and a "Mark Complete" action. |
| Frontend | Keep the workout status card but move it to sit alongside today's tasks (not buried in the right column). |
| Frontend | Keep streak stat card — it's daily-relevant. Replace the removed stat cards with: today's completed count ("3 of 5 done") and today's focus time ("2h 15m completed"). |
| Backend | No changes. `DashboardResponse` already contains `activeTasks` and `fitnessSummary`. |

**Complexity:** Medium. Significant JSX restructuring but no logic changes. Risk: visual regression — test on mobile breakpoints.

**Completion criteria:**
- Dashboard shows all active tasks grouped by type
- Workout status is visible without scrolling
- Streak is visible
- No nutrition or physical profile data on dashboard
- Mobile layout works (single column stack)

**Validation:** Side-by-side comparison with previous dashboard. New version should answer "What do I need to do today?" within 2 seconds of loading.

---

### Milestone 1.3 — Inline Workout Logging on Dashboard

**Purpose:** Remove the need to navigate to `/fitness` just to log a workout. The most frequent daily action should be available on the primary surface.

**User impact:** Logging a workout is a one-tap action from the dashboard. Users no longer context-switch between pages for their core daily routine.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | Add a workout toggle/button directly in the dashboard workout status card. When `didWorkoutToday` is false, show "Log Workout" button. When true, show ✓ with option to undo. |
| Frontend | Call `apiClient.markWorkout(true/false)` on click, then refresh dashboard data. |
| Backend | No changes. `POST /api/fitness/workout` already exists. |

**Complexity:** Low. Single button wiring to existing endpoint.

**Completion criteria:**
- User can log workout from dashboard without navigating away
- Dashboard refreshes streak and workout status after logging
- Toast feedback confirms the action

**Validation:** Complete the full daily check-in (review tasks + log workout) without ever leaving the dashboard.

---

### Milestone 1.4 — Simplify Fitness Page

**Purpose:** The fitness page currently duplicates 80% of the dashboard. Reduce it to its unique value: workout logging with streak context and milestone tracking.

**User impact:** Fitness page feels purposeful rather than redundant. Users who navigate to it find focused workout tools, not a second dashboard.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | Remove the Nutrition Targets section from `fitness/page.tsx` (now lives on Profile page). |
| Frontend | Remove the "Workout Frequency" card (redundant with streak). |
| Frontend | Keep: streak display, today's status, workout log buttons, streak milestone tracker (7/14/30 day targets), motivational message (condensed to one line). |

**Complexity:** Low. Deletion and cleanup.

**Completion criteria:**
- Fitness page contains only workout-related content
- No nutrition data on fitness page
- Page loads noticeably faster (fewer API calls — remove `apiClient.getMacros()`)

**Validation:** Fitness page should feel like a "workout check-in" tool, not a dashboard clone.

---

### Milestone 1.5 — Remove OTHER Task Type

**Purpose:** The `OTHER` category undermines the product's opinion that time is either deep work, shallow work, or fitness. Removing it forces intentional classification.

**User impact:** Task creation is simpler (3 choices, not 4). Every task now carries meaning in the focus distribution.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | Database migration: `UPDATE task SET task_type = 'SHALLOW' WHERE task_type = 'OTHER'` |
| Backend | Remove `OTHER` from `TaskType` enum. |
| Backend | Update any validation that references OTHER. |
| Frontend | Remove OTHER from task type selectors in `create-task-dialog.tsx` and `edit-task-dialog.tsx`. |

**Complexity:** Low, but requires migration discipline. Use Flyway migration script if Flyway is integrated, otherwise a manual SQL migration before deploy.

**Completion criteria:**
- No OTHER tasks exist in database
- Task creation dialog shows only DEEP, SHALLOW, FITNESS
- Existing tasks previously tagged OTHER now show as SHALLOW
- No backend enum parsing errors

**Validation:** Create tasks of each type. Verify focus distribution on dashboard shows only three categories.

---

### Milestone 1.6 — Phase 1 Integration & Polish

**Purpose:** Ensure the restructured experience is coherent, responsive, and free of regressions.

**User impact:** The product feels intentionally designed, not partially redesigned.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | Review all pages for consistent spacing, card styles, and typography after changes. |
| Frontend | Verify mobile responsiveness of new dashboard layout. |
| Frontend | Update any stale console.log debug statements. |
| Testing | Manual walkthrough: Login → Dashboard → Log workout → Complete task → View fitness → View profile → Logout. |

**Complexity:** Low. Polish pass.

**Completion criteria:**
- Complete user flow works without errors
- No broken links or missing data
- Mobile layout is usable
- No console errors in production build

**Validation:** Deploy to staging. Walk through the complete flow as a real user would on their first day.

---

### Phase 1 — Before/After Summary

| Dimension | Before | After |
|-----------|--------|-------|
| Dashboard first impression | Lifetime stats + physical profile + nutrition | Today's tasks + workout status + streak |
| Workout logging | Requires navigating to /fitness | Available directly on dashboard |
| Nutrition/profile data | On dashboard (noisy) | On dedicated profile page (organized) |
| Fitness page | Dashboard clone with a button | Focused workout tool |
| Task types | 4 choices (DEEP, SHALLOW, FITNESS, OTHER) | 3 intentional choices |
| Time to daily action | ~15 seconds (scroll past stats) | ~3 seconds (tasks are first) |

---

## Phase 2: Task Execution States

**Dominant objective:** Transform tasks from checkboxes into focus commitments with start → in-progress → complete transitions.

**Duration estimate:** 7–10 working days

**Prerequisites:** Phase 1 complete (dashboard shows tasks as primary content).

---

### Milestone 2.1 — Backend: TaskStatus Enum & Entity Changes

**Purpose:** Replace the binary `completed` boolean with a three-state lifecycle: `PLANNED → IN_PROGRESS → COMPLETED`. This is the foundational data model change that enables execution support.

**User impact:** None yet — backend-only change. Frontend continues working through backward-compatible API.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | Create `TaskStatus` enum: `PLANNED, IN_PROGRESS, COMPLETED` |
| Backend | Add fields to `Task.java`: `@Enumerated(EnumType.STRING) TaskStatus status = TaskStatus.PLANNED`, `Instant startedAt`, `Integer actualMinutes` |
| Database | Flyway migration: (1) Add `status VARCHAR(20) DEFAULT 'PLANNED'`, `started_at TIMESTAMP NULL`, `actual_minutes INT NULL` columns. (2) `UPDATE task SET status = 'COMPLETED' WHERE completed = true`. (3) `UPDATE task SET status = 'PLANNED' WHERE completed = false`. |
| Backend | Update `TaskRepository` queries: replace `findByAppUserIdAndCompletedFalse` with `findByAppUserIdAndStatusNot(TaskStatus.COMPLETED)`, add `findByAppUserIdAndStatus(TaskStatus.IN_PROGRESS)`. |
| Backend | Keep `completed` field as derived: add `@PrePersist/@PreUpdate` method that sets `completed = (status == COMPLETED)`. This maintains backward compatibility until all consumers migrate. |

**Complexity:** Medium. Migration must be correct — test against a copy of production data. Risk: index on `(user_id, completed)` should be supplemented with index on `(user_id, status)`.

**Completion criteria:**
- All existing tasks have correct `status` values after migration
- Existing API endpoints return the same data as before (backward compatible)
- New `status` field appears in `TaskResponse` DTO
- `completed` field continues to work correctly

**Validation:** Run existing tests. Query database to verify migration correctness: `SELECT status, completed, COUNT(*) FROM task GROUP BY status, completed` — no mismatches.

---

### Milestone 2.2 — Backend: Start & Complete Transitions

**Purpose:** Create the API surface for task execution lifecycle. The user will be able to signal "I'm starting this now" and "I'm done," with the system recording actual time spent.

**User impact:** None yet — API exists but frontend doesn't use it.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | `PUT /api/tasks/{id}/start` — Sets `status = IN_PROGRESS`, records `startedAt = Instant.now()`. Validates: task must be PLANNED, task must belong to authenticated user. Only one task can be IN_PROGRESS at a time per user (enforced in service layer). |
| Backend | Update `PUT /api/tasks/{id}/complete` — If task is IN_PROGRESS, calculates `actualMinutes = Duration.between(startedAt, now).toMinutes()`. Sets `status = COMPLETED`, `completedAt = now`. If task is PLANNED (direct complete without starting), sets `actualMinutes = null`. |
| Backend | `PUT /api/tasks/{id}/abandon` — Returns IN_PROGRESS task to PLANNED. Clears `startedAt`. For when users start but need to stop. |
| Backend | Add to `TaskResponse` DTO: `status`, `startedAt`, `actualMinutes` fields. |

**Complexity:** Medium. Business rules around single-active-task constraint need careful implementation. Risk: concurrent requests could create race conditions — use `@Transactional` with optimistic locking or a simple service-level check.

**Completion criteria:**
- Start → Complete flow works via API (test with curl/Postman)
- Abandon flow works
- Starting a second task when one is in-progress returns 409 Conflict
- `actualMinutes` is correctly calculated
- Existing "complete without starting" flow still works

**Validation:** Write integration test: create task → start → wait 2 seconds → complete → verify `actualMinutes >= 0` and `status == COMPLETED`.

---

### Milestone 2.3 — Frontend: Task Card Execution States

**Purpose:** Surface the execution lifecycle in the UI. Task cards should reflect their current state and offer state-appropriate actions.

**User impact:** This is the pivotal UX change. Users see "Start" instead of only "Mark Complete." Clicking Start creates a visible commitment. The product shifts from checklist to discipline tool.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | Update `TaskResponse` type in `api.ts` to include `status`, `startedAt`, `actualMinutes`. |
| Frontend | Add `apiClient.startTask(taskId)` and `apiClient.abandonTask(taskId)` methods. |
| Frontend | On tasks page: PLANNED tasks show "Start" button (primary) and "Mark Complete" button (secondary/ghost). IN_PROGRESS task shows a focus card with elapsed time, "Complete" button, and "Abandon" option. |
| Frontend | On dashboard: active tasks grouped by status — IN_PROGRESS task (if any) shown prominently at top. PLANNED tasks listed below. |
| Frontend | Single-active enforcement in UI: disable "Start" on other tasks when one is IN_PROGRESS. |

**Complexity:** Medium-High. Most significant frontend work in the roadmap. Risk: elapsed time display requires a `setInterval` timer — ensure cleanup on unmount.

**Completion criteria:**
- PLANNED tasks show Start action
- Starting a task transitions it visually to IN_PROGRESS state
- IN_PROGRESS task shows elapsed time ticking
- Completing from IN_PROGRESS shows actual vs estimated time
- Abandoning returns to PLANNED state
- Only one task can be in-progress at a time (UI enforces this)

**Validation:** Complete a full focus session: Start a 30-min deep work task → let timer run for a few minutes → Complete → verify actual time is displayed and task moves to completed state.

---

### Milestone 2.4 — Contextual Completion Feedback

**Purpose:** Replace the generic "Task marked as complete!" toast with meaningful, contextual feedback that acknowledges the effort.

**User impact:** Completing a task *feels like something*. The system responds with awareness, not just confirmation.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | After completing a task from IN_PROGRESS state, show feedback that includes: task type, actual time, and comparison to estimate. Examples: "Deep work: 47 min (estimated 60)" or "Shallow task complete — 12 min." |
| Frontend | For streak-relevant completions, add context: "That's your 3rd deep work session today." (count from completed tasks today with type DEEP). |
| Backend | Add `dailyCompletedCount` by type to dashboard response, or compute on frontend from task list. Frontend computation is simpler and avoids a backend change. |

**Complexity:** Low. String interpolation and simple counting.

**Completion criteria:**
- Completion feedback includes task type and actual duration
- Feedback differs between "completed from IN_PROGRESS" (shows actual vs estimated) and "completed directly" (shows only type)
- Feedback tone is brief and coach-like, not celebratory

**Validation:** Complete 3 deep work tasks in a row. Third completion should note the count.

---

### Milestone 2.5 — Phase 2 Integration & Testing

**Purpose:** Ensure the execution state system works reliably end-to-end and doesn't regress existing functionality.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | Write unit tests for `TaskService.startTask()`, `completeTask()`, `abandonTask()` — cover happy path, single-active constraint, and edge cases (completing an already-completed task). |
| Backend | Write integration test for full lifecycle: create → start → complete, create → start → abandon → start → complete. |
| Frontend | Manual test: create task → start → complete from dashboard. Create task → start → abandon → start → complete from tasks page. |
| Both | Verify dashboard data refreshes correctly after each state transition. |

**Completion criteria:**
- All new tests pass
- Existing tests still pass (backward compatibility)
- No console errors during state transitions
- Dashboard and tasks page both reflect state changes immediately

---

### Phase 2 — Before/After Summary

| Dimension | Before | After |
|-----------|--------|-------|
| Task interaction | Create → Mark Complete | Create → Start → Execute → Complete |
| System presence during work | Absent | Active — shows elapsed time, holds focus space |
| Completion feedback | "Task marked as complete!" | "Deep work: 47 min / 60 min estimated" |
| Time tracking | Estimated only (`durationMinutes`) | Estimated + actual (`actualMinutes`) |
| Discipline signal | Binary (done/not done) | Graduated (planned → committed → executed) |

---

## Phase 3: Momentum Score

**Dominant objective:** Give users a single daily discipline signal that composites task completion, workout consistency, and work quality.

**Duration estimate:** 3–4 working days

**Prerequisites:** Phase 2 complete (tasks have execution states and actual time tracking).

---

### Milestone 3.1 — Backend: Score Computation

**Purpose:** Implement the momentum score as a computed value in the dashboard service. The score gives users one number to care about instead of mentally assembling streak + tasks + workout.

**User impact:** None yet — backend computation only.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | Add `computeMomentumScore(Long userId)` method to `DashboardServiceImpl`. |
| Backend | Score formula (0–100): **(a)** Task completion: `(completedToday / plannedToday) * 50` — if no tasks planned, this component is 50 (no penalty for rest days). **(b)** Workout: `didWorkoutToday ? 25 : 0`. **(c)** Deep ratio: `(deepMinutesCompleted / totalMinutesCompleted) * 25` — if no minutes, this is 0. |
| Backend | Add `int momentumScore` and `int yesterdayMomentumScore` to `DashboardResponse`. |
| Backend | Yesterday's score requires querying tasks completed yesterday and yesterday's fitness log. Add date-range queries to `TaskRepository`: `findByAppUserIdAndStatusAndCompletedAtBetween(userId, COMPLETED, startOfDay, endOfDay)`. |

**Complexity:** Medium. The score formula is simple arithmetic. The date-range queries require care with timezone handling — use the server's default zone consistently, document the assumption.

**Completion criteria:**
- Score computation returns a value between 0 and 100
- Score correctly accounts for: no tasks planned (50/100 baseline), workout logged (+25), deep work ratio (+0-25)
- Yesterday's score is computed from historical data
- Dashboard endpoint returns both scores

**Validation:** Test scenarios: (1) No tasks, no workout → score = 50. (2) All tasks done + workout + all deep → score = 100. (3) Half tasks done + workout + no deep → score = 50. Verify each.

---

### Milestone 3.2 — Frontend: Score Display

**Purpose:** Surface the momentum score as the primary "how am I doing?" indicator on the dashboard.

**User impact:** Users get a single, glanceable answer to "how is my day going?" — the number they'll want to keep high.

**Technical scope:**

| Layer | Work |
|-------|------|
| Frontend | Add momentum score display to dashboard — prominent but not overwhelming. A circular or arc gauge showing 0–100, with color coding: 0–40 (muted), 41–70 (warm), 71–100 (strong/primary). |
| Frontend | Show yesterday's score as comparison: "Yesterday: 78" below today's score. |
| Frontend | Update `DashboardResponse` type in `api.ts`. |

**Complexity:** Low-Medium. The gauge visualization is the main UI work. Use a simple SVG arc or CSS `conic-gradient` — avoid adding a charting library for one component.

**Completion criteria:**
- Score is visible on dashboard above the fold
- Color changes based on score range
- Yesterday comparison is shown
- Score updates in real-time when tasks are completed or workout is logged (after dashboard data refresh)

**Validation:** Start the day (score low) → complete tasks and log workout → verify score increases visibly with each action.

---

### Milestone 3.3 — Score Edge Cases & Rest Day Handling

**Purpose:** Ensure the score doesn't punish users on intentional rest days. The score should measure discipline *relative to intent*, not absolute output.

**User impact:** Users don't feel anxious about the score on days they chose to rest. The system respects rest as part of discipline.

**Technical scope:**

| Layer | Work |
|-------|------|
| Backend | If user has zero planned tasks for today and no workout logged, score should display as "Rest Day" (null/special value) instead of a low number. |
| Frontend | When score is null/rest-day, show "Rest Day" badge instead of a number. No color coding — neutral presentation. |
| Backend | Edge case: user plans 1 task, deletes it, has nothing → recalculate as rest day. |

**Complexity:** Low. Conditional logic in score computation.

**Completion criteria:**
- Days with no planned tasks and no workout show "Rest Day"
- Days with planned tasks always show a numeric score
- Deleting all tasks mid-day correctly transitions to rest day state

**Validation:** Log in on a day with no tasks → verify "Rest Day" shows. Create a task → score appears. Delete the task → "Rest Day" returns.

---

### Milestone 3.4 — Phase 3 Integration

**Purpose:** Verify the score integrates naturally with the existing dashboard flow.

**Technical scope:**

| Layer | Work |
|-------|------|
| Both | Verify score updates after: completing a task, starting/abandoning a task, logging a workout, creating/deleting a task. |
| Frontend | Ensure score position doesn't disrupt the today-oriented layout from Phase 1. |
| Backend | Add unit tests for score computation with various scenarios. |

**Completion criteria:**
- Score is responsive to all user actions
- No layout regressions
- Score formula is tested with at least 5 distinct scenarios

---

### Phase 3 — Before/After Summary

| Dimension | Before | After |
|-----------|--------|-------|
| Daily progress signal | Multiple scattered metrics (streak, task count, focus hours) | Single composite score (0–100) |
| Comparison to previous day | Not available | Yesterday's score shown for context |
| Rest day handling | Low metrics feel like failure | "Rest Day" — no judgment |
| Retention mechanic | Workout streak only | Streak + momentum score (daily engagement reason) |
