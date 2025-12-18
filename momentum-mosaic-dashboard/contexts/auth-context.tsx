"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { apiClient, type ApiError } from "@/lib/api"
import { useRouter } from "next/navigation"

interface User {
  userId: number
  email: string
  name: string
  profileCompleted: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  refetchUser: () => Promise<User | null>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const userData = await apiClient.getMe()
      console.log("[AuthContext] Fetched user:", userData)
      setUser(userData)
      return userData
    } catch (err) {
      const apiError = err as ApiError

      // 401: Not authenticated - managed state, not an "error" for the guard
      if (apiError.status === 401) {
        setUser(null)
        // We don't set error here, because being logged out is a valid state
      }
      // 403: Profile incomplete or other auth issues
      else if (apiError.status === 403) {
        // Should be handled by the guard or component logic, but we can track it
        console.warn("[AuthContext] 403 Error:", apiError)
        // We might want to set error here if it's not profile_not_completed, but typically 403 is "managed"
        if (apiError.error !== "PROFILE_NOT_COMPLETED") {
          setError(apiError.message || "Access Denied")
        }
      }
      else {
        // 500 or network errors - catch these as true errors to block UI
        setError(apiError.message || "An unexpected error occurred")
      }
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = () => {
    setUser(null)
    setError(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        refetchUser: fetchUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
