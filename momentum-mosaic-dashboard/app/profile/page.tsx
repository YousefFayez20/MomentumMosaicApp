"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type ApiError, type UserSummary } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BrandedLoader } from "@/components/branded-loader"
import { Ruler, Scale, Activity, UtensilsCrossed, Flame, Target } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      if (!user.userId) {
        setError("User data is incomplete (missing ID). Please refresh and try again.")
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const data = await apiClient.getMacros()
        setProfile(data)
        setError("")
      } catch (err) {
        const apiError = err as ApiError
        console.error("[Profile] Failed to fetch profile data:", apiError)

        if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
          router.push("/complete-profile")
          return
        }

        if (apiError.status === 401) {
          router.push("/login")
          return
        }

        setError("Failed to load profile data")
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [user, router])

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <BrandedLoader className="h-[calc(100vh-4rem)]" label="Loading profile" />
        </DashboardLayout>
      </AuthGuard>
    )
  }

  if (error || !profile) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <p className="text-muted-foreground">{error || "Failed to load profile data"}</p>
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const bmi = (profile.weightKg / Math.pow(profile.heightCm / 100, 2)).toFixed(1)

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="mb-8 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8">
            <h2 className="text-3xl font-bold tracking-tight text-primary">Profile & Settings</h2>
            <p className="mt-2 text-muted-foreground">
              Reference stats and nutrition targets live here so the dashboard can stay focused on today.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            <Card className="overflow-hidden border-none shadow-md">
              <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-white/10 p-3 backdrop-blur-sm">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Physical Profile</h3>
                    <p className="text-slate-300">Your current body metrics</p>
                  </div>
                </div>
              </div>
              <CardContent className="grid gap-4 p-6 sm:grid-cols-3">
                <div className="rounded-xl bg-muted/40 p-4">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <Ruler className="h-4 w-4" />
                    <span className="text-sm font-medium">Height</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{profile.heightCm} cm</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <Scale className="h-4 w-4" />
                    <span className="text-sm font-medium">Weight</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{profile.weightKg} kg</p>
                </div>
                <div className="rounded-xl bg-muted/40 p-4">
                  <div className="mb-3 flex items-center gap-2 text-muted-foreground">
                    <Target className="h-4 w-4" />
                    <span className="text-sm font-medium">BMI</span>
                  </div>
                  <p className="text-2xl font-bold text-primary">{bmi}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-green-600" />
                  Nutrition Targets
                </CardTitle>
                <CardDescription>Daily intake ranges generated from your current profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-xl border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-muted-foreground">Protein Target</span>
                    </div>
                    <Badge variant="secondary">
                      {Math.round(profile.proteinMin)}-{Math.round(profile.proteinMax)}g
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <div className="text-xs font-medium uppercase text-muted-foreground">Cut</div>
                    <div className="mt-2 text-2xl font-bold">{profile.caloriesCut}</div>
                    <div className="text-[10px] text-muted-foreground">kcal</div>
                  </div>
                  <div className="rounded-lg border border-primary/50 bg-primary/5 p-4 text-center">
                    <div className="text-xs font-bold uppercase text-primary">Maintain</div>
                    <div className="mt-2 text-2xl font-bold">{profile.caloriesMaintenance}</div>
                    <div className="text-[10px] text-muted-foreground">kcal</div>
                  </div>
                  <div className="rounded-lg border bg-card p-4 text-center">
                    <div className="text-xs font-medium uppercase text-muted-foreground">Bulk</div>
                    <div className="mt-2 text-2xl font-bold">{profile.caloriesBulk}</div>
                    <div className="text-[10px] text-muted-foreground">kcal</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
