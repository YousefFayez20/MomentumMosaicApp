"use client"

import type React from "react"

import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import type { ApiError } from "@/lib/api"
import { Loader2 } from "lucide-react"

export function AuthGuard({
  children,
  requireCompleteProfile = true,
}: { children: React.ReactNode; requireCompleteProfile?: boolean }) {
  const { user, refetchUser } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refetchUser()
        setChecking(false)
      } catch (err) {
        const apiError = err as ApiError

        console.log("[v0] AuthGuard: Error checking auth", { status: apiError.status, path: pathname })

        if (apiError.status === 401) {
          router.replace("/login")
          return
        }

        if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
          // If we require complete profile and it's not complete, redirect
          if (requireCompleteProfile && pathname !== "/complete-profile") {
            router.replace("/complete-profile")
            return
          }
        }

        setChecking(false)
      }
    }

    checkAuth()
  }, [pathname, router, refetchUser, requireCompleteProfile])

  useEffect(() => {
    if (!checking && user) {
      if (user.profileCompleted && pathname === "/complete-profile") {
        router.replace("/dashboard")
      }

      if (!user.profileCompleted && requireCompleteProfile && pathname !== "/complete-profile") {
        router.replace("/complete-profile")
      }
    }
  }, [checking, user, pathname, router, requireCompleteProfile])

  if (checking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Strict Rule 8: If there is an error (e.g. 500), show error UI instead of children
  // We check existing 'error' from context, or catch it if checkAuth failed differently
  // Note: We need to pull error from useAuth()

  return <AuthGuardContent user={user} loading={checking} requireCompleteProfile={requireCompleteProfile}>{children}</AuthGuardContent>
}

function AuthGuardContent({
  user,
  loading,
  requireCompleteProfile,
  children
}: {
  user: any,
  loading: boolean,
  requireCompleteProfile: boolean,
  children: React.ReactNode
}) {
  const { error } = useAuth()

  // If we have a critical auth error (like 500) that prevented us from knowing user state
  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <h2 className="text-xl font-semibold text-destructive">Authentication Error</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
      </div>
    )
  }

  // Strict Protection: If not loading and no user, do NOT render children.
  // The useEffect should have redirected, but we must protect the render.
  if (!loading && !user) {
    return null // Don't render anything while redirecting
  }

  // Profile completion protection
  if (!loading && user && !user.profileCompleted && requireCompleteProfile) {
    return null // Don't render dashboard if profile incomplete
  }

  return <>{children}</>
}
// Add import for Button at top if missing, or use simple button
import { Button } from "@/components/ui/button"
