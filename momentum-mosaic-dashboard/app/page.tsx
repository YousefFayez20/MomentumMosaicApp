"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { BrandedLoader } from "@/components/branded-loader"

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (!user.profileCompleted) {
        router.push("/profile/complete")
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, loading, router])

  return (
    <BrandedLoader className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5" />
  )
}
