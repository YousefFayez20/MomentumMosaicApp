# MomentumMosaicApp — Deep Technical Audit

> **Project**: MomentumMosaicApp — Personal Fitness & Task Tracking Backend
> **Stack**: Spring Boot 4.0, Java 21, MySQL 8.4, OAuth2 (Google), JWT, Docker
> **Architecture**: Monolith
> **Status**: Mid-development / MVP

---

## SECTION 1 — CODE QUALITY REVIEW

### 1.1 Folder Structure

The package layout follows a **feature-based** organization ([user](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/DtoMapper.java#24-33), [task](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/DtoMapper.java#14-24), `fitness`, `dashboard`, [security](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/SecurityConfig.java#27-64), `utility`) which is a good choice. However, there are structural problems:

| Issue | Severity | Details |
|-------|----------|---------|
| **`controller` is a cross-cutting package** | 🟠 Medium | All controllers live in a flat `controller` package instead of being co-located with their feature. For example, [FitnessController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/FitnessController.java#16-47) should be in `fitness/`, not `controller/`. |
| **`DashboardResponsePackage` naming** | 🟡 Low | This sub-package uses PascalCase (`DashboardResponsePackage`) instead of lowercase. Java convention mandates all-lowercase package names (e.g., `dashboard.dto`). |
| **`utility` is a dumping ground** | 🟠 Medium | [DtoMapper](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/DtoMapper.java#12-40), [ApiError](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/ApiError.java#11-22), and all exceptions live together. The mapper should live closer to where it's used, or be split per-feature. |

**Recommendation**: Adopt a strict feature-slice structure:
```
user/
  UserController.java
  AppUser.java
  AppUserRepository.java
  AppUserService.java
  AppUserServiceImpl.java
  dto/
fitness/
  FitnessController.java
  ...
```

### 1.2 Naming Convention Violations

> [!CAUTION]
> **[appUserService](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/appUserService.java#3-10) and [appUserServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/appUserServiceImpl.java#11-54) violate Java naming conventions.** Interfaces and classes MUST start with an uppercase letter. This will confuse every developer who touches this code.

```diff
-public interface appUserService {
+public interface AppUserService {

-public class appUserServiceImpl implements appUserService {
+public class AppUserServiceImpl implements AppUserService {
```

Other naming issues:
- [getUserOrThrow](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#84-87) is duplicated across [FitnessServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImpl.java#16-94), [TaskServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#15-96), and [DashboardServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#20-83) — three identical private methods.
- [toTaskItem](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#72-82) in [DashboardServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#20-83) should use the [DtoMapper](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/DtoMapper.java#12-40) or a dedicated converter.
- [safePath](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/exception/GlobalExceptionHandler.java#100-103) is fine for internal use, but the method could be a utility.

### 1.3 Layer Violations

> [!WARNING]
> **[ProfileController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/ProfileController.java#21-73) directly injects [AppUserRepository](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/AppUserRepository.java#7-11)**, completely bypassing the service layer. This is a serious architecture violation — controllers should never talk to repositories directly.

```java
// ProfileController.java — BAD
private final AppUserRepository appUserRepository;
```

This should go through an `AppUserService.completeProfile(...)` method.

**Similarly**, [OAuth2LoginSuccessHandler](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/OAuth2LoginSuccessHandler.java#23-76) directly uses [AppUserRepository](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/AppUserRepository.java#7-11) for user creation/lookup. This should use the service layer.

### 1.4 Duplicate Business Logic

The **calorie/macro calculation** is duplicated identically in two places:

| Location | Lines |
|----------|-------|
| [FitnessServiceImpl.java](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImpl.java#L73-L91) | [getUserSummary()](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImpl.java#73-92) |
| [DashboardServiceImpl.java](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#L32-L46) | [getDashboard()](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#29-69) |

Both contain:
```java
double proteinMin = appUser.getWeightKg()*1.6;
double proteinMax = appUser.getWeightKg()*2.2;
int maintenance = appUser.getWeightKg()*33;
int cut = maintenance-300;
int bulk = maintenance+300;
```

**Fix**: Extract to a single `NutritionCalculator` utility or have [DashboardServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#20-83) call `fitnessService.getUserSummary(userId)`.

### 1.5 Inconsistent Exception Strategy

Three different exception approaches are used:
1. Custom exceptions ([BadRequestException](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/exception/BadRequestException.java#3-8), [ResourceNotFoundException](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/exception/ResourceNotFoundException.java#4-13)) → handled by [GlobalExceptionHandler](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/exception/GlobalExceptionHandler.java#17-104)
2. Spring's `ResponseStatusException` → thrown in `appUserServiceImpl.getByEmail()` and [AuthController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/AuthController.java#14-33)
3. Java's `IllegalArgumentException` → thrown in `TaskServiceImpl.updateTask()`

**Fix**: Use custom exceptions exclusively. `IllegalArgumentException` bypasses your [GlobalExceptionHandler](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/exception/GlobalExceptionHandler.java#17-104) mapping and returns a raw 500 error.

### 1.6 Validation Duplication

Validation happens **both** in DTOs (via `@Valid` annotations) and **again** inside service methods:

```java
// CreateUserRequest.java — DTO validation
@Positive(message = "Height must be positive")
private Integer heightCm;

// appUserServiceImpl.java — duplicated validation
if(heightCm <= 0) throw new BadRequestException("Height must be Positive");
```

**Fix**: Trust `@Valid` at the controller layer. Remove manual validation from services, or if you need service-layer validation for non-controller callers, keep it only there and remove DTO annotations.

### 1.7 NullPointerException Risks

> [!CAUTION]
> In `appUserServiceImpl.createUser()`, both `heightCm` and `weightKg` are `Integer` (nullable). The check `heightCm <= 0` will throw `NullPointerException` if `heightCm` is `null` due to unboxing.

Same issue in [updateUser()](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/appUserService.java#6-7) and `TaskServiceImpl.validateTaskDuration()` (parameter is `int` but the DTO field is `Integer`).

### 1.8 Unused Variables

```java
// TaskServiceImpl.java line 67
AppUser appUser = getUserOrThrow(userId); // 'appUser' is never used
return taskRepository.findByAppUserIdAndCompletedFalse(userId);

// Same pattern on line 73
AppUser appUser = getUserOrThrow(userId); // never used
```

The call is only for validation (user exists), but assigning to unused variables is misleading. Use [getUserOrThrow(userId);](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#84-87) without assignment.

### 1.9 Missing Logging

**Zero logging anywhere in the codebase.** No SLF4J logger in any service, controller, filter, or exception handler. This makes debugging in production impossible.

**Fix**: Add structured logging at minimum in:
- [GlobalExceptionHandler](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/exception/GlobalExceptionHandler.java#17-104) (log every handled exception)
- Security filters (log authentication failures)
- Service methods (log domain events)

### 1.10 Missing `@Transactional`

No service method uses `@Transactional`. The [completeProfile](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/ProfileController.java#27-70) flow in [ProfileController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/ProfileController.java#21-73) reads, modifies, and saves — this should be atomic. Same for [markWorkoutToday](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/test/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImplTest.java#31-50) which calls [getOrCreateTodayLog](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImpl.java#63-73) then saves again.

---

## SECTION 2 — DATABASE DESIGN REVIEW

### 2.1 Schema Analysis

| Entity | Table | Issues |
|--------|-------|--------|
| [AppUser](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/AppUser.java#13-60) | `app_user` | No index on `email` column (relies on unique constraint acting as index – OK for MySQL InnoDB, but explicit index is better practice) |
| [DailyFitnessLog](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/DailyFitnessLog.java#14-42) | `daily_fitness_log` | Good: composite unique constraint on [(user_id, date)](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/AuthController.java#17-32) |
| [Task](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/Task.java#14-50) | [task](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/DtoMapper.java#14-24) | Missing index on `user_id + completed` (heavily queried combo) |

### 2.2 Missing Indexes

> [!IMPORTANT]
> `TaskRepository.findByAppUserIdAndCompletedFalse()` and [findByAppUserIdAndCompletedTrue()](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskRepository.java#9-10) are called on **every dashboard load**. Without a composite index on [(user_id, completed)](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/AuthController.java#17-32), this becomes a full table scan as task count grows.

```sql
CREATE INDEX idx_task_user_completed ON task (user_id, completed);
CREATE INDEX idx_fitness_log_user_date ON daily_fitness_log (user_id, date);
```

### 2.3 `ddl-auto: update` in Production

> [!CAUTION]
> Both [application.properties](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/resources/application.properties) and [application-docker.yml](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/resources/application-docker.yml) use `spring.jpa.hibernate.ddl-auto=update`. This is **dangerous in production** — it can lead to data loss if column types change. Use **Flyway** or **Liquibase** for schema migrations.

### 2.4 Missing Audit Columns

The [Task](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/Task.java#14-50) entity has `createdAt` and `updatedAt` (good), but [DailyFitnessLog](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/DailyFitnessLog.java#14-42) only has `createdAt`, and [AppUser](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/AppUser.java#13-60) only has `createdAt`. All entities should have `updatedAt` for debugging and compliance.

### 2.5 Data Types

- `heightCm` and `weightKg` are `Integer` (nullable in [AppUser](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/AppUser.java#13-60)). After profile completion these should never be null, but no DB-level constraint enforces this. Consider making them `NOT NULL` with a default, or using a separate `UserProfile` table.
- Calorie values are stored nowhere — they're calculated on-the-fly. This is fine for now but consider materializing them if they become expensive.

### 2.6 No Soft Delete

Tasks are hard-deleted via `taskRepository.delete(task)`. In a production fitness app, you'd want soft deletes (an `isDeleted` flag) for data recovery and analytics.

### 2.7 Caching Opportunities

| Data | Strategy |
|------|----------|
| User summary / macros | Cache for 1h (weight rarely changes) |
| Today's fitness log | Cache until EOD with TTL |
| Workout streak | Cache and invalidate on new log |
| Active/completed task counts | Cache with write-through invalidation |

**Verdict**: Redis is not critical at MVP scale but should be added before 100+ concurrent users to avoid redundant DB hits on the dashboard endpoint.

---

## SECTION 3 — SYSTEM DESIGN REVIEW

### 3.1 IDOR (Insecure Direct Object Reference) — CRITICAL

> [!CAUTION]
> **This is the most critical security bug in the system.** Every API endpoint takes `{userId}` as a path variable, but **none verify that the authenticated user matches the requested userId**. Any authenticated user can access, modify, or delete ANY other user's tasks, fitness logs, and dashboard data simply by changing the userId in the URL.

Examples:
- `GET /api/dashboard/42` — view anyone's dashboard
- `POST /api/fitness/42/workout` — log workouts for anyone
- `DELETE /api/tasks/42/7` — delete anyone's task
- `GET /api/tasks/active/42` — view anyone's tasks

**Fix**: Extract userId from the authenticated [Authentication](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtAuthenticationFilter.java#18-67) principal instead of accepting it from the URL:

```java
@GetMapping("/dashboard")
public DashboardResponse getDashboard(Authentication auth) {
    Long userId = ((AppUserPrincipal) auth.getPrincipal()).getUserId();
    return dashboardService.getDashboard(userId);
}
```

### 3.2 API Design Issues

| Issue | Current | Should Be |
|-------|---------|-----------|
| Create user endpoint path | `POST /api/users/create` | `POST /api/users` (REST convention) |
| Task active/completed | `GET /api/tasks/active/{userId}` | `GET /api/tasks?status=active` (filter param) |
| Two controllers on same path | [AuthController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/AuthController.java#14-33) + [LoginController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/LoginController.java#13-26) both map to `/api/auth` | Merge into one or split paths |
| No pagination | [getActiveTasks](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/TaskController.java#51-57) / [getCompletedTasks](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#71-76) return unbounded `List<>` | Add `Pageable` parameter |
| Inconsistent path structure | Tasks: `/{userId}/{taskId}` vs `active/{userId}` | Standardize |
| No API versioning | `/api/...` | `/api/v1/...` |

### 3.3 Missing CORS Configuration for Production

```java
config.setAllowedOrigins(List.of("http://localhost:3000"));
```

This is hardcoded. In production, this should come from configuration properties.

### 3.4 Hardcoded Redirect URL

```java
response.sendRedirect("http://localhost:3000/auth/callback");
```

In [OAuth2LoginSuccessHandler](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/OAuth2LoginSuccessHandler.java#23-76), the redirect URL is hardcoded. This breaks in any non-localhost deployment.

### 3.5 Stateless vs Stateful Design Conflict

The app uses **both** session-based auth (OAuth2 + HTTP sessions) and JWT-based auth ([JwtAuthenticationFilter](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtAuthenticationFilter.java#18-67)), but:
- [JwtAuthenticationFilter](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtAuthenticationFilter.java#18-67) is **never registered** in the `SecurityFilterChain` — it's a dead component
- Sessions are stored in-memory (no Redis/JDBC session store), preventing horizontal scaling
- `SessionCreationPolicy.IF_REQUIRED` creates sessions but there's no session persistence

**Fix**: Pick one strategy. For a SPA frontend, stateless JWT is cleaner. For OAuth2, use a session store (Spring Session + Redis) for scalability.

### 3.6 Dependency Flow

```
Controller → Service → Repository → DB
    ↕              ↕
  DtoMapper    AppUserRepository (repeated across services)
```

[AppUserRepository](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/AppUserRepository.java#7-11) is injected directly into [FitnessServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImpl.java#16-94), [TaskServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#15-96), and [DashboardServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#20-83). These services should use `AppUserService.getUser()` instead, which would centralize user validation logic.

---

## SECTION 4 — PERFORMANCE OPTIMIZATION

### 4.1 Streak Calculation — O(n) Full Table Scan

> [!WARNING]
> [getWorkoutStreak()](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/test/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImplTest.java#65-79) loads **ALL** fitness logs for a user into memory, sorts them in Java, then iterates. For a user with 2 years of daily logs (730 rows), this is wasteful.

```java
List<DailyFitnessLog> dailyFitnessLogs = fitnessLogRepository.findByAppUserId(userId);
dailyFitnessLogs.sort(Comparator.comparing(DailyFitnessLog::getDate).reversed());
```

**Fix**: Use a database query with `ORDER BY date DESC` and stream/limit results:
```java
@Query("SELECT d FROM DailyFitnessLog d WHERE d.appUser.id = :userId ORDER BY d.date DESC")
List<DailyFitnessLog> findByAppUserIdOrderByDateDesc(@Param("userId") Long userId);
```

Or even better, use a native SQL window function to compute the streak in the database.

### 4.2 Total Workout Days — O(n) Instead of COUNT

```java
return (int) logs.stream().filter(DailyFitnessLog::isDidWorkout).count();
```

This loads all rows into memory just to count them.

**Fix**: Use a repository `COUNT` query:
```java
@Query("SELECT COUNT(d) FROM DailyFitnessLog d WHERE d.appUser.id = :userId AND d.didWorkout = true")
int countWorkoutDays(@Param("userId") Long userId);
```

### 4.3 Dashboard — N+1 Potential & Multiple DB Calls

`DashboardServiceImpl.getDashboard()` makes **at least 5 separate database calls**:
1. [getUserOrThrow(userId)](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#84-87) — 1 query
2. [findByAppUserIdAndCompletedFalse(userId)](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskRepository.java#8-9) — 1 query
3. [findByAppUserIdAndCompletedTrue(userId)](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskRepository.java#9-10) — 1 query
4. `fitnessService.getTodayLog(userId)` → calls [getUserOrThrow](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#84-87) again + 1 query
5. `fitnessService.getTotalWorkoutDays(userId)` → calls [getUserOrThrow](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#84-87) again + fetches all logs
6. `fitnessService.getWorkoutStreak(userId)` → fetches all logs again

That's **minimum 8 queries + 2 full table loads** for a single dashboard request! The user validation alone happens 4 times.

**Fix**:
- Pass the [AppUser](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/AppUser.java#13-60) object to fitness service methods instead of `userId`
- Combine task queries into a single query
- Use `COUNT` queries instead of loading logs

### 4.4 ProfileCompletionFilter — DB Query on Every Request

[ProfileCompletionFilter](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/ProfileCompletionFilter.java#16-62) calls `appUserRepository.findByEmail(email)` on **every authenticated request**. This adds a database roundtrip to every API call.

**Fix**: Store `profileCompleted` in the JWT claims or cache it in the session/principal object (you already have `AppUserPrincipal.isProfileCompleted()` — use [ProfileGuard](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/ProfileGuard.java#11-27) + `@PreAuthorize` which you already do, and remove this redundant filter entirely).

### 4.5 Missing Connection Pool Tuning (Local Profile)

[application.properties](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/resources/application.properties) has no HikariCP configuration. The Docker profile has `maximum-pool-size: 10` but the local profile uses defaults. Add connection pool settings for both profiles.

---

## SECTION 5 — SECURITY REVIEW

### 5.1 Hardcoded JWT Secret — CRITICAL

> [!CAUTION]
> The JWT signing key is **hardcoded as a string literal** in source code and committed to version control:
> ```java
> private static final String SECRET_KEY =
>     "MY_SUPER_SECRET_KEY_MY_SUPER_SECRET_KEY_123456";
> ```
> Any contributor or attacker with repo access can forge JWT tokens for any user.

**Fix**: Move to environment variable (`${JWT_SECRET}`) and use at least a 256-bit random key.

### 5.2 OAuth2 Client Secret in Source Control — CRITICAL

> [!CAUTION]
> [application.properties](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/resources/application.properties) contains the **Google OAuth2 client secret** in plain text:
> ```
> spring.security.oauth2.client.registration.google.client-secret = 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
> ```
> This secret should be **rotated immediately** and moved to environment variables.

### 5.3 Database Password in Source Control

```properties
spring.datasource.password=123456789
```

Hardcoded in [application.properties](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/resources/application.properties). Use environment variables or Spring Cloud Config.

### 5.4 [.env](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/.env) File in Repository

The [.env](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/.env) file contains DB credentials and is likely committed to Git. Add [.env](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/.env) to [.gitignore](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/.gitignore).

### 5.5 CSRF Disabled

```java
.csrf(csrf -> csrf.disable())
```

CSRF is disabled globally. If the app uses session cookies (which it does), this opens the door to CSRF attacks. For a pure SPA + API architecture, CSRF can be disabled safely only if cookies are `SameSite=Strict`. Otherwise, implement CSRF token exchange.

### 5.6 Missing `@Max` Validation

[CompleteProfileRequest](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/dto/CompleteProfileRequest.java#7-12) validates `@Min(50)` for height but no `@Max`. A user could set height to `999999`, which would produce absurd calorie calculations. Add upper bounds.

### 5.7 No Rate Limiting

No rate limiting on any endpoint. The workout and task creation endpoints could be abused.

### 5.8 Exception Messages Leak Internals

The catch-all handler returns `ex.getMessage()` for all [Exception](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/exception/GlobalExceptionHandler.java#87-99) types:
```java
@ExceptionHandler(Exception.class)
public ApiError handleException(Exception ex, ...) {
    return new ApiError(..., ex.getMessage(), ...);
}
```

This can leak stack traces, SQL queries, or internal paths to attackers. Return a generic message for unhandled exceptions.

### 5.9 Missing Security Headers

No security headers configured (X-Content-Type-Options, X-Frame-Options, Content-Security-Policy, Strict-Transport-Security).

---

## SECTION 6 — FEATURE DESIGN REVIEW

### 6.1 Missing Features

| Feature | Value | Difficulty |
|---------|-------|------------|
| **Goal setting** (daily/weekly targets) | High — core to productivity tracking | Medium |
| **Workout types** (cardio, strength, flexibility) | High — boolean is too simplistic | Low |
| **Weight/progress tracking over time** | High — show graphs/trends | Medium |
| **Task categories / labels** | Medium — better organization | Low |
| **Recurring tasks** (daily habits) | High — habit tracking is the core value prop | Medium |
| **Notifications / reminders** | High — engagement driver | High |
| **Weekly/monthly reports** | Medium — user motivation | Medium |
| **Social / accountability** | Medium — competitive edge | High |
| **Data export** (CSV/PDF) | Low — nice to have | Low |

### 6.2 Features That Could Be Redesigned

- **Workout tracking** is binary (`didWorkout: boolean`). Add workout type, duration, intensity, and exercises.
- **Calorie calculation** uses a naive formula (`weight * 33`). Use the Mifflin-St Jeor equation which accounts for age, height, and activity level.
- **Task types** are limited to `DEEP`, `SHALLOW`, `FITNESS`, `OTHER`. Consider making this extensible (user-defined categories).

### 6.3 Unnecessary Features

- [LoginController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/LoginController.java#13-26) and [AuthController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/AuthController.java#14-33) overlap — both map to `/api/auth`. `LoginController.loginSuccess()` is likely dead code since [OAuth2LoginSuccessHandler](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/OAuth2LoginSuccessHandler.java#23-76) redirects.
- [JwtAuthenticationFilter](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtAuthenticationFilter.java#18-67) and [JwtService](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtService.java#15-62) are fully implemented but **never registered** in the security filter chain. They're dead code.
- [CurrentUser](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/CurrentUser.java#8-29) (UserDetails implementation) is used in [CustomUserDetailsService](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/CustomUserDetailsService.java#11-27) but there's no username/password login flow. Dead code.

### 6.4 Competitive Features That Would Impress

- **AI meal suggestions** based on calorie targets
- **Pomodoro timer** integration for DEEP tasks
- **Streak multiplier / gamification** (badges, XP)
- **Calendar heat map** (like GitHub contributions)
- **WebSocket-powered real-time dashboard updates**

---

## SECTION 7 — DEVOPS & DEPLOYMENT REVIEW

### 7.1 Dockerfile

The multi-stage Dockerfile is well-structured. Issues:

| Issue | Severity |
|-------|----------|
| No [.dockerignore](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/.dockerignore) optimized for Java (current is 46 bytes, needs Maven wrapper, `.git`, IDE files excluded) | 🟡 Low |
| No health check in Dockerfile | 🟠 Medium |
| No JVM memory tuning (`-Xmx`, `-XX:+UseContainerSupport`) | 🟠 Medium |
| No non-root user | 🟠 Medium |

**Recommended Dockerfile improvements**:
```dockerfile
FROM eclipse-temurin:21-jre
RUN addgroup --system app && adduser --system --ingroup app app
USER app
COPY --from=builder --chown=app:app /build/target/momentum-mosaic.jar app.jar
HEALTHCHECK --interval=30s CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
```

### 7.2 Docker Compose

- `version: "3.9"` is deprecated in modern Docker Compose
- No resource limits (`mem_limit`, `cpus`)
- No network isolation
- No restart policies
- MySQL root password is hardcoded to `root`
- No health check endpoint for the backend service (no Spring Actuator)

### 7.3 Missing CI/CD

No GitHub Actions, Jenkins, or any CI/CD configuration detected. At minimum you need:
- Build and test on PR
- Docker image build and push
- Automated deployment

### 7.4 Missing Observability

- **No Spring Boot Actuator** dependency → no health, metrics, or info endpoints
- **No Prometheus metrics** endpoint
- **No structured logging** (e.g., JSON logs for ELK)
- **No distributed tracing** (Micrometer Tracing / OpenTelemetry)

### 7.5 Secrets Management

Secrets (JWT key, OAuth2 client secret, DB password) are all in source code. Use:
- Environment variables (minimum)
- Docker secrets or Vault (production)
- Spring Cloud Config Server (enterprise)

---

## SECTION 8 — TESTING STRATEGY REVIEW

### 8.1 Current Coverage

| Test Type | Count | Modules Covered |
|-----------|-------|-----------------|
| Unit (Mockito) | 3 files | [FitnessServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImpl.java#16-94), [TaskServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#15-96), [DashboardServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#20-83) |
| Integration (Testcontainers) | 3 files | [AppUserRepository](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/AppUserRepository.java#7-11), [TaskRepository](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskRepository.java#7-12), [DailyFitnessLogRepository](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/DailyFitnessLogRepository.java#10-15) |
| Controller (MockMvc) | 1 file | [TaskController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/TaskController.java#15-64) |
| **Total** | **7 test files** | |

### 8.2 What's Missing

| Missing Test | Priority |
|-------------|----------|
| **Security tests** (auth flow, IDOR, unauthorized access) | 🔴 Critical |
| **Controller tests** for all other controllers | 🔴 Critical |
| **Edge case tests** (null values, boundary values, concurrent writes) | 🟠 High |
| **ProfileController** tests | 🟠 High |
| **GlobalExceptionHandler** tests | 🟠 High |
| **FitnessController / DashboardController** tests | 🟠 High |
| **Integration test for full workout flow** | 🟡 Medium |
| **Load testing** (Gatling / JMeter) | 🟡 Medium |

### 8.3 Test Quality Issues

- **DashboardServiceImplTest** mocks [DailyFitnessLogRepository](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/fitness/DailyFitnessLogRepository.java#10-15) but [DashboardServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/dashboard/DashboardServiceImpl.java#20-83) doesn't inject it (leftover mock from refactoring). Test still passes because Mockito is lenient.
- **No `@BeforeEach` setup** — test data is built inline in every test, leading to duplication.
- **No negative test cases** for validation (what happens with negative height, null task type, etc.).
- Repository integration tests don't test the completed tasks query ([findByAppUserIdAndCompletedTrue](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskRepository.java#9-10)).

### 8.4 Recommended Testing Architecture

```
Unit Tests (Mockito)           → All service classes
Integration Tests (Testcontainers) → All repositories
Slice Tests (@WebMvcTest)      → All controllers
Security Tests                 → Auth flows, IDOR, role-based access
Contract Tests (Spring Cloud)  → API contract validation
Load Tests (Gatling)           → Dashboard endpoint under load
```

---

## SECTION 9 — BACKEND ENGINEER SKILL GROWTH ADVICE

### 9.1 Skills to Improve

1. **Security mindset** — The IDOR vulnerability and hardcoded secrets are the kinds of mistakes that get flagged in security audits at FAANG. Practice threat modeling.
2. **API design** — Study REST maturity model (Richardson). Your URLs mix resource-based and action-based patterns.
3. **Database query optimization** — Loading all records into Java for counting/filtering is a common junior mistake. Let the DB do the work.
4. **Transactional boundaries** — Understand `@Transactional`, isolation levels, and when to apply them.
5. **Configuration management** — Never hardcode secrets, URLs, or environment-specific values.

### 9.2 Common Junior Developer Mistakes Visible Here

| Mistake | Where |
|---------|-------|
| Hardcoding secrets | [JwtService](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtService.java#15-62), [application.properties](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/resources/application.properties) |
| Not validating resource ownership (IDOR) | All controllers |
| Loading all data into memory for filtering | [getWorkoutStreak()](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/test/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImplTest.java#65-79), [getTotalWorkoutDays()](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/test/java/org/workshop/momentummosaicapp/fitness/FitnessServiceImplTest.java#51-64) |
| Duplicating business logic | Calorie calc in 2 places |
| Inconsistent naming | [appUserService](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/appUserService.java#3-10) (lowercase) |
| Dead code left in production | [JwtAuthenticationFilter](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtAuthenticationFilter.java#18-67), [LoginController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/LoginController.java#13-26) |
| Missing transactions | All service methods |
| Trusting path variables for identity | `{userId}` in every endpoint |

### 9.3 Advanced Concepts to Learn Next

1. **CQRS** — Separate read and write models (your dashboard is a read model)
2. **Event-driven architecture** — Publish domain events when tasks complete or workouts are logged
3. **Database migrations** — Flyway/Liquibase for production-safe schema changes
4. **Caching strategies** — Cache-aside, write-through, invalidation patterns
5. **Observability** — Distributed tracing, structured logging, alerting
6. **API Gateway patterns** — Rate limiting, circuit breakers, request routing
7. **Domain-Driven Design** — Aggregates, value objects, bounded contexts

### 9.4 Technologies to Add

| Technology | Why |
|------------|-----|
| **Redis** | Caching, session store, streak computation |
| **Flyway** | Database migration management |
| **Spring Boot Actuator** | Health checks, metrics, monitoring |
| **Micrometer + Prometheus** | Application metrics |
| **Testcontainers** (more depth) | Full integration testing |
| **MapStruct** | Replace manual [DtoMapper](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/DtoMapper.java#12-40) with compile-time mapping |
| **Spring Security** (deeper) | Method security, custom voters, ACLs |

### 9.5 Path to Senior Backend Engineer

1. **Own the full lifecycle** — Don't just write features; write migrations, tests, monitoring, and runbooks
2. **Design for failure** — What happens when the DB is down? When a downstream service timeouts?
3. **Think in trade-offs** — "I chose X over Y because of Z" is senior-level reasoning
4. **Code review others' code** — Develop an eye for anti-patterns
5. **System design practice** — Be able to whiteboard the architecture of this app end-to-end

---

## SECTION 10 — PRODUCTION READINESS SCORE

| Dimension | Score | Justification |
|-----------|-------|---------------|
| **Code Quality** | **5/10** | Good use of interfaces/DI, but naming violations, code duplication, layer violations, no logging, no transactions, unused code |
| **Database Design** | **5/10** | Reasonable schema for MVP, but missing indexes on hot queries, no migrations tool, `ddl-auto: update`, no soft deletes |
| **Architecture** | **4/10** | Critical IDOR vulnerability, dead JWT code, session/JWT confusion, controllers not co-located, duplicate logic, no API versioning |
| **Performance** | **4/10** | Full table scans for streaks/counts, 8+ queries per dashboard load, DB query per request in filter, no caching |
| **Security** | **2/10** | Hardcoded JWT secret, OAuth2 secret in source, IDOR on every endpoint, CSRF disabled with cookies, no rate limiting, exception messages leak internals |
| **Scalability** | **3/10** | In-memory sessions prevent horizontal scaling, no caching, no async processing, no pagination |
| **Maintainability** | **5/10** | Good test foundation (Mockito + Testcontainers), but low coverage, no CI/CD, no monitoring, no structured logging |

### What Must Be Fixed to Reach 9/10

| Dimension | Required |
|-----------|----------|
| Code Quality | Fix naming, remove dead code, add logging/transactions, extract duplicates, co-locate controllers |
| Database | Add Flyway, proper indexes, soft deletes, [validate](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#90-95) for ddl-auto |
| Architecture | Fix IDOR, remove dead JWT code, standardize API paths, add pagination |
| Performance | DB-level aggregations, caching, eliminate redundant user lookups |
| Security | Externalize ALL secrets, fix IDOR, add rate limiting, security headers, audit logging |
| Scalability | Redis sessions, caching, async processing, pagination on all list endpoints |
| Maintainability | CI/CD pipeline, 80%+ test coverage, Actuator + Prometheus |

---

## SECTION 11 — NEXT STEPS ROADMAP

### 🔴 Immediate Fixes (Do Now)

1. **Fix IDOR**: Extract `userId` from [Authentication](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtAuthenticationFilter.java#18-67) instead of path variables on every endpoint
2. **Rotate OAuth2 client secret** — it's been committed to version control
3. **Move JWT secret to environment variable** — `${JWT_SECRET}`
4. **Move DB passwords to environment variables** — remove from [application.properties](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/resources/application.properties)
5. **Add [.env](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/.env) to [.gitignore](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/.gitignore)**
6. **Fix [appUserService](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/user/appUserService.java#3-10) → `AppUserService` naming** (and the impl)
7. **Remove dead code**: [JwtAuthenticationFilter](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtAuthenticationFilter.java#18-67), [JwtService](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/JwtService.java#15-62), [LoginController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/LoginController.java#13-26), [CurrentUser](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/CurrentUser.java#8-29), [CustomUserDetailsService](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/security/CustomUserDetailsService.java#11-27)
8. **Fix `IllegalArgumentException` in [TaskServiceImpl](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#15-96)** → Use [BadRequestException](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/exception/BadRequestException.java#3-8)
9. **Fix catch-all exception handler** to return generic message instead of `ex.getMessage()`

### 🟠 Short-Term Improvements (1–2 Weeks)

1. **Add `@Transactional`** to all service write methods
2. **Extract calorie calculation** to a shared `NutritionCalculator`
3. **Fix [ProfileController](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/ProfileController.java#21-73)** to use service layer
4. **Add database indexes** on [(task.user_id, completed)](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/AuthController.java#17-32) and [(daily_fitness_log.user_id, date)](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/controller/AuthController.java#17-32)
5. **Replace in-memory streak/count operations** with `COUNT` and `ORDER BY` queries
6. **Add `@Max` validators** to all numeric inputs
7. **Add SLF4J logging** throughout the application
8. **Add controller tests** for all remaining controllers
9. **Add pagination** to task list and fitness log endpoints
10. **Externalize CORS origins** to application properties

### 🟡 Medium-Term Upgrades (1–2 Months)

1. **Integrate Flyway** for database migrations, switch `ddl-auto` to [validate](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/task/TaskServiceImpl.java#90-95)
2. **Add Spring Boot Actuator** for health/metrics endpoints
3. **Add Redis** for caching (user summary, streaks) and session storage
4. **Set up CI/CD** (GitHub Actions: build → test → Docker build → push)
5. **Add MapStruct** to replace manual [DtoMapper](file:///c:/Users/DELL/IdeaProjects/MomentumMosaicApp/src/main/java/org/workshop/momentummosaicapp/utility/DtoMapper.java#12-40)
6. **Add API versioning** (`/api/v1/...`)
7. **Add rate limiting** (Spring Cloud Gateway or Bucket4j)
8. **Implement soft deletes** for tasks
9. **Expand workout tracking** (type, duration, intensity, notes)
10. **Load testing** with Gatling targeting the dashboard endpoint

### 🔵 Long-Term Architectural Evolution

1. **Modular monolith**: Split into modules (user, fitness, task, dashboard) with explicit module boundaries
2. **Event-driven**: Publish domain events (TaskCompleted, WorkoutLogged) for decoupled processing
3. **CQRS**: Separate read-optimized dashboard query from write-heavy fitness/task endpoints
4. **Observability stack**: Prometheus + Grafana + structured logging (ELK/Loki)
5. **Consider microservices only if**: team grows beyond 3-4 engineers AND modules need independent scaling/deployment
6. **API Gateway**: Kong/Spring Cloud Gateway for rate limiting, auth, request routing
7. **Notification service**: Push notifications, email reminders for streak maintenance
8. **Analytics pipeline**: Track engagement metrics, popular features, user retention

---

> **Final Verdict**: The codebase shows promising foundational skills — proper use of interfaces, DTOs, repository pattern, `@Valid`, custom exceptions, and Testcontainers. However, it has **critical security issues** (IDOR, exposed secrets) and **performance anti-patterns** that would fail any FAANG production readiness review. The IDOR fix is the single most important change — it should be done before any other work.
