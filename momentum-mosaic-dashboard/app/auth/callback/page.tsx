"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { ApiError } from "@/lib/api"
import { Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const router = useRouter()
  const { refetchUser } = useAuth()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("[v0] Auth callback: Fetching user data")

        // Call /api/auth/me to get authenticated user
        const userData = await refetchUser()

        console.log("[v0] Auth callback: User data received", userData)

        if (!userData) {
          throw new Error("Failed to fetch user data")
        }

        // Check profile completion status
        if (!userData.profileCompleted) {
          console.log("[v0] Auth callback: Profile incomplete, redirecting to /complete-profile")
          router.replace("/complete-profile")
        } else {
          console.log("[v0] Auth callback: Profile complete, redirecting to /dashboard")
          router.replace("/dashboard")
        }
      } catch (err) {
        const apiError = err as ApiError
        console.error("[v0] Auth callback error:", apiError)

        if (apiError.status === 401) {
          // Not authenticated - redirect to login
          console.log("[v0] Auth callback: 401 - redirecting to /login")
          router.replace("/login")
        } else if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
          // Authenticated but profile incomplete
          console.log("[v0] Auth callback: 403 PROFILE_NOT_COMPLETED - redirecting to /complete-profile")
          router.replace("/complete-profile")
        } else {
          // Other errors
          setError("Authentication failed. Please try again.")
          setTimeout(() => router.replace("/login"), 2000)
        }
      }
    }

    handleCallback()
  }, [router, refetchUser])

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <p className="text-sm text-muted-foreground">Redirecting to login...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-lg font-medium">Completing sign in...</p>
      <p className="text-sm text-muted-foreground">Please wait while we set up your account</p>
    </div>
  )
}
