"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type DashboardResponse, type ApiError } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Flame, Target, Zap, TrendingUp, Activity, Clock, Brain, Dumbbell, Utensils, Battery, Mountain, ArrowRight, User } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDashboard = async () => {
      // AuthGuard guarantees 'user' exists, but we check 'id' safety
      if (!user) return

      if (!user.userId) {
        console.error("[Dashboard] User object missing 'id'", user)
        setError("User data is incomplete (missing ID). Please looking at the console logs.")
        setLoading(false)
        return
      }

      console.log("[Dashboard] Fetching data for user:", user.userId)

      try {
        setLoading(true)
        const data = await apiClient.getDashboard(user.userId)
        setDashboard(data)
        setError("")
      } catch (err) {
        const apiError = err as ApiError
        console.error("[v0] Dashboard fetch error:", apiError)

        if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
          router.push("/complete-profile")
          return
        }

        if (apiError.status === 401) {
          router.push("/login")
          return
        }

        setError("Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [user, router])

  // Safety timeout/check: if we are loading but have no user and auth is done/failed?
  // Actually AuthGuard handles no-user case.
  // But if AuthGuard thinks we are authed (user exists) but id is missing?


  if (loading) {
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

  if (error || !dashboard) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
            <p className="text-muted-foreground">{error || "Failed to load data"}</p>
            {user && <pre className="mt-4 text-xs text-left p-2 bg-muted rounded">{JSON.stringify(user, null, 2)}</pre>}
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const { userSummary, fitnessSummary, taskSummary } = dashboard
  const totalActiveTasks = taskSummary.activeTasks.length
  const totalMinutes = taskSummary.totalDeepMinutes + taskSummary.totalShallowMinutes + taskSummary.totalFitnessMinutes

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-10 flex flex-col gap-2 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-primary">Welcome, {user?.name}!</h2>
              <p className="mt-2 text-lg text-muted-foreground">You're building momentum one day at a time.</p>
            </div>
            <div className="mt-4 flex gap-2 md:mt-0">
              <Badge variant="outline" className="px-3 py-1 text-sm bg-background/50 backdrop-blur">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
              </Badge>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="group relative overflow-hidden border-l-4 border-l-primary transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Workout Streak</CardTitle>
                <div className="rounded-full bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Flame className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{fitnessSummary.workoutStreak}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  {fitnessSummary.workoutStreak === 1 ? "day" : "days"} on fire
                </p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-l-4 border-l-purple-500 transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Workouts</CardTitle>
                <div className="rounded-full bg-purple-500/10 p-2 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                  <Dumbbell className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{fitnessSummary.totalWorkoutDays}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">lifetime sessions</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-l-4 border-l-blue-500 transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Active Tasks</CardTitle>
                <div className="rounded-full bg-blue-500/10 p-2 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <Target className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalActiveTasks}</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">goals in progress</p>
              </CardContent>
            </Card>

            <Card className="group relative overflow-hidden border-l-4 border-l-amber-500 transition-all hover:-translate-y-1 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Focus</CardTitle>
                <div className="rounded-full bg-amber-500/10 p-2 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <Clock className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{Math.floor(totalMinutes / 60)}h</div>
                <p className="text-xs text-muted-foreground font-medium mt-1">{totalMinutes % 60}m tracked total</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-8 lg:grid-cols-7">

            {/* Left Column: Profile & Wellness (4 cols) */}
            <div className="space-y-8 lg:col-span-4">
              {/* User Profile Card */}
              <Card className="overflow-hidden border-none shadow-md">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-white/10 p-3 backdrop-blur-sm">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Physical Profile</h3>
                      <p className="text-slate-300">Your personalized stats</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="rounded-xl bg-muted/40 p-4 transition-colors hover:bg-muted/70">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Height</p>
                      <p className="text-2xl font-bold text-primary">{userSummary.heightCm} <span className="text-base font-normal text-muted-foreground">cm</span></p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 transition-colors hover:bg-muted/70">
                      <p className="text-sm font-medium text-muted-foreground mb-1">Weight</p>
                      <p className="text-2xl font-bold text-primary">{userSummary.weightKg} <span className="text-base font-normal text-muted-foreground">kg</span></p>
                    </div>
                    <div className="rounded-xl bg-muted/40 p-4 transition-colors hover:bg-muted/70">
                      <p className="text-sm font-medium text-muted-foreground mb-1">BMI</p>
                      <p className="text-2xl font-bold text-primary">{(userSummary.weightKg / Math.pow(userSummary.heightCm / 100, 2)).toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Nutrition Targets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Utensils className="h-5 w-5 text-green-600" />
                    Nutrition Targets
                  </CardTitle>
                  <CardDescription>Daily recommended intake</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-muted-foreground">Protein</span>
                          <Badge variant="secondary">{Math.round(userSummary.proteinMin)}-{Math.round(userSummary.proteinMax)}g</Badge>
                        </div>
                      </div>
                      <Progress value={75} className="h-2 bg-muted text-green-500" />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-lg border p-3 bg-card text-center hover:border-orange-500/50 transition-colors">
                        <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Cut</div>
                        <div className="text-xl font-bold">{userSummary.caloriesCut}</div>
                        <div className="text-[10px] text-muted-foreground">kcal</div>
                      </div>
                      <div className="rounded-lg border p-3 bg-secondary/30 text-center border-primary/50">
                        <div className="text-xs text-primary font-bold uppercase mb-1">Reference</div>
                        <div className="text-xl font-bold">{userSummary.caloriesMaintenance}</div>
                        <div className="text-[10px] text-muted-foreground">kcal</div>
                      </div>
                      <div className="rounded-lg border p-3 bg-card text-center hover:border-blue-500/50 transition-colors">
                        <div className="text-xs text-muted-foreground font-medium uppercase mb-1">Bulk</div>
                        <div className="text-xl font-bold">{userSummary.caloriesBulk}</div>
                        <div className="text-[10px] text-muted-foreground">kcal</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column: Tracking & Breakdown (3 cols) */}
            <div className="space-y-8 lg:col-span-3">

              {/* Daily Status */}
              <Card className={`border-2 ${fitnessSummary.didWorkoutToday ? "border-green-500/20 bg-green-500/5" : "border-muted"}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-5">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${fitnessSummary.didWorkoutToday ? "bg-green-500 text-white shadow-green-500/25 shadow-lg" : "bg-muted text-muted-foreground"}`}>
                      {fitnessSummary.didWorkoutToday ? <Activity className="h-8 w-8" /> : <Mountain className="h-8 w-8" />}
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold leading-none">
                        {fitnessSummary.didWorkoutToday ? "Workout Complete!" : "No Workout Yet"}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {fitnessSummary.didWorkoutToday ? "Great job staying consistent." : "Visit the fitness page to log it."}
                      </p>
                      {!fitnessSummary.didWorkoutToday && (
                        <Badge
                          variant="outline"
                          className="mt-2 cursor-pointer hover:bg-primary hover:text-white"
                          onClick={() => router.push("/fitness")}
                        >
                          Go to Fitness <ArrowRight className="ml-1 h-3 w-3" />
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Task Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500" />
                    Focus Distribution
                  </CardTitle>
                  <CardDescription>Time allocation across activities</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Progress Bars */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5"><Brain className="h-3.5 w-3.5 text-indigo-500" /> Deep Work</span>
                        <span>{taskSummary.totalDeepMinutes}m</span>
                      </div>
                      <Progress value={totalMinutes > 0 ? (taskSummary.totalDeepMinutes / totalMinutes) * 100 : 0} className="h-1.5 bg-muted [&>div]:bg-indigo-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5"><Battery className="h-3.5 w-3.5 text-sky-500" /> Shallow Work</span>
                        <span>{taskSummary.totalShallowMinutes}m</span>
                      </div>
                      <Progress value={totalMinutes > 0 ? (taskSummary.totalShallowMinutes / totalMinutes) * 100 : 0} className="h-1.5 bg-muted [&>div]:bg-sky-500" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="flex items-center gap-1.5"><Dumbbell className="h-3.5 w-3.5 text-emerald-500" /> Fitness</span>
                        <span>{taskSummary.totalFitnessMinutes}m</span>
                      </div>
                      <Progress value={totalMinutes > 0 ? (taskSummary.totalFitnessMinutes / totalMinutes) * 100 : 0} className="h-1.5 bg-muted [&>div]:bg-emerald-500" />
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Recent Tasks List */}
                  <div>
                    <h4 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">Recent Active Tasks</h4>
                    {taskSummary.activeTasks.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        No active tasks
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {taskSummary.activeTasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="group flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${task.taskType === "DEEP" ? "bg-indigo-500" :
                                task.taskType === "SHALLOW" ? "bg-sky-500" : "bg-emerald-500"
                                }`} />
                              <span className="text-sm font-medium group-hover:text-primary transition-colors">{task.title}</span>
                            </div>
                            <Badge variant="secondary" className="text-[10px] h-5">{task.durationMinutes}m</Badge>
                          </div>
                        ))}
                        {taskSummary.activeTasks.length > 3 && (
                          <Button variant="ghost" className="w-full text-xs text-muted-foreground h-8" onClick={() => router.push("/tasks")}>
                            View {taskSummary.activeTasks.length - 3} more <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
