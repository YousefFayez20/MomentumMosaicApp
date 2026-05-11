"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type DashboardResponse, type ApiError, type TaskResponse } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2, Clock, Activity, Mountain, ArrowRight,
  Brain, Zap, Dumbbell, Flame, Target, Check, Play,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { BrandedLoader } from "@/components/branded-loader"
import { useToast } from "@/hooks/use-toast"
import { TaskTimer } from "@/components/task-timer"
import { FocusMode } from "@/components/focus-mode"
import { SessionComplete } from "@/components/session-complete"

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Action loading states
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null)
  const [startingTaskId, setStartingTaskId] = useState<number | null>(null)
  const [abandoningTaskId, setAbandoningTaskId] = useState<number | null>(null)
  const [workoutSubmitting, setWorkoutSubmitting] = useState(false)

  // Session completion modal
  const [completedTask, setCompletedTask] = useState<TaskResponse | null>(null)

  // ─── Data fetching ───────────────────────────────────────────────────────────

  const fetchDashboard = async () => {
    if (!user?.userId) return
    try {
      setLoading(true)
      const data = await apiClient.getDashboard()
      setDashboard(data)
      setError("")
    } catch (err) {
      const apiError = err as ApiError
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

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleStartTask = async (taskId: number) => {
    if (!user?.userId) return
    try {
      setStartingTaskId(taskId)
      await apiClient.startTask(taskId)
      toast({ title: "Focus session started", description: "Stay focused. The clock is ticking." })
      await fetchDashboard()
    } catch (err) {
      const apiError = err as ApiError
      toast({
        title: "Could not start session",
        description: apiError?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setStartingTaskId(null)
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    if (!user?.userId) return
    try {
      setCompletingTaskId(taskId)
      const task = await apiClient.completeTask(taskId)
      // Show the session-complete modal
      setCompletedTask(task)
      await fetchDashboard()
    } catch (err) {
      const apiError = err as ApiError
      toast({
        title: "Could not complete task",
        description: apiError?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setCompletingTaskId(null)
    }
  }

  const handleAbandonTask = async (taskId: number) => {
    if (!user?.userId) return
    try {
      setAbandoningTaskId(taskId)
      await apiClient.abandonTask(taskId)
      toast({ title: "Session abandoned", description: "Task returned to planned." })
      await fetchDashboard()
    } catch (err) {
      const apiError = err as ApiError
      toast({
        title: "Could not abandon session",
        description: apiError?.message || "Please try again.",
        variant: "destructive",
      })
    } finally {
      setAbandoningTaskId(null)
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
    } catch {
      toast({ title: "Could not update workout", description: "Please try again.", variant: "destructive" })
    } finally {
      setWorkoutSubmitting(false)
    }
  }

  // ─── Loading / Error states ───────────────────────────────────────────────────

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

  // ─── Derived state ────────────────────────────────────────────────────────────

  const { fitnessSummary, taskSummary } = dashboard

  const allActiveTasks = [...taskSummary.activeTasks]

  // Separate IN_PROGRESS from PLANNED for prioritised display
  const inProgressTask = allActiveTasks.find((t) => t.status === "IN_PROGRESS") ?? null
  const hasActiveSession = inProgressTask !== null

  const plannedTasks = allActiveTasks
    .filter((t) => t.status === "PLANNED")
    .sort((a, b) => TASK_TYPE_ORDER.indexOf(a.taskType) - TASK_TYPE_ORDER.indexOf(b.taskType))

  const completedToday = taskSummary.completedTasks.filter((t) => isToday(t.completedAt))
  const completedTodayCount = completedToday.length
  const totalTaskCount = allActiveTasks.length + completedTodayCount
  const plannedMinutes = allActiveTasks.reduce((s, t) => s + t.durationMinutes, 0)
  const progressPercent =
    totalTaskCount === 0 ? 100 : Math.round((completedTodayCount / totalTaskCount) * 100)

  const groupedPlanned = TASK_TYPE_ORDER.map((taskType) => ({
    taskType,
    tasks: plannedTasks.filter((t) => t.taskType === taskType),
  })).filter((g) => g.tasks.length > 0)

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <AuthGuard>
      <DashboardLayout>
        {/* ── Focus Mode overlay (portal) ─────────────────────────────── */}
        {inProgressTask && (
          <FocusMode
            task={inProgressTask}
            onComplete={() => handleCompleteTask(inProgressTask.id)}
            onAbandon={() => handleAbandonTask(inProgressTask.id)}
            completing={completingTaskId === inProgressTask.id}
            abandoning={abandoningTaskId === inProgressTask.id}
          />
        )}

        {/* ── Session completion modal (portal) ───────────────────────── */}
        {completedTask && (
          <SessionComplete
            task={completedTask}
            onDismiss={() => setCompletedTask(null)}
          />
        )}

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

          {/* ── Hero / Progress strip ─────────────────────────────────── */}
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
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <span>{allActiveTasks.length} open</span>
                  <span>{completedTodayCount} done</span>
                  <span>{formatMinutes(plannedMinutes)} left</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Stat cards ───────────────────────────────────────────────── */}
          <div className="reveal-up reveal-delay-1 mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-l-4 border-l-primary bg-card/80">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Momentum Score</CardTitle>
                <Zap className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{dashboard.momentumScore}</div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">Your composite discipline signal</p>
              </CardContent>
            </Card>

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

            <Card className="border-l-4 border-l-emerald-500 bg-card/80 sm:col-span-2 lg:col-span-1">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Today's Progress</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedTodayCount} of {totalTaskCount}</div>
                <p className="mt-1 text-xs font-medium text-muted-foreground">tasks completed today</p>
              </CardContent>
            </Card>
          </div>

          {/* ── Main grid ────────────────────────────────────────────────── */}
          <div className="reveal-up reveal-delay-2 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,1fr)] lg:items-start">

            {/* Today's task sequence */}
            <Card className="order-2 overflow-hidden bg-card/90 lg:order-1">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Today's Sequence
                </CardTitle>
                <CardDescription>
                  Move left to right through the commitments that still need attention.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">

                {/* ── IN_PROGRESS task — shown prominently at top ── */}
                {inProgressTask && (() => {
                  const meta = TASK_TYPE_META[inProgressTask.taskType]
                  const InProgressIcon = meta.icon
                  return (
                    <section className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge className={meta.badgeClassName}>
                          <InProgressIcon className="mr-1 h-3.5 w-3.5" />
                          {meta.label}
                        </Badge>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 dark:text-indigo-400">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500" />
                          </span>
                          In Progress
                        </span>
                      </div>
                      <div className={`rounded-lg border-2 border-indigo-400/40 p-4 shadow-md ${meta.railClassName}`}>
                        <p className="mb-3 font-semibold leading-tight">{inProgressTask.title}</p>
                        <TaskTimer
                          startedAt={inProgressTask.startedAt}
                          durationMinutes={inProgressTask.durationMinutes}
                        />
                        <p className="mt-3 text-center text-xs text-muted-foreground/60">
                          Focus Mode is holding this session. Complete or abandon from the focus card.
                        </p>
                      </div>
                    </section>
                  )
                })()}

                {/* ── PLANNED task groups ── */}
                {groupedPlanned.length === 0 && !inProgressTask ? (
                  <div className="rounded-lg border border-dashed bg-muted/20 p-8 text-center">
                    <p className="text-lg font-semibold">No active tasks right now</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      You're caught up. Head to Tasks to plan more.
                    </p>
                    <Button variant="outline" className="mt-4 gap-2" onClick={() => router.push("/tasks")}>
                      Open Tasks <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  groupedPlanned.map((group, groupIndex) => {
                    const meta = TASK_TYPE_META[group.taskType]
                    const GroupIcon = meta.icon
                    return (
                      <section
                        key={group.taskType}
                        className={`space-y-3 transition-opacity duration-300 ${hasActiveSession ? "opacity-50" : ""}`}
                        style={{ animationDelay: `${groupIndex * 90}ms` }}
                      >
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
                              className={`min-w-[240px] rounded-lg border p-4 shadow-sm transition-all duration-300 sm:min-w-[280px] ${meta.railClassName} ${hasActiveSession ? "cursor-not-allowed" : "hover:-translate-y-1 hover:shadow-md"}`}
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
                                id={`dashboard-start-task-${task.id}`}
                                onClick={() => handleStartTask(task.id)}
                                disabled={hasActiveSession || startingTaskId === task.id}
                              >
                                {startingTaskId === task.id ? (
                                  <>
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    Starting…
                                  </>
                                ) : hasActiveSession ? (
                                  <>
                                    <Check className="h-4 w-4" />
                                    Session Active
                                  </>
                                ) : (
                                  <>
                                    <Play className="h-4 w-4" />
                                    Start Focus
                                  </>
                                )}
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

            {/* Sidebar */}
            <div className="order-1 space-y-6 lg:order-2">

              {/* Workout card */}
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
                              {workoutSubmitting ? "Updating…" : "Undo"}
                            </Button>
                          </div>
                        ) : (
                          <Button
                            className="gap-2"
                            onClick={() => handleWorkoutToggle(true)}
                            disabled={workoutSubmitting}
                          >
                            <Activity className="h-4 w-4" />
                            {workoutSubmitting ? "Logging…" : "Log Workout"}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Today at a Glance */}
              <Card>
                <CardHeader>
                  <CardTitle>Today at a Glance</CardTitle>
                  <CardDescription>A quick read on what remains before the day feels complete.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-muted-foreground">Tasks still open</div>
                    <div className="mt-1 text-2xl font-bold">{allActiveTasks.length}</div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-muted-foreground">Time still planned</div>
                    <div className="mt-1 text-2xl font-bold">
                      {formatMinutes(allActiveTasks.reduce((s, t) => s + t.durationMinutes, 0))}
                    </div>
                  </div>
                  <div className="rounded-lg border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-muted-foreground">Next best focus</div>
                    <div className="mt-1 text-base font-semibold">
                      {inProgressTask
                        ? `${TASK_TYPE_META[inProgressTask.taskType].label} in session`
                        : groupedPlanned[0]
                          ? TASK_TYPE_META[groupedPlanned[0].taskType].label
                          : "Nothing queued"}
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
