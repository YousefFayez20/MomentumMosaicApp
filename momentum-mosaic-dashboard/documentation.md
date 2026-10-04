# Momentum Mosaic - System Documentation & API Contract

This document serves as the single source of truth for the Momentum Mosaic frontend application, defining the architecture, API contracts, authentication flows, and integration standards with the Spring Boot backend.

---

## 1. System Architecture

The application follows a decoupled **Client-Server** architecture:

* **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Radix UI primitives.
  * **Port**: `3000` (development)
  * **Responsibility**: UI rendering, client-side routing, optimistic UI updates, focus timer synchronization, Deep Writing distraction-free canvas.
  * **State Management**: React Context (`AuthContext`) for global user identity and route security.
* **Backend**: Java 21, Spring Boot 4.0 on port `8080`.
  * **Responsibility**: Domain business logic, data persistence (MySQL 8.4), JWT generation, Jsoup web scraping.
  * **API Style**: RESTful JSON API.

---

## 2. Authentication & Authorization Contract

Authentication is **JWT-based** using a bearer token stored on the client after Google OAuth login.

### 2.1 Core Mechanism
* **Credential Storage**: `jwt_token` stored in browser `localStorage`.
* **Transport**: Frontend requests attach `Authorization: Bearer <token>` when a token is present in `localStorage`.
* **OAuth Entry Point**: The login screen redirects the user to `/oauth2/authorization/google` on the backend (`http://localhost:8080`).
* **OAuth Callback**: Backend redirects to `${app.frontend.url}/auth/callback?token=<JWT>`, where the frontend extracts and stores the token before navigating to `/dashboard`.

### 2.2 Auth States & Transitions

The frontend handles three distinct states based on `/api/auth/me`:

| State | Condition | API Response (`/api/auth/me`) | Frontend Action |
|---|---|---|---|
| **Unauthenticated** | No token or invalid/expired token | `401 Unauthorized` | Redirect to **Login** (`/login`) |
| **Profile Incomplete** | Valid token, biometrics missing | `403 Forbidden` (`PROFILE_NOT_COMPLETED`) | Redirect to **Complete Profile** (`/complete-profile`) |
| **Authenticated** | Valid token, profile complete | `200 OK` with user payload | Grant access to **Dashboard** (`/dashboard`) |

### 2.3 User Object Contract

```typescript
export interface User {
  userId: number
  email: string
  name?: string
  role?: string
  profileCompleted: boolean
}
```

---

## 3. Comprehensive API Contract

### 3.1 Authentication & Profile
- `GET /api/auth/me` -> Validates token and returns `User`.
- `PUT /api/profile/complete` -> Updates user biometrics:
  ```json
  {
    "gender": "MALE" | "FEMALE",
    "heightCm": 180,
    "weightKg": 75
  }
  ```

### 3.2 Dashboard Aggregation
- `GET /api/dashboard` -> Aggregates daily summaries:
  ```json
  {
    "userSummary": { "caloriesMaintenance": 2500, "caloriesCut": 2000, "caloriesBulk": 2800, "proteinMin": 120, "proteinMax": 165, "bmi": 23.1 },
    "taskSummary": { "activeTasks": [...], "completedTasks": [...] },
    "fitnessSummary": { "didWorkoutToday": true, "workoutStreak": 5, "totalWorkouts": 42 },
    "momentumSummary": { "score": 82, "state": "PEAK", "trend": "RISING" }
  }
  ```

### 3.3 Tasks & Focus Engine
- `GET /api/tasks/active` -> Returns tasks with status `PLANNED` or `IN_PROGRESS`.
- `GET /api/tasks/completed` -> Returns tasks with status `COMPLETED`.
- `POST /api/tasks` -> Create a new task:
  ```json
  {
    "title": "Build study workspace",
    "taskType": "DEEP" | "SHALLOW" | "FITNESS",
    "durationMinutes": 60,
    "plannedForDate": "2026-10-04",
    "workspaceId": 12
  }
  ```
- `PUT /api/tasks/{taskId}` -> Update task details.
- `DELETE /api/tasks/{taskId}` -> Delete task.
- `PUT /api/tasks/{taskId}/start` -> Start focus session (sets `status = IN_PROGRESS`, records `startedAt`).
- `PUT /api/tasks/{taskId}/complete` -> Finish session (sets `status = COMPLETED`, computes `actualMinutes`).
- `PUT /api/tasks/{taskId}/abandon` -> Reset session back to `PLANNED`.
- `PUT /api/tasks/{taskId}/workspace/{workspaceId}` -> Associate task with a study workspace.
- `DELETE /api/tasks/{taskId}/workspace` -> Disassociate task from study workspace.

### 3.4 Physical Discipline (Fitness)
- `POST /api/fitness/workout` -> Log workout: `{ "didWorkout": true }`.
- `GET /api/fitness/today` -> Fetch today's workout log.
- `GET /api/fitness/streak` -> Fetch current workout streak count.
- `GET /api/fitness/total-days` -> Fetch lifetime workout day count.
- `GET /api/fitness/macros` -> Fetch nutritional reference values.

### 3.5 Study Workspaces
- `GET /api/workspaces` -> List all user workspaces (`List<WorkspaceSummaryResponse>`).
- `GET /api/workspaces/recent` -> List recently active workspaces.
- `GET /api/workspaces/{workspaceId}` -> Full workspace details including entries and resources.
- `POST /api/workspaces` -> Create workspace: `{ "title": "System Design", "sectionId": 1 }`.
- `PUT /api/workspaces/{workspaceId}` -> Update workspace title or move to new section.
- `DELETE /api/workspaces/{workspaceId}` -> Delete workspace and cascade entries/resources.
- `POST /api/workspaces/sections` -> Create section: `{ "name": "Computer Science" }`.
- `GET /api/workspaces/sections` -> List sections.
- `PUT /api/workspaces/sections/{sectionId}` -> Rename section.
- `DELETE /api/workspaces/sections/{sectionId}` -> Delete section.
- `POST /api/workspaces/{workspaceId}/entries` -> Add note block: `{ "content": "Raft leader election", "entryType": "BULLET" | "TOGGLE", "parentEntryId": null }`.
- `PUT /api/workspaces/{workspaceId}/entries/{entryId}` -> Update entry content or toggle state (`isExpanded`).
- `DELETE /api/workspaces/{workspaceId}/entries/{entryId}` -> Delete entry.
- `PUT /api/workspaces/{workspaceId}/entries/reorder` -> Reorder entries batch.
- `POST /api/workspaces/{workspaceId}/resources` -> Add URL resource (backend scrapes page title using Jsoup).
- `DELETE /api/workspaces/{workspaceId}/resources/{resourceId}` -> Remove resource.
- `GET /api/workspaces/{workspaceId}/focus-summary` -> Fetch linked tasks and total logged focus minutes.

---

## 4. Frontend Guidelines & UI Surfaces

### 4.1 Route Guarding (`AuthGuard`)
Wrap all authenticated pages (`/dashboard`, `/tasks`, `/fitness`, `/profile`, `/workspace/*`) in `<AuthGuard>`. It guarantees that no protected markup mounts before token validation completes.

### 4.2 API Client (`lib/api.ts`)
The `apiClient` singleton handles:
- Attaching the Bearer token from `localStorage`.
- Parsing unified error formats.
- Triggering auth state updates on 401/403 responses.

### 4.3 Deep Writing & Immersive Focus Canvas
- Located at `/components/workspace/workspace-page.tsx`.
- Activated via the Deep Writing toggle or shortcut.
- Renders an auto-hiding topbar, a calming teal ambient glow, and an anchored focus timer with direct task completion controls.
