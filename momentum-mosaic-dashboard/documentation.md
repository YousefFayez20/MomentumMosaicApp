# Momentum Mosaic - System Documentation & API Contract

This document serves as the single source of truth for the Momentum Mosaic application, defining the architecture, API contracts, authentication flows, and frontend-backend integration standards.

## 1. System Architecture

The application follows a standard **Client-Server** architecture:

* **Frontend**: Next.js (React) application.
  * **Responsibility**: UI rendering, client-side routing, optimistic UI updates.
  * **State Management**: React Context (`AuthContext`) for global user state.
* **Backend**: Java/Spring Boot application on port `8080`.
  * **Responsibility**: Business logic, data persistence, authentication provider.
  * **API Style**: RESTful JSON API.
  * **Spec**: OpenAPI 3.0.3.

---

## 2. Authentication & Authorization Contract

Authentication is **JWT-based** using a bearer token stored on the client after OAuth login.

### 2.1 Core Mechanism
* **Credential Storage**: `jwt_token` in browser `localStorage`.
* **Transport**: Frontend requests attach `Authorization: Bearer <token>` when a token is present.
* **OAuth Entry Point**: The login screen redirects to `/oauth2/authorization/google` on the backend.
* **CORS**: Backend must accept requests from the frontend origin (for example `http://localhost:3000`) and allow the `Authorization` header.

### 2.2 Auth States & Transitions

The system defines three distinct user states based on API responses:

| State | Condition | API Response (`/api/auth/me`) | Frontend Action |
| :--- | :--- | :--- | :--- |
| **Unauthenticated** | No valid token | `401 Unauthorized` | Redirect to **Login** (`/login`) |
| **Profile Incomplete** | Valid token, missing details | `403 Forbidden` with `error: "PROFILE_NOT_COMPLETED"` | Redirect to **Complete Profile** (`/complete-profile`) |
| **Authenticated** | Valid token, profile complete | `200 OK` with user payload | Allow access to **Dashboard** (`/dashboard`) |

### 2.3 User Object Contract

The current frontend contract expects `userId`.

```typescript
interface User {
  userId: number
  email: string
  name: string
  profileCompleted: boolean
}
```

### 2.4 Error Handling Standard

All API endpoints follow a standard error response format:

```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "status": 401,
  "error": "Unauthorized",
  "message": "Full authentication is required to access this resource",
  "path": "/api/auth/me"
}
```

---

## 3. API Reference

### 3.1 Authentication
**Base Path**: `/api/auth`

#### `GET /api/auth/me`
* **Description**: Validates the current token and retrieves user context.
* **Success (200)**: Returns `User`.
* **Failure (401)**: User is not logged in.
* **Failure (403)**: User is logged in but `profileCompleted` is false.

### 3.2 Profile
**Base Path**: `/api/profile`

#### `PUT /api/profile/complete`
* **Description**: Updates user biometrics to complete the onboard flow.
* **Body**:
  ```json
  {
    "gender": "MALE" | "FEMALE",
    "heightCm": 180,
    "weightKg": 75
  }
  ```
* **Effect**: Sets `profileCompleted: true` on the backend user entity.

### 3.3 Dashboard
**Base Path**: `/api/dashboard`

#### `GET /api/dashboard`
* **Description**: Aggregates all summary data for the landing page for the authenticated principal.
* **Response**:
  ```json
  {
    "userSummary": { "caloriesMaintenance": 2500 },
    "taskSummary": { "activeTasks": [], "completedTasks": [] },
    "fitnessSummary": { "didWorkoutToday": true, "workoutStreak": 5 }
  }
  ```

### 3.4 Tasks
**Base Path**: `/api/tasks`

#### Data Models
**TaskType Enums**: `DEEP`, `SHALLOW`, `FITNESS`

#### `GET /api/tasks/active`
* **Description**: Lists all active tasks for the authenticated principal.

#### `GET /api/tasks/completed`
* **Description**: Lists all completed tasks for the authenticated principal.

#### `POST /api/tasks`
* **Description**: Create a new task.
* **Body**:
  ```json
  {
    "title": "Study Systems Design",
    "taskType": "DEEP",
    "durationMinutes": 60
  }
  ```

#### `PUT /api/tasks/{taskId}`
* **Description**: Update task details.

#### `PUT /api/tasks/{taskId}/complete`
* **Description**: Mark a task as completed.

#### `DELETE /api/tasks/{taskId}`
* **Description**: Remove a task.

### 3.5 Fitness
**Base Path**: `/api/fitness`

#### `POST /api/fitness/workout`
* **Description**: Log a boolean workout status for today for the authenticated principal.
* **Body**:
  ```json
  {
    "didWorkout": true
  }
  ```

#### `GET /api/fitness/today`
* **Description**: Fetch today's workout status.

#### `GET /api/fitness/streak`
* **Description**: Fetch the current workout streak.

#### `GET /api/fitness/total-days`
* **Description**: Fetch the lifetime number of workout days.

#### `GET /api/fitness/macros`
* **Description**: Fetch nutrition reference values for the authenticated principal.

---

## 4. Frontend Implementation Guidelines

### 4.1 Global State (`AuthContext`)
* **Initialization**: Call `GET /api/auth/me` when protected routes need user context.
* **Handling 401**: Catch `401` silently, set `user = null`, and redirect through route guards as needed.
* **Handling 403**: Catch `403` and redirect to `/complete-profile` when `error === "PROFILE_NOT_COMPLETED"`.

### 4.2 Route Protection (`AuthGuard`)
* **Logic**:
  * Wrap protected routes such as `/dashboard`, `/tasks`, `/fitness`, and `/profile` in `<AuthGuard>`.
  * If `user` is `null`, redirect to `/login`.
  * If `user` exists but `!profileCompleted`, redirect to `/complete-profile`.
* **Strict Mode**: The app must not render protected children while redirecting.

### 4.3 API Client (`lib/api.ts`)
* **Singleton**: Use a singleton instance or static methods.
* **Authorization**: Read `jwt_token` from `localStorage` and send it as a bearer token when present.
* **Standardization**: The current frontend expects `userId` in the `/api/auth/me` response.
