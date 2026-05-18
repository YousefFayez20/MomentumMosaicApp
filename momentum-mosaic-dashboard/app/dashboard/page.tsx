"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { apiClient, type DashboardResponse, type ApiError, type TaskResponse } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2, Clock, Activity, Mountain, ArrowRight,
  Brain, Zap, Dumbbell, Flame, Target, Check, Play, Lock,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { BrandedLoader } from "@/components/branded-loader"
import { useToast } from "@/hooks/use-toast"
import { TaskTimer } from "@/components/task-timer"
import { FocusMode } from "@/components/focus-mode"
import { getOrdinal, isToday } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const TASK_TYPE_ORDER: Array<TaskResponse["taskType"]> = ["DEEP", "SHALLOW", "FITNESS"]

const TASK_TYPE_META: Record<
  TaskResponse["taskType"],
  { label: string; icon: typeof Brain; badgeClassName: string; railClassName: string; markerClassName: string }
> = {
  DEEP: {
    label: "Deep Focus",
    icon: Brain,
    badgeClassName: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300",
    railClassName: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/20",
    markerClassName: "bg-indigo-500",
  },
  SHALLOW: {
    label: "Light Focus",
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

function formatCompletedTime(dateStr: string) {
  try {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  } catch (e) {
    return ""
  }
}

function getReadinessHint(taskType: string) {
  switch (taskType) {
    case "DEEP_WORK":
      return "Ideal for deep, uninterrupted mental immersion."
    case "SHALLOW_WORK":
      return "Excellent for maintaining administrative and operational momentum."
    case "FITNESS":
      return "Best tackled for bodily recovery and physical focus."
    default:
      return "Ready when you are to lock in focus."
  }
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
  const [celebratingStats, setCelebratingStats] = useState<{ task: TaskResponse; countToday: number } | null>(null)
  const [historyExpanded, setHistoryExpanded] = useState(false)

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

      const taskBefore = dashboard?.taskSummary.activeTasks.find(t => t.id === taskId)
      const wasInProgress = taskBefore?.status === "IN_PROGRESS"

      const task = await apiClient.completeTask(taskId)

      const countToday = (dashboard?.taskSummary.completedTasks || []).filter(t => t.taskType === task.taskType && isToday(t.completedAt)).length + 1
      const typeLabel = TASK_TYPE_META[task.taskType].label

      let description = ""
      if (wasInProgress) {
        const actual = task.actualMinutes ?? task.durationMinutes
        description = `${typeLabel}: ${actual} min (estimated ${task.durationMinutes})`
      } else {
        description = `${typeLabel} complete \u2014 ${task.durationMinutes} min.`
      }

      toast({
        title: "Session logged",
        description: (
          <div className="space-y-1.5 mt-1.5">
            <p className="text-sm font-medium">{description}</p>
            {task.taskType === "DEEP" && (
              <p className="text-xs text-muted-foreground">That's your {getOrdinal(countToday)} deep work session today.</p>
            )}
          </div>
        )
      })

      if (wasInProgress) {
        setCelebratingStats({ task, countToday })
      }

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
        {(inProgressTask || celebratingStats) && (
          <FocusMode
            task={celebratingStats ? celebratingStats.task : inProgressTask!}
            isCelebrating={!!celebratingStats}
            completedCountToday={celebratingStats?.countToday ?? 0}
            onComplete={() => handleCompleteTask(inProgressTask!.id)}
            onAbandon={() => handleAbandonTask(inProgressTask!.id)}
            onCloseCelebration={() => setCelebratingStats(null)}
            completing={completingTaskId === (inProgressTask?.id ?? -1)}
            abandoning={abandoningTaskId === (inProgressTask?.id ?? -1)}
          />
        )}

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

          {/* Shallow Top Momentum Overview Surface */}
          <div className="mb-8 bg-white/50 dark:bg-muted/[0.03] border border-white/60 dark:border-white/5 backdrop-blur-md rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative overflow-hidden shadow-xs">
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/60 uppercase">Today's Momentum</span>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-primary mt-0.5">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
              </h1>
              <p className="text-[10.5px] font-semibold text-muted-foreground/50 mt-1 uppercase tracking-wider">
                Structured execution • One active session at a time
              </p>
            </div>
            
            <div className="flex flex-col sm:items-end gap-1 shrink-0 text-left sm:text-right">
              <div className="text-xs font-bold text-muted-foreground/75 uppercase tracking-wide">
                {completedTodayCount} completed <span className="text-muted-foreground/30">•</span> {allActiveTasks.length} remaining <span className="text-muted-foreground/30">•</span> {formatMinutes(plannedMinutes)} planned
              </div>
              <span className="text-[10px] font-bold text-indigo-500/80 dark:text-indigo-400/80">
                Focus Ratio: {progressPercent}%
              </span>
            </div>

            {/* Thin Atmospheric Environmental Progress Track */}
            <div className="h-1 w-full bg-primary/5 dark:bg-white/5 absolute bottom-0 left-0">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 transition-all duration-700 ease-out" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* ── Main Workspace Grid with Focus-State Transformation ── */}
          <div className={`relative transition-all duration-1000 ease-in-out ${hasActiveSession ? "bg-black/[0.02] dark:bg-black/20 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10 rounded-[2.5rem]" : ""}`}>
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }} className="grid gap-10 lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)] lg:items-start relative z-10">

              {/* Workspace Execution Column Container (Left Panel Surface) */}
              <div className={`order-2 space-y-8 lg:order-1 bg-white/40 dark:bg-muted/[0.03] backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.4)] transition-all duration-700`}>
                
                {/* ── EMPTY STATE ── */}
                {allActiveTasks.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-muted/30 bg-muted/5 p-12 text-center">
                    <p className="text-lg font-semibold">No active focus blocks today</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Your workspace is clear. Go to Tasks to plan your day.
                    </p>
                    <Button variant="outline" className="mt-6 gap-2 cursor-pointer rounded-full" onClick={() => router.push("/tasks")}>
                      Plan Your Day <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="relative pl-8 space-y-8">
                    {/* The Solid Premium Timeline Spine */}
                    <div className={`absolute left-[13.5px] top-8 bottom-6 w-[1px] border-l border-solid transition-opacity duration-700 ${hasActiveSession ? "opacity-20 border-muted/50" : "opacity-100 border-muted/30 dark:border-muted/20"}`} />

                    {/* Labeled Section Divider: Active Commitment */}
                    <div className="border-b border-border/5 pb-2.5">
                      <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/50">
                        Active Commitment
                      </h4>
                    </div>

                    {/* ── NOW: ACTIVE COMMITMENT (Absolute Hero Centerpiece) ── */}
                    {(() => {
                      const task = inProgressTask || plannedTasks[0]
                      if (!task) return null
                      
                      const meta = TASK_TYPE_META[task.taskType]
                      const TaskIcon = meta.icon
                      const isCurrentFocus = task.status === "IN_PROGRESS"
                      const readinessHint = getReadinessHint(task.taskType)
                      
                      return (
                        <div className="relative">
                          {/* NOW Stepper Outlined Glowing node (slow breathe opacity, no pulsing alert) */}
                          <div className="absolute left-[-21px] top-4.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background border border-indigo-500 dark:border-indigo-400 shadow-sm z-10">
                            <span className="relative flex h-1.5 w-1.5 rounded-full bg-indigo-500 breathe-slow" />
                          </div>

                          <div className={`relative rounded-xl border border-white/70 dark:border-white/10 bg-gradient-to-br from-card to-muted/20 p-4 sm:p-4.5 shadow-sm premium-card-static`}>
                            
                            {/* Header section with step indicator and minor quick actions */}
                            <div className="flex items-center justify-between border-b border-border/10 pb-2.5 mb-3">
                              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                                {isCurrentFocus ? "Current Focus" : `Next Commitment (1 of ${allActiveTasks.length})`}
                              </span>
                              
                              {!isCurrentFocus && (
                                <div className="flex items-center">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    id={`dashboard-complete-directly-task-${task.id}`}
                                    onClick={() => handleCompleteTask(task.id)}
                                    className="h-7 w-7 rounded-full border border-border/40 bg-background/20 text-muted-foreground/60 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20 transition-all cursor-pointer"
                                    title="Complete directly"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              )}
                            </div>

                            {/* Task details */}
                            <div className="space-y-3.5">
                              <div className="flex items-center gap-2">
                                <Badge className={`px-2 py-0.5 border ${meta.badgeClassName} shadow-none`}>
                                  <TaskIcon className="mr-1.5 h-3 w-3" />
                                  {meta.label}
                                </Badge>
                                {isCurrentFocus && (
                                  <span className="flex items-center gap-1.5 text-xs font-bold tracking-wide uppercase text-indigo-500 dark:text-indigo-400">
                                    <span className="relative flex h-2 w-2">
                                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                                      <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500 breathe-opacity" />
                                    </span>
                                    Live Session
                                  </span>
                                )}
                              </div>
                              
                              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-primary leading-tight">
                                {task.title}
                              </h3>

                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground/70" />
                                  <span>{task.durationMinutes} minutes planned</span>
                                </div>
                                <span className="hidden sm:inline text-muted-foreground/30">•</span>
                                <span className="text-[10.5px] font-medium text-indigo-500/90 dark:text-indigo-400/90 italic">
                                  {readinessHint}
                                </span>
                              </div>

                              {/* Core Action Button - Constrained Elevated Launch Pill */}
                              {isCurrentFocus ? (
                                <div className="pt-1.5">
                                  <TaskTimer
                                    startedAt={task.startedAt}
                                    durationMinutes={task.durationMinutes}
                                  />
                                  <p className="mt-3 text-center text-xs text-muted-foreground/60">
                                    Focus Mode is active. Complete or abandon from the full screen overlay.
                                  </p>
                                </div>
                              ) : (
                                <Button
                                  className="mt-1 w-fit max-w-[60%] gap-2.5 cursor-pointer font-bold py-3 px-5 text-xs sm:text-[13px] rounded-full justify-start mr-auto bg-primary text-primary-foreground border border-transparent shadow-xs hover:bg-primary/95 hover:shadow-md hover:border-primary/20 transition-all duration-300"
                                  id={`dashboard-start-task-${task.id}`}
                                  onClick={() => handleStartTask(task.id)}
                                  disabled={hasActiveSession || startingTaskId === task.id}
                                >
                                  {startingTaskId === task.id ? (
                                    <>
                                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                      Starting Session…
                                    </>
                                  ) : hasActiveSession ? (
                                    <>
                                      <Lock className="h-3 w-3 opacity-80" />
                                      Locked
                                    </>
                                  ) : (
                                    <>
                                      <Play className="h-2.5 w-2.5 fill-current" />
                                      Launch Session
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })()}

                    {/* ── NEXT: STEPPED UPCOMING SEQUENCE WITH ADAPTIVE COMPRESSION (Middle Queue) ── */}
                    {(() => {
                      const upcomingQueue = inProgressTask ? plannedTasks : plannedTasks.slice(1)
                      if (upcomingQueue.length === 0) return null
                      
                      const upcomingMinutes = upcomingQueue.reduce((s, t) => s + t.durationMinutes, 0)
                      
                      // Adaptive compression logic: show max 2 items, collapse the rest.
                      const maxVisible = 2
                      const visibleTasks = upcomingQueue.slice(0, maxVisible)
                      const collapsedCount = upcomingQueue.length - maxVisible
                      
                      return (
                        <div className={`space-y-4 pt-6 border-t border-border/5 transition-all duration-700 ease-in-out ${hasActiveSession ? "opacity-20 pointer-events-none blur-[0.2px]" : "opacity-100"}`}>
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                              Next Flow
                            </h4>
                            <span className="text-[9.5px] font-mono text-muted-foreground/40">
                              {upcomingQueue.length} remaining • {upcomingMinutes}m
                            </span>
                          </div>
                          
                          <div className="space-y-3 pt-1">
                            {visibleTasks.map((task, index) => {
                              const meta = TASK_TYPE_META[task.taskType]
                              const TaskIcon = meta.icon
                              const stepNum = inProgressTask ? index + 1 : index + 2
                              const isNextUp = index === 0
                              
                              return (
                                <div 
                                  key={task.id} 
                                  className={`relative flex items-center justify-between gap-4 p-3 rounded-xl border transition-all duration-300 ${
                                    isNextUp 
                                      ? "border-white/50 dark:border-white/10 bg-white/30 dark:bg-muted/15 opacity-95 hover:border-border/40" 
                                      : "border-white/20 dark:border-white/5 bg-white/10 dark:bg-muted/5 opacity-65 hover:opacity-85 hover:border-border/30"
                                  } group`}
                                >
                                  {/* Stepper Node Bullet - next up is indigo styled to inherit focus momentum */}
                                  <div className={`absolute -left-[20.5px] top-[16.5px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background border shadow-xs z-10 ${
                                    isNextUp ? "border-indigo-400 dark:border-indigo-500" : "border-muted-foreground/30"
                                  }`}>
                                    <span className={`text-[7.5px] font-black ${isNextUp ? "text-indigo-500" : "text-muted-foreground/80"}`}>{stepNum}</span>
                                  </div>
                                  
                                  {/* Task details */}
                                  <div className="min-w-0 flex-1 pl-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <p className={`font-bold leading-tight text-primary truncate ${isNextUp ? "text-sm" : "text-[12.5px]"}`}>
                                        {task.title}
                                      </p>
                                      {isNextUp && (
                                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider shrink-0">
                                          Next Up
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10.5px] font-bold text-muted-foreground/80">
                                      <Badge className={`px-1.5 py-0 text-[8px] border ${meta.badgeClassName} shadow-none`}>
                                        <TaskIcon className="mr-1 h-2.5 w-2.5" />
                                        {meta.label}
                                      </Badge>
                                      <span>•</span>
                                      <span>{task.durationMinutes}m</span>
                                    </div>
                                  </div>
                                  
                                  {/* Inline actions */}
                                  <div className="flex items-center gap-1.5 opacity-60 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    {!hasActiveSession && (
                                      <>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleStartTask(task.id)}
                                          className="h-6 w-6 rounded-full border border-border/40 bg-background/30 text-muted-foreground/75 hover:bg-primary/5 hover:text-primary transition-all cursor-pointer"
                                          title="Start Focus"
                                        >
                                          <Play className="h-2.5 w-2.5 fill-current" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          onClick={() => handleCompleteTask(task.id)}
                                          className="h-6 w-6 rounded-full border border-border/40 bg-background/30 text-muted-foreground/75 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all cursor-pointer"
                                          title="Complete directly"
                                        >
                                          <Check className="h-2.5 w-2.5" />
                                        </Button>
                                      </>
                                    )}
                                    {hasActiveSession && (
                                      <Lock className="h-3 w-3 text-muted-foreground/40" />
                                    )}
                                  </div>
                                </div>
                              )
                            })}
                            
                            {/* Dynamic indicator row for collapsed tasks */}
                            {collapsedCount > 0 && (
                              <div className="relative flex items-center justify-between p-2 rounded-lg bg-muted/5 opacity-55 border border-dashed border-border/10">
                                {/* Connector spine track dot */}
                                <div className="absolute -left-[20.5px] top-[12px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-background border border-dashed border-muted-foreground/20 shadow-none z-10">
                                  <span className="text-[6.5px] font-bold text-muted-foreground/40">+</span>
                                </div>
                                <span className="pl-1.5 text-[10.5px] font-medium text-muted-foreground/70">
                                  + {collapsedCount} later {collapsedCount === 1 ? "commitment" : "commitments"} today
                                </span>
                                <span className="text-[10px] font-mono text-muted-foreground/40 mr-1">
                                  queued
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })()}

                    {/* ── PAST: TRANSLUCENT COMPLETED MOMENTUM PILLS (Bottom Footer) ── */}
                    {completedToday.length > 0 && (
                      <div className={`mt-10 pt-8 border-t border-border/5 space-y-4 transition-all duration-700 ease-in-out ${hasActiveSession ? "opacity-15 pointer-events-none" : "opacity-100"}`}>
                        <div className="relative space-y-3">
                          {/* PAST Stepper timeline node: subtle success check circle */}
                          <div className="absolute left-[-21px] top-[4px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500/50 z-10 border border-emerald-500/20 shadow-none">
                            <Check className="h-2 w-2 stroke-[2.5]" />
                          </div>

                          <div className="flex items-center justify-between pl-1">
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                              Momentum History
                            </span>
                            <span className="text-[9.5px] font-mono text-emerald-600/60 dark:text-emerald-400/50">
                              {completedTodayCount} done today
                            </span>
                          </div>

                          {/* Translucent glass completed task pills */}
                          <div className="flex flex-wrap gap-1.5 pt-1 pl-1 opacity-65 hover:opacity-85 transition-opacity duration-300">
                            {completedToday.map((task) => {
                              const meta = TASK_TYPE_META[task.taskType]
                              const TaskIcon = meta.icon
                              const completedMin = task.actualMinutes ?? task.durationMinutes
                              const timeStr = formatCompletedTime(task.completedAt ?? "")
                              
                              return (
                                <div 
                                  key={task.id} 
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-emerald-500/10 bg-emerald-500/[0.03] dark:bg-emerald-500/[0.01] backdrop-blur-xs text-[10.5px]"
                                >
                                  <div className="flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600/70 dark:text-emerald-400/70">
                                    <Check className="h-2 w-2 stroke-[2]" />
                                  </div>
                                  <span className="font-medium text-muted-foreground/80 line-through truncate max-w-[110px] sm:max-w-[180px]">
                                    {task.title}
                                  </span>
                                  <span className="text-[9px] font-mono text-emerald-600/60 dark:text-emerald-400/50 shrink-0">
                                    ({completedMin}m {timeStr && `at ${timeStr}`})
                                  </span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar Panel Surface (Unified System Support) */}
              <div className={`order-1 space-y-8 lg:order-2 bg-white/45 dark:bg-muted/[0.03] backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-3xl p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] transition-all duration-700 ease-in-out ${hasActiveSession ? "opacity-25 pointer-events-none blur-[0.6px]" : "opacity-100"}`}>
                {/* System Insights Ambient Telemetry (Combined with Glance) */}
                <div className="space-y-6 px-2">
                  <h4 className="text-[10px] font-bold tracking-[0.2em] uppercase text-muted-foreground/50 flex items-center gap-1.5 mb-2">
                    <Zap className="h-3.5 w-3.5 text-indigo-500/60" />
                    System Telemetry
                  </h4>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  {/* Momentum */}
                  <div className="space-y-1.5 border-l-[3px] border-indigo-500/30 pl-3">
                    <div className="text-2xl font-black font-mono text-primary leading-none">{dashboard.momentumScore}</div>
                    <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">Momentum</div>
                  </div>
                  
                  {/* Streak */}
                  <div className="space-y-1.5 border-l-[3px] border-indigo-500/30 pl-3">
                    <div className="text-2xl font-black font-mono text-primary leading-none">{fitnessSummary.workoutStreak}</div>
                    <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">Day Streak</div>
                  </div>
                  
                  {/* Tasks Left */}
                  <div className="space-y-1.5 border-l-[3px] border-muted/30 pl-3">
                    <div className="text-2xl font-black font-mono text-primary leading-none">{allActiveTasks.length}</div>
                    <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">Tasks Open</div>
                  </div>
                  
                  {/* Time Left */}
                  <div className="space-y-1.5 border-l-[3px] border-muted/30 pl-3">
                    <div className="text-2xl font-black font-mono text-primary leading-none">
                      {formatMinutes(allActiveTasks.reduce((s, t) => s + t.durationMinutes, 0))}
                    </div>
                    <div className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-[0.15em]">Time Planned</div>
                  </div>
                </div>
              </div>

              {/* Minimal Ambient Workout Log */}
              <div className="mt-10 border-t border-border/5 pt-8 px-2">
                <div className="flex items-center gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${fitnessSummary.didWorkoutToday ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-500" : "bg-muted/30 text-muted-foreground/40"}`}>
                    {fitnessSummary.didWorkoutToday ? <CheckCircle2 className="h-4 w-4" /> : <Activity className="h-4 w-4" />}
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-muted-foreground/70">
                      {fitnessSummary.didWorkoutToday ? "Workout Logged" : "Daily Workout"}
                    </h3>
                    <div className="pt-0.5">
                      {fitnessSummary.didWorkoutToday ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleWorkoutToggle(false)}
                          disabled={workoutSubmitting}
                          className="h-5 text-[10px] px-0 hover:bg-transparent text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                        >
                          {workoutSubmitting ? "Reverting…" : "Undo Log"}
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="h-6 text-[10px] px-3.5 rounded-full cursor-pointer hover:bg-primary/5 hover:text-primary border-primary/20 transition-colors"
                          onClick={() => handleWorkoutToggle(true)}
                          disabled={workoutSubmitting}
                        >
                          {workoutSubmitting ? "Logging…" : "Log Completion"}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  </AuthGuard>
)
}
