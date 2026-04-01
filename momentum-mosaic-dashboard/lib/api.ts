const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"

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

    const response = await fetch(url, {
      ...options,
      credentials: "include", // Always include cookies for session auth
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
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
  async getDashboard(userId: number) {
    return this.request<DashboardResponse>(`/api/dashboard/${userId}`)
  }

  // Fitness endpoints
  async markWorkout(userId: number, didWorkout: boolean) {
    return this.request(`/api/fitness/${userId}/workout`, {
      method: "POST",
      body: JSON.stringify({ didWorkout }),
    })
  }

  async getTodayFitness(userId: number) {
    return this.request<{ didWorkout: boolean; date: string; summary: UserSummary }>(`/api/fitness/${userId}/today`)
  }

  async getTotalWorkoutDays(userId: number) {
    return this.request<number>(`/api/fitness/${userId}/total-days`)
  }

  async getWorkoutStreak(userId: number) {
    return this.request<number>(`/api/fitness/${userId}/streak`)
  }

  async getMacros(userId: number) {
    return this.request<UserSummary>(`/api/fitness/${userId}/macros`)
  }

  // Task endpoints
  async createTask(
    userId: number,
    data: {
      title: string
      taskType: "DEEP" | "SHALLOW" | "FITNESS"
      durationMinutes: number
    },
  ) {
    return this.request<TaskResponse>(`/api/tasks/${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async updateTask(
    userId: number,
    taskId: number,
    data: {
      title?: string
      taskType?: "DEEP" | "SHALLOW" | "FITNESS"
      durationMinutes?: number
    },
  ) {
    return this.request<TaskResponse>(`/api/tasks/${userId}/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  async completeTask(userId: number, taskId: number) {
    return this.request(`/api/tasks/${userId}/${taskId}/complete`, {
      method: "PUT",
    })
  }

  async deleteTask(userId: number, taskId: number) {
    return this.request(`/api/tasks/${userId}/${taskId}`, {
      method: "DELETE",
    })
  }

  async getTasks(userId: number) {
    const [active, completed] = await Promise.all([
      this.request<TaskResponse[]>(`/api/tasks/active/${userId}`),
      this.request<TaskResponse[]>(`/api/tasks/completed/${userId}`),
    ])
    return [...active, ...completed]
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
}

export const apiClient = new ApiClient()
