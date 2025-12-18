# Momentum Mosaic - System Documentation & API Contract

This document serves as the single source of truth for the Momentum Mosaic application, defining the architecture, API contracts, authentication flows, and frontend-backend integration standards.

## 1. System Architecture

The application follows a standard **Client-Server** architecture:

*   **Frontend**: Next.js (React) application.
    *   **Responsibility**: UI rendering, client-side routing, optimistic UI updates.
    *   **State Management**: React Context (`AuthContext`) for global user state.
*   **Backend**: Java/Spring Boot (implied by `JSESSIONID` and 8080 port).
    *   **Responsibility**: Business logic, data persistence, authentication provider.
    *   **API Style**: RESTful JSON API.
    *   **Spec**: OpenAPI 3.0.3.

---

## 2. Authentication & Authorization Contract

Authentication is **Session-Based** using standard HTTP Cookies.

### 2.1 Core Mechanism
*   **Credential Storage**: `JSESSIONID` HttpOnly cookie.
*   **Transport**: All API requests **MUST** include `credentials: "include"` to pass the session cookie.
*   **CORS**: Backend must accept requests from the frontend origin (e.g., `http://localhost:3000`) and allow credentials.

### 2.2 Auth States & Transitions

The system defines three distinct user states based on API responses:

| State | Condition | API Response (`/api/auth/me`) | Frontend Action |
| :--- | :--- | :--- | :--- |
| **Unauthenticated** | No valid session | `401 Unauthorized` | Redirect to **Login** (`/login`) |
| **Profile Incomplete** | Valid session, missing details | `403 Forbidden` <br> `error: "PROFILE_NOT_COMPLETED"` | Redirect to **Complete Profile** (`/complete-profile`) |
| **Authenticated** | Valid session, profile complete | `200 OK` <br> `{ "profileCompleted": true }` | Allow access to **Dashboard** (`/dashboard`) |

### 2.3 User Object Contract
**Standardization Note**: The backend exposes `id`, while some frontend interfaces historically used `userId`. The standard contract is `id`.

```typescript
interface User {
  id: number;               // Primary Key
  email: string;            // Unique identifier
  name: string;             // Display name
  profileCompleted: boolean; // Authorization gate flag
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
*   **Description**: Validates the current session and retrieves user context.
*   **Success (200)**: Returns `User` object.
*   **Failure (401)**: User is not logged in.
*   **Failure (403)**: User is logged in but `profileCompleted` is false.

### 3.2 Profile
**Base Path**: `/api/profile`

#### `PUT /api/profile/complete`
*   **Description**: Updates user biometrics to complete the onboard flow.
*   **Body**:
    ```json
    {
      "gender": "MALE" | "FEMALE",
      "heightCm": 180,
      "weightKg": 75
    }
    ```
*   **Effect**: Sets `profileCompleted: true` on the backend user entity.

### 3.3 Dashboard
**Base Path**: `/api/dashboard`

#### `GET /api/dashboard/{userId}`
*   **Description**: Aggregates all summary data for the landing page.
*   **Response**:
    ```json
    {
      "userSummary": { "caloriesMaintenance": 2500, ... },
      "taskSummary": { "activeTasks": [], "totalDeepMinutes": 120, ... },
      "fitnessSummary": { "didWorkoutToday": true, "workoutStreak": 5, ... }
    }
    ```

### 3.4 Tasks
**Base Path**: `/api/tasks`

#### Data Models
**TaskType Enums**: `DEEP`, `SHALLOW`, `FITNESS`

#### `GET /api/tasks/{userId}`
*   **Description**: List all tasks (history and active).

#### `POST /api/tasks/{userId}`
*   **Description**: Create a new task.
*   **Body**:
    ```json
    {
      "title": "Study Systems Design",
      "taskType": "DEEP",
      "durationMinutes": 60
    }
    ```

#### `PUT /api/tasks/{userId}/{taskId}`
*   **Description**: Update task details.

#### `PUT /api/tasks/{userId}/{taskId}/complete`
*   **Description**: Mark a task as completed.

### 3.5 Fitness
**Base Path**: `/api/fitness`

#### `POST /api/fitness/{userId}/workout`
*   **Description**: Log a boolean workout status for today.
*   **Body**: `{ "didWorkout": true }`

---

## 4. Frontend Implementation Guidelines

### 4.1 Global State (`AuthContext`)
*   **Initialization**: Must call `GET /api/auth/me` on mount.
*   **Handling 401**: Catch `401` silently, set `user = null`, do **not** set global error state (this is a valid "guest" state).
*   **Handling 403**: Catch `403` silently if `error === "PROFILE_NOT_COMPLETED"`. This is a valid "partial auth" state.

### 4.2 Route Protection (`AuthGuard`)
*   **Logic**:
    *   Wrap protected routes (e.g., `/dashboard`, `/fitness`) in `<AuthGuard>`.
    *   If `user` is null -> `router.replace("/login")`.
    *   If `user` exists but `!profileCompleted` -> `router.replace("/complete-profile")`.
*   **Strict Mode**: The app must **never** render the dashboard children if the user user state doesn't fully satisfy the requirements. Return `null` while redirecting.

### 4.3 API Client (`lib/api.ts`)
*   **Singleton**: Use a singleton instance or static methods.
*   **Credentials**: Always ensure `credentials: "include"` is set for fetch requests.
*   **Standardization**: Ensure the client normalizes naming discrepancies (e.g. mapping backend `id` to frontend `userId` if strictly necessary, otherwise prefer `id` everywhere).
