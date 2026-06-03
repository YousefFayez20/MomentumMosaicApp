function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, "")
}

export function resolveApiBaseUrl() {
  const configuredBaseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BACKEND_URL

  if (configuredBaseUrl) {
    return normalizeBaseUrl(configuredBaseUrl)
  }

  if (typeof window !== "undefined") {
    const { protocol, hostname, origin } = window.location
    const isLocalHost =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1"

    if (isLocalHost) {
      return `${protocol}//${hostname}:8080`
    }

    return origin
  }

  return "http://localhost:8080"
}

export function getGoogleLoginUrl() {
  return `${resolveApiBaseUrl()}/oauth2/authorization/google`
}

const API_BASE_URL = resolveApiBaseUrl()

export interface ApiError {
  timestamp: string
  status: number
  error: string
  message: string
  path: string
}

export class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string> || {}),
    }

    if (typeof window !== "undefined") {
      const token = localStorage.getItem("jwt_token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      let errorData: Partial<ApiError> = {}

      try {
        const text = await response.text()
        try {
          errorData = text ? JSON.parse(text) : {}
        } catch {
          errorData = {
            error: response.statusText,
            message: text || "An unexpected error occurred"
          }
        }
      } catch (e) {
        // Could not read text
        errorData = {
          error: response.statusText,
          message: "An unexpected error occurred"
        }
      }

      // Populate missing fields for consistency
      const fullError: ApiError = {
        timestamp: errorData.timestamp || new Date().toISOString(),
        status: errorData.status || response.status,
        error: errorData.error || response.statusText,
        message: errorData.message || (typeof errorData.error === 'string' ? errorData.error : "Unknown Error"),
        path: errorData.path || endpoint,
      }

      // Attach status to the error object for proper handling
      const error = new Error(fullError.message) as Error & ApiError
      Object.assign(error, fullError)
      throw error
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T
    }

    const text = await response.text()
    if (!text) return {} as T

    try {
      return JSON.parse(text)
    } catch {
      throw new Error("Failed to parse response JSON")
    }
  }

  // Auth endpoints
  async getMe() {
    return this.request<{
      userId: number
      email: string
      name: string
      profileCompleted: boolean
    }>("/api/auth/me")
  }

  // Profile endpoints
  async completeProfile(data: {
    gender: "MALE" | "FEMALE"
    heightCm: number
    weightKg: number
  }) {
    return this.request("/api/profile/complete", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // Dashboard endpoint
  async getDashboard() {
    return this.request<DashboardResponse>(`/api/dashboard`)
  }

  // Fitness endpoints
  async markWorkout(didWorkout: boolean) {
    return this.request(`/api/fitness/workout`, {
      method: "POST",
      body: JSON.stringify({ didWorkout }),
    })
  }

  async getTodayFitness() {
    return this.request<{ didWorkout: boolean; date: string; summary: UserSummary }>(`/api/fitness/today`)
  }

  async getTotalWorkoutDays() {
    return this.request<number>(`/api/fitness/total-days`)
  }

  async getWorkoutStreak() {
    return this.request<number>(`/api/fitness/streak`)
  }

  async getMacros() {
    return this.request<UserSummary>(`/api/fitness/macros`)
  }

  // Task endpoints
  async createTask(
    data: {
      title: string
      taskType: "DEEP" | "SHALLOW" | "FITNESS"
      durationMinutes: number
      plannedForDate?: string | null
    },
  ) {
    return this.request<TaskResponse>(`/api/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTask(
    taskId: number,
    data: {
      title?: string
      taskType?: "DEEP" | "SHALLOW" | "FITNESS"
      durationMinutes?: number
      plannedForDate?: string | null
    },
  ) {
    return this.request<TaskResponse>(`/api/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async startTask(taskId: number) {
    return this.request<TaskResponse>(`/api/tasks/${taskId}/start`, {
      method: "PUT",
    })
  }

  async completeTask(taskId: number) {
    return this.request<TaskResponse>(`/api/tasks/${taskId}/complete`, {
      method: "PUT",
    })
  }

  async abandonTask(taskId: number) {
    return this.request<TaskResponse>(`/api/tasks/${taskId}/abandon`, {
      method: "PUT",
    })
  }

  async deleteTask(taskId: number) {
    return this.request(`/api/tasks/${taskId}`, {
      method: "DELETE",
    })
  }

  async getTasks() {
    const [active, completed] = await Promise.all([
      this.request<TaskResponse[]>(`/api/tasks/active`),
      this.request<TaskResponse[]>(`/api/tasks/completed`),
    ])
    return [...active, ...completed]
  }

  async getWorkspaceSections() {
    return this.request<WorkspaceSectionResponse[]>(`/api/workspaces/sections`)
  }

  async getWorkspaces() {
    return this.request<WorkspaceSummaryResponse[]>(`/api/workspaces`)
  }

  async getWorkspace(workspaceId: number) {
    return this.request<WorkspaceResponse>(`/api/workspaces/${workspaceId}`)
  }

  // New: create workspace (optional section)
  async createWorkspace(data: { title: string; sectionId?: number | null }) {
    return this.request<WorkspaceResponse>(`/api/workspaces`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  // New: create a new section
  async createSection(data: { name: string; orderIndex?: number | null }) {
    // Section DTO matches WorkspaceSectionResponse shape
    return this.request<WorkspaceSectionResponse>(`/api/workspaces/sections`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async createWorkspaceEntry(
    workspaceId: number,
    data: {
      entryType: WorkspaceEntryType
      content?: string | null
      parentEntryId?: number | null
    },
  ) {
    return this.request<WorkspaceEntryResponse>(`/api/workspaces/${workspaceId}/entries`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateWorkspaceEntry(
    workspaceId: number,
    entryId: number,
    data: {
      content?: string | null
      collapsed?: boolean
      entryType?: WorkspaceEntryType
    },
  ) {
    return this.request<WorkspaceEntryResponse>(`/api/workspaces/${workspaceId}/entries/${entryId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async deleteWorkspaceEntry(workspaceId: number, entryId: number) {
    return this.request<void>(`/api/workspaces/${workspaceId}/entries/${entryId}`, {
      method: "DELETE",
    })
  }
}

// Types
export interface TaskResponse {
  id: number
  title: string
  taskType: "DEEP" | "SHALLOW" | "FITNESS"
  durationMinutes: number
  completed: boolean
  completedAt: string | null
  status: "PLANNED" | "IN_PROGRESS" | "COMPLETED"
  startedAt: string | null
  actualMinutes: number | null
  plannedForDate: string | null
  workspaceId?: number | null
}

export type WorkspaceEntryType = "BULLET" | "TOGGLE"

export type WorkspaceResourceType = "LINK" | "VIDEO" | "PDF" | "DOC" | "OTHER"

export interface WorkspaceSectionResponse {
  id: number
  name: string
  orderIndex: number | null
  createdAt: string
}

export interface WorkspaceSummaryResponse {
  id: number
  title: string
  sectionId: number | null
  sectionName: string | null
  lastActiveAt: string | null
  createdAt: string
}

export interface WorkspaceResourceResponse {
  id: number
  url: string
  label: string | null
  resourceType: WorkspaceResourceType | null
  orderIndex: number | null
  createdAt: string
}

export interface WorkspaceEntryResponse {
  id: number
  parentEntryId: number | null
  entryType: WorkspaceEntryType
  content: string | null
  collapsed: boolean
  orderIndex: number
  createdAt: string
  updatedAt: string
  children: WorkspaceEntryResponse[]
}

export interface WorkspaceResponse {
  id: number
  title: string
  sectionId: number | null
  sectionName: string | null
  archived: boolean
  lastActiveAt: string | null
  createdAt: string
  updatedAt: string
  entries: WorkspaceEntryResponse[]
  resources: WorkspaceResourceResponse[]
}

export type MomentumState =
  | "DORMANT"
  | "RECOVERING"
  | "BUILDING"
  | "STEADY"
  | "STRONG"
  | "LOCKED_IN"
  | "COOLING"

export type MomentumTrend = "RISING" | "STABLE" | "FALLING"

export interface MomentumSummary {
  state: MomentumState
  displayLabel: string
  trend: MomentumTrend
  rhythmPosition: number
  contextMessage: string
}

export interface UserSummary {
  heightCm: number
  weightKg: number
  gender: string
  proteinMin: number
  proteinMax: number
  caloriesMaintenance: number
  caloriesCut: number
  caloriesBulk: number
}

export interface FitnessSummary {
  didWorkoutToday: boolean
  totalWorkoutDays: number
  workoutStreak: number
}

export interface TaskSummary {
  activeTasks: TaskResponse[]
  completedTasks: TaskResponse[]
  totalDeepMinutes: number
  totalShallowMinutes: number
  totalFitnessMinutes: number
}

export interface DashboardResponse {
  userSummary: UserSummary
  taskSummary: TaskSummary
  fitnessSummary: FitnessSummary
  momentumSummary: MomentumSummary
}

export const apiClient = new ApiClient()
