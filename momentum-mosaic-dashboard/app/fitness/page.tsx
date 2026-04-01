"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type ApiError, type UserSummary } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Activity, TrendingUp, Calendar, CheckCircle2, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export default function FitnessPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [todayLog, setTodayLog] = useState<{ didWorkout: boolean; date: string; summary: UserSummary } | null>(null)
  const [userMacros, setUserMacros] = useState<UserSummary | null>(null)
  const [totalDays, setTotalDays] = useState(0)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchFitnessData = async () => {
    if (!user) return
    if (!user.userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      // Fetch safe data (stats & macros)
      const tasks = [
        apiClient.getTotalWorkoutDays(user.userId),
        apiClient.getWorkoutStreak(user.userId),
        apiClient.getMacros(user.userId),
      ]

      const [totalDaysData, streakData, macrosData] = await Promise.all(tasks)

      setTotalDays(totalDaysData as number)
      setStreak(streakData as number)
      setUserMacros(macrosData as UserSummary)

      // Try to fetch today's log, handle 404 if not found
      try {
        const todayData = await apiClient.getTodayFitness(user.userId)
        setTodayLog(todayData)
      } catch (err) {
        // If 404, it means no log exists for today, which is fine
        // any other error we might want to log, but 404 is expected
        console.log("No workout log found for today (this is normal for a new day)")
        setTodayLog(null)
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error("[v0] Fitness fetch error:", apiError)

      if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
        router.push("/complete-profile")
        return
      }

      if (apiError.status === 401) {
        router.push("/login")
        return
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFitnessData()
  }, [user])

  const handleMarkWorkout = async (didWorkout: boolean) => {
    if (!user?.userId) return

    try {
      setSubmitting(true)
      await apiClient.markWorkout(user.userId, didWorkout)

      // Refresh data to update stats
      await fetchFitnessData()

      toast({
        title: didWorkout ? "Workout Logged!" : "Status Updated",
        description: didWorkout
          ? "Great job! Your consistency represents your character."
          : "Status updated. Rest is important too.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to log workout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    // ... (loading state remains the same)
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* ... (Header and Stats Grid remain the same) */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Fitness Tracking</h2>
            <p className="text-muted-foreground">Track your workout consistency and build momentum</p>
          </div>

          {/* Stats Grid */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{streak}</div>
                <p className="text-xs text-muted-foreground">{streak === 1 ? "day" : "days"} in a row</p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                <Activity className="h-5 w-5 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-accent">{totalDays}</div>
                <p className="text-xs text-muted-foreground">lifetime workouts</p>
              </CardContent>
            </Card>

            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
                <Calendar className="h-5 w-5 text-chart-3" />
              </CardHeader>
              <CardContent>
                {todayLog?.didWorkout ? (
                  <Badge variant="default" className="text-base">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-base">
                    <XCircle className="mr-1 h-4 w-4" />
                    Not Started
                  </Badge>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Summary */}
          {userMacros && (
            <div className="mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-chart-2" />
                    Daily Nutrition Targets
                  </CardTitle>
                  <CardDescription>Based on your profile ({userMacros.weightKg}kg)</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm font-medium text-muted-foreground">Protein</p>
                      <p className="text-2xl font-bold">
                        {Math.round(userMacros.proteinMin)}-{Math.round(userMacros.proteinMax)}g
                      </p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
                      <p className="text-2xl font-bold">{userMacros.caloriesMaintenance} kcal</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm font-medium text-muted-foreground">Cutting</p>
                      <p className="text-2xl font-bold">{userMacros.caloriesCut} kcal</p>
                    </div>
                    <div className="rounded-lg border bg-card p-4">
                      <p className="text-sm font-medium text-muted-foreground">Bulking</p>
                      <p className="text-2xl font-bold">{userMacros.caloriesBulk} kcal</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Main Action Card */}
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-2 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Log Today's Workout
                </CardTitle>
                <CardDescription>Mark whether you completed a workout today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-3">
                  {!todayLog?.didWorkout ? (
                    <>
                      <Button
                        size="lg"
                        onClick={() => handleMarkWorkout(true)}
                        disabled={submitting}
                        className="w-full gap-2"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        {submitting ? "Logging..." : "Yes, I Worked Out Today"}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleMarkWorkout(false)}
                        disabled={submitting}
                        className="w-full gap-2"
                      >
                        <XCircle className="h-5 w-5" />
                        {submitting ? "Updating..." : "No, Skip Today"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg bg-primary/10 p-4 text-center">
                        <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-primary" />
                        <p className="font-semibold text-primary">Workout Logged!</p>
                        <p className="text-sm text-muted-foreground">Great job staying consistent</p>
                      </div>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleMarkWorkout(false)}
                        disabled={submitting}
                        className="w-full"
                      >
                        Remove Today's Workout
                      </Button>
                    </>
                  )}
                </div>

                <div className="rounded-lg border bg-muted/50 p-4">
                  <h4 className="mb-2 font-semibold">Workout Tips</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Consistency is key - aim for at least 3-4 workouts per week</li>
                    <li>• Include both cardio and strength training</li>
                    <li>• Don't forget rest days for recovery</li>
                    <li>• Stay hydrated before, during, and after exercise</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Motivation Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-accent" />
                  Your Progress
                </CardTitle>
                <CardDescription>Keep building your fitness momentum</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="rounded-lg border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Workout Frequency</span>
                      <Flame className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">{totalDays > 0 ? `${totalDays} total` : "Just starting"}</p>
                    <p className="text-xs text-muted-foreground">
                      {streak > 0 ? `${streak} day streak!` : "Start your streak today"}
                    </p>
                  </div>

                  <div className="rounded-lg border bg-card p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Streak Status</span>
                      <Badge variant={streak >= 7 ? "default" : "secondary"}>
                        {streak >= 7 ? "Strong" : "Building"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">7-day streak</span>
                        <span className={streak >= 7 ? "text-primary font-semibold" : "text-muted-foreground"}>
                          {streak >= 7 ? "Achieved! ✓" : `${Math.max(0, 7 - streak)} days to go`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">14-day streak</span>
                        <span className={streak >= 14 ? "text-primary font-semibold" : "text-muted-foreground"}>
                          {streak >= 14 ? "Achieved! ✓" : `${Math.max(0, 14 - streak)} days to go`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">30-day streak</span>
                        <span className={streak >= 30 ? "text-primary font-semibold" : "text-muted-foreground"}>
                          {streak >= 30 ? "Achieved! ✓" : `${Math.max(0, 30 - streak)} days to go`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-accent/10 p-4">
                  <p className="font-semibold text-accent">
                    {streak === 0
                      ? "Start your fitness journey today!"
                      : streak < 3
                        ? "You're off to a great start!"
                        : streak < 7
                          ? "Keep the momentum going!"
                          : streak < 14
                            ? "You're on fire! Keep it up!"
                            : streak < 30
                              ? "Incredible consistency! You're a champion!"
                              : "You're a fitness legend! Outstanding dedication!"}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {streak === 0
                      ? "Log your first workout to start building a streak"
                      : `You've completed ${totalDays} workouts. Every day counts!`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
