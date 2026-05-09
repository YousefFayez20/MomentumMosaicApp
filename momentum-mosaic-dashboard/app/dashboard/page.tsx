"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type DashboardResponse, type ApiError, type TaskResponse } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, Activity, Mountain, ArrowRight, Brain, Zap, Dumbbell, Flame, Target, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { BrandedLoader } from "@/components/branded-loader"
import { useToast } from "@/hooks/use-toast"

const TASK_TYPE_ORDER: Array<TaskResponse["taskType"]> = ["DEEP", "SHALLOW", "FITNESS"]

const TASK_TYPE_META: Record<
  TaskResponse["taskType"],
  { label: string; icon: typeof Brain; badgeClassName: string; railClassName: string; markerClassName: string }
> = {
  DEEP: {
    label: "Deep Work",
    icon: Brain,
    badgeClassName: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
    railClassName: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/20",
    markerClassName: "bg-indigo-500",
  },
  SHALLOW: {
    label: "Shallow Work",
    icon: Zap,
    badgeClassName: "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300",
    railClassName: "border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20",
    markerClassName: "bg-sky-500",
  },
  FITNESS: {
    label: "Fitness",
    icon: Dumbbell,
    badgeClassName: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
    railClassName: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20",
    markerClassName: "bg-emerald-500",
  },
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

function isToday(dateValue: string | null) {
  if (!dateValue) return false

  const date = new Date(dateValue)
  const now = new Date()

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null)
  const [workoutSubmitting, setWorkoutSubmitting] = useState(false)

  const fetchDashboard = async () => {
    if (!user) return

    if (!user.userId) {
      console.error("[Dashboard] User object missing 'id'", user)
      setError("User data is incomplete (missing ID). Please check the console logs.")
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await apiClient.getDashboard()
      setDashboard(data)
      setError("")
    } catch (err) {
      const apiError = err as ApiError
      console.error("[Dashboard] Fetch error:", apiError)

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

  useEffect(() => {
    fetchDashboard()
  }, [user, router])

  const handleCompleteTask = async (taskId: number) => {
    if (!user?.userId) return

    try {
      setCompletingTaskId(taskId)
      await apiClient.completeTask(taskId)
      toast({
        title: "Task completed",
        description: "Nice work. Your dashboard has been updated.",
      })
      await fetchDashboard()
    } catch (err) {
      console.error("[Dashboard] Failed to complete task:", err)
      toast({
        title: "Could not complete task",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setCompletingTaskId(null)
    }
  }

  const handleWorkoutToggle = async (didWorkout: boolean) => {
    if (!user?.userId) return

    try {
      setWorkoutSubmitting(true)
      await apiClient.markWorkout(didWorkout)
      toast({
        title: didWorkout ? "Workout logged" : "Workout removed",
        description: didWorkout
          ? "Nice work. Your streak and status are up to date."
          : "Today's workout status has been undone.",
      })
      await fetchDashboard()
    } catch (err) {
      console.error("[Dashboard] Failed to update workout:", err)
      toast({
        title: "Could not update workout",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setWorkoutSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <BrandedLoader className="h-[calc(100vh-4rem)]" label="Loading dashboard" />
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
          </div>
        </DashboardLayout>
      </AuthGuard>
    )
  }

  const { fitnessSummary, taskSummary } = dashboard
  const activeTasks = [...taskSummary.activeTasks].sort(
    (left, right) => TASK_TYPE_ORDER.indexOf(left.taskType) - TASK_TYPE_ORDER.indexOf(right.taskType),
  )
  const completedToday = taskSummary.completedTasks.filter((task) => isToday(task.completedAt))
  const completedTodayCount = completedToday.length
  const totalTaskCount = activeTasks.length + completedTodayCount
  const completedTodayMinutes = completedToday.reduce((sum, task) => sum + task.durationMinutes, 0)
  const plannedMinutes = activeTasks.reduce((sum, task) => sum + task.durationMinutes, 0)
  const progressPercent = totalTaskCount === 0 ? 100 : Math.round((completedTodayCount / totalTaskCount) * 100)

  const groupedTasks = TASK_TYPE_ORDER.map((taskType) => ({
    taskType,
    tasks: activeTasks.filter((task) => task.taskType === taskType),
  })).filter((group) => group.tasks.length > 0)

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="command-surface reveal-up mb-8 overflow-hidden rounded-lg p-5 sm:p-7">
            <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Daily discipline</p>
                <h2 className="text-3xl font-bold text-primary sm:text-4xl">Today's Momentum</h2>
                <p className="mt-2 text-muted-foreground">
                  Focus on what matters. Complete what you've committed to.
                </p>
              </div>
              <div className="w-full max-w-sm rounded-lg border bg-background/65 p-4 backdrop-blur md:w-80">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-medium uppercase text-muted-foreground">
                    {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
                  </span>
                  <span className="text-sm font-semibold text-primary">{progressPercent}%</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>{activeTasks.length} open</span>
                  <span>{completedTodayCount} done</span>
                  <span>{formatMinutes(plannedMinutes)} left</span>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal-up reveal-delay-1 mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-l-primary bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Workout Streak</CardTitle>
                <Flame className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{fitnessSummary.workoutStreak}</div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">
                  {fitnessSummary.workoutStreak === 1 ? "day" : "days"} of consistency
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-emerald-500 bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {completedTodayCount} of {totalTaskCount}
                </div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">tasks completed today</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500 bg-card/80 sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Focus Time</CardTitle>
                <Clock className="h-5 w-5 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{formatMinutes(completedTodayMinutes)}</div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">completed across today's finished tasks</p>
              </CardContent>
            </Card>
          </div>

          <div className="reveal-up reveal-delay-2 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] lg:items-start">
            <Card className="order-2 overflow-hidden bg-card/90 lg:order-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Today's Sequence
                </CardTitle>
                <CardDescription>Move left to right through the commitments that still need attention.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {groupedTasks.length === 0 ? (
                  <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                    <p className="text-lg font-semibold">No active tasks right now</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You're caught up for the moment. Head to Tasks if you want to plan the rest of the day.
                    </p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => router.push("/tasks")}>
                      Open Tasks <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  groupedTasks.map((group, groupIndex) => {
                    const meta = TASK_TYPE_META[group.taskType]
                    const GroupIcon = meta.icon

                    return (
                      <section key={group.taskType} className="space-y-3" style={{ animationDelay: `${groupIndex * 90}ms` }}>
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge className={meta.badgeClassName}>
                              <GroupIcon className="mr-1 h-3.5 w-3.5" />
                              {meta.label}
                            </Badge>
                          </div>
                          <span className="text-xs font-medium uppercase text-muted-foreground">
                            {group.tasks.length} {group.tasks.length === 1 ? "task" : "tasks"}
                          </span>
                        </div>

                        <div className="commitment-rail flex gap-3 overflow-x-auto pb-3">
                          {group.tasks.map((task, taskIndex) => (
                            <div
                              key={task.id}
                              className={`min-w-[240px] rounded-lg border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:min-w-[280px] ${meta.railClassName}`}
                            >
                              <div className="mb-4 flex items-center justify-between">
                                <span className={`h-2 w-8 rounded-full ${meta.markerClassName}`} />
                                <span className="font-mono text-xs text-muted-foreground">
                                  {String(taskIndex + 1).padStart(2, "0")}
                                </span>
                              </div>
                              <div className="min-w-0 space-y-3">
                                <p className="line-clamp-2 min-h-10 font-semibold leading-tight">{task.title}</p>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Clock className="h-4 w-4" />
                                  <span>{task.durationMinutes} minutes</span>
                                </div>
                              </div>

                              <Button
                                className="mt-4 w-full gap-2"
                                variant="secondary"
                                onClick={() => handleCompleteTask(task.id)}
                                disabled={completingTaskId === task.id}
                              >
                                <Check className="h-4 w-4" />
                                {completingTaskId === task.id ? "Completing..." : "Mark Complete"}
                              </Button>
                            </div>
                          ))}
                        </div>
                      </section>
                    )
                  })
                )}
              </CardContent>
            </Card>

            <div className="order-1 space-y-6 lg:order-2">
              <Card className={`border-2 ${fitnessSummary.didWorkoutToday ? "border-green-500/20 bg-green-500/5" : "border-muted"}`}>
                <CardContent className="p-6">
                  <div className="flex items-center gap-5">
                    <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full ${fitnessSummary.didWorkoutToday ? "bg-green-500 text-white shadow-lg shadow-green-500/25" : "bg-muted text-muted-foreground"}`}>
                      {fitnessSummary.didWorkoutToday ? <Activity className="h-8 w-8" /> : <Mountain className="h-8 w-8" />}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-xl font-bold leading-none">
                        {fitnessSummary.didWorkoutToday ? "Workout Complete" : "Workout Still Open"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {fitnessSummary.didWorkoutToday
                          ? "You've already checked the fitness box for today."
                          : "Log today's workout so it doesn't slip past you."}
                      </p>
                      <div className="pt-2">
                        {fitnessSummary.didWorkoutToday ? (
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-green-600 text-white hover:bg-green-600">
                              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                              Logged today
                            </Badge>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleWorkoutToggle(false)}
                              disabled={workoutSubmitting}
                            >
                              {workoutSubmitting ? "Updating..." : "Undo"}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="gap-2"
                            onClick={() => handleWorkoutToggle(true)}
                            disabled={workoutSubmitting}
                          >
                            <Activity className="h-4 w-4" />
                            {workoutSubmitting ? "Logging..." : "Log Workout"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Today at a Glance</CardTitle>
                  <CardDescription>A quick read on what remains before the day feels complete.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-muted-foreground">Tasks still open</div>
                    <div className="mt-1 text-2xl font-bold">{activeTasks.length}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-muted-foreground">Time still planned</div>
                    <div className="mt-1 text-2xl font-bold">
                      {formatMinutes(activeTasks.reduce((sum, task) => sum + task.durationMinutes, 0))}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-muted-foreground">Next best focus</div>
                    <div className="mt-1 text-base font-semibold">
                      {groupedTasks[0] ? TASK_TYPE_META[groupedTasks[0].taskType].label : "Nothing queued"}
                    </div>
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
