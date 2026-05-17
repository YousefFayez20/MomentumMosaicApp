"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { motion } from "framer-motion"
import { apiClient, type TaskResponse, type ApiError } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus, Check, Trash2, Clock, Edit2, Brain, Zap, Dumbbell,
  ListTodo, History, Layers, CheckCircle2, Play,
} from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { BrandedLoader } from "@/components/branded-loader"
import { TaskTimer } from "@/components/task-timer"
import { FocusMode } from "@/components/focus-mode"
import { isToday, getOrdinal } from "@/lib/utils"

// ─── Constants ────────────────────────────────────────────────────────────────

const TASK_TYPE_ORDER: Array<TaskResponse["taskType"]> = ["DEEP", "SHALLOW", "FITNESS"]

const TASK_TYPE_META: Record<
  TaskResponse["taskType"],
  {
    label: string
    icon: typeof Brain
    railClassName: string
    markerClassName: string
    textClassName: string
    borderActive: string
  }
> = {
  DEEP: {
    label: "Deep Work",
    icon: Brain,
    railClassName: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/20",
    markerClassName: "bg-indigo-500",
    textClassName: "text-indigo-700 dark:text-indigo-300",
    borderActive: "border-indigo-400/60",
  },
  SHALLOW: {
    label: "Shallow Work",
    icon: Zap,
    railClassName: "border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20",
    markerClassName: "bg-sky-500",
    textClassName: "text-sky-700 dark:text-sky-300",
    borderActive: "border-sky-400/60",
  },
  FITNESS: {
    label: "Fitness",
    icon: Dumbbell,
    railClassName: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20",
    markerClassName: "bg-emerald-500",
    textClassName: "text-emerald-700 dark:text-emerald-300",
    borderActive: "border-emerald-400/60",
  },
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null)

  // Action loading states
  const [startingTaskId, setStartingTaskId] = useState<number | null>(null)
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null)
  const [abandoningTaskId, setAbandoningTaskId] = useState<number | null>(null)
  const [celebratingStats, setCelebratingStats] = useState<{ task: TaskResponse; countToday: number } | null>(null)

  // ─── Data fetching ────────────────────────────────────────────────────────────

  const fetchTasks = async () => {
    if (!user?.userId) { setLoading(false); return }
    try {
      setLoading(true)
      const data = await apiClient.getTasks()
      setTasks(data)
    } catch (err) {
      const apiError = err as ApiError
      if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
        router.push("/complete-profile"); return
      }
      if (apiError.status === 401) {
        router.push("/login"); return
      }
      toast({ title: "Could not load tasks", description: "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTasks() }, [user])

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleStartTask = async (taskId: number) => {
    if (!user?.userId) return
    try {
      setStartingTaskId(taskId)
      await apiClient.startTask(taskId)
      toast({ title: "Focus session started", description: "Stay focused. The clock is ticking." })
      await fetchTasks()
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
      
      const taskBefore = tasks.find(t => t.id === taskId)
      const wasInProgress = taskBefore?.status === "IN_PROGRESS"
      
      const task = await apiClient.completeTask(taskId)
      
      const countToday = tasks.filter(t => t.completed && t.taskType === task.taskType && isToday(t.completedAt)).length + 1
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

      await fetchTasks()
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
      await fetchTasks()
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

  const handleDeleteTask = async (taskId: number) => {
    if (!user?.userId) return
    try {
      await apiClient.deleteTask(taskId)
      toast({ title: "Task removed", description: "It's been removed from your list." })
      await fetchTasks()
    } catch {
      toast({ title: "Could not remove task", description: "Please try again.", variant: "destructive" })
    }
  }

  // ─── Derived state ────────────────────────────────────────────────────────────

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)
  const totalActiveMinutes = activeTasks.reduce((s, t) => s + t.durationMinutes, 0)

  // Single-active enforcement
  const inProgressTask = activeTasks.find((t) => t.status === "IN_PROGRESS") ?? null
  const hasActiveSession = inProgressTask !== null

  const plannedTasks = activeTasks.filter((t) => t.status === "PLANNED")
  const groupedPlanned = TASK_TYPE_ORDER.map((taskType) => ({
    taskType,
    tasks: plannedTasks.filter((t) => t.taskType === taskType),
  })).filter((g) => g.tasks.length > 0)

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <AuthGuard>
      <DashboardLayout>

        {/* ── Focus Mode overlay (portal) ───────────────────────────────── */}
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

          {/* ── Page header ───────────────────────────────────────────────── */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="command-surface mb-10 flex flex-col gap-5 rounded-2xl p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8 hover-premium">
            <div>
              <p className="mb-3 tracking-widest text-xs font-bold uppercase text-muted-foreground/80">Commitment board</p>
              <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Tasks</h2>
              <p className="mt-2 text-muted-foreground">Your active commitments and completed work</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 rounded-full px-5 shadow-lg shadow-primary/15" id="create-task-btn">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </motion.div>

          {loading ? (
            <BrandedLoader className="h-64" label="Loading tasks" />
          ) : (
            <>
              {/* ── Stat row ────────────────────────────────────────────── */}
              <div className="reveal-up reveal-delay-1 mb-10 grid gap-5 sm:grid-cols-2 lg:max-w-3xl">
                <Card className="border border-white/60 bg-gradient-to-br from-card/80 to-muted/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] backdrop-blur-xl hover-premium rounded-2xl">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                      <div className="text-2xl font-bold">{activeTasks.length}</div>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <ListTodo className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-white/60 bg-gradient-to-br from-card/80 to-muted/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] backdrop-blur-xl hover-premium rounded-2xl">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <div className="text-2xl font-bold">{completedTasks.length}</div>
                    </div>
                    <div className="rounded-full bg-green-500/10 p-3 text-green-500">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* ── Tabs ─────────────────────────────────────────────────── */}
              <Tabs defaultValue="active" className="reveal-up reveal-delay-2 w-full">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <TabsList className="grid w-full max-w-md grid-cols-2 rounded-xl p-1 bg-white/40 shadow-sm border border-white/60 backdrop-blur-md">
                    <TabsTrigger value="active" className="rounded-full">
                      Active ({activeTasks.length})
                    </TabsTrigger>
                    <TabsTrigger value="completed" className="rounded-full">
                      Completed ({completedTasks.length})
                    </TabsTrigger>
                  </TabsList>
                  <p className="text-sm text-muted-foreground">
                    {activeTasks.length > 0
                      ? `${formatMinutes(totalActiveMinutes)} still planned`
                      : "No active time planned right now"}
                  </p>
                </div>

                {/* ── Active tab ─────────────────────────────────────────── */}
                <TabsContent value="active" className="mt-0">
                  {activeTasks.length === 0 ? (
                    <Card className="border-white/60 bg-white/40 shadow-sm backdrop-blur-xl rounded-2xl border-dashed">
                      <CardContent className="flex h-64 flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                          <Layers className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No active tasks</h3>
                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                          You're all caught up. Add a task when you're ready to plan the next block.
                        </p>
                        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 rounded-full">
                          <Plus className="h-4 w-4" />
                          Create New Task
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-7">

                      {/* ── IN_PROGRESS task — always first ──────────────── */}
                      {inProgressTask && (() => {
                        const meta = TASK_TYPE_META[inProgressTask.taskType]
                        const TypeIcon = meta.icon
                        return (
                          <section className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center gap-2 text-sm font-semibold ${meta.textClassName}`}>
                                <TypeIcon className="h-4 w-4" />
                                {meta.label}
                              </div>
                              <span className="flex items-center gap-1.5 text-xs font-semibold text-indigo-500 dark:text-indigo-400">
                                <span className="relative flex h-1.5 w-1.5">
                                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500 breathe-opacity" />
                                </span>
                                In Progress
                              </span>
                            </div>

                            <div
                              className={`group rounded-xl border-2 p-6 shadow-lg shadow-indigo-500/5 bg-gradient-to-br from-indigo-50/80 to-white/60 ${meta.borderActive}`}
                            >
                              <div className="mb-4 flex items-start justify-between">
                                <span className={`mt-1 h-2 w-8 rounded-full ${meta.markerClassName}`} />
                                {/* No edit/delete during active session */}
                              </div>
                              <div className="space-y-4">
                                <p className="font-mono text-xs font-bold text-muted-foreground/60">01</p>
                                <h3 className="line-clamp-2 text-2xl font-bold leading-tight text-primary">
                                  {inProgressTask.title}
                                </h3>
                                <TaskTimer
                                  startedAt={inProgressTask.startedAt}
                                  durationMinutes={inProgressTask.durationMinutes}
                                />
                                <p className="text-center text-xs text-muted-foreground/60">
                                  Focus Mode is holding this session. Complete or abandon from the focus card.
                                </p>
                              </div>
                            </div>
                          </section>
                        )
                      })()}

                      {/* ── PLANNED tasks, grouped by type ────────────────── */}
                      {groupedPlanned.map((group) => {
                        const meta = TASK_TYPE_META[group.taskType]
                        const GroupIcon = meta.icon

                        return (
                          <section
                            key={group.taskType}
                            className={`space-y-3 transition-opacity duration-300 ${hasActiveSession ? "opacity-45" : ""}`}
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className={`flex items-center gap-2 text-sm font-semibold ${meta.textClassName}`}>
                                <GroupIcon className="h-4 w-4" />
                                {meta.label}
                              </div>
                              <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground/70">
                                {group.tasks.length} {group.tasks.length === 1 ? "commitment" : "commitments"}
                              </span>
                            </div>

                            <div className="commitment-rail flex gap-4 overflow-x-auto pb-4">
                              {group.tasks.map((task, taskIndex) => (
                                <div
                                  key={task.id}
                                  className={`group min-w-[260px] rounded-xl border border-white/60 bg-white/40 p-5 shadow-sm backdrop-blur-md sm:min-w-[320px] ${meta.railClassName} ${hasActiveSession ? "cursor-not-allowed opacity-50 grayscale-[20%]" : "hover-premium"}`}
                                >
                                  <div className="mb-4 flex items-center justify-between">
                                    <span className={`h-2 w-8 rounded-full ${meta.markerClassName}`} />
                                    {/* Action buttons only when no session active */}
                                    {!hasActiveSession && (
                                      <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          id={`complete-directly-task-${task.id}`}
                                          onClick={() => handleCompleteTask(task.id)}
                                          className="h-8 w-8 hover:bg-green-500/10 hover:text-green-500"
                                        >
                                          <Check className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          id={`edit-task-${task.id}`}
                                          onClick={() => setEditingTask(task)}
                                          className="h-8 w-8 hover:bg-background/60"
                                        >
                                          <Edit2 className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          id={`delete-task-${task.id}`}
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <p className="mb-2 font-mono text-xs font-bold text-muted-foreground/60">
                                        {String(taskIndex + 1).padStart(2, "0")}
                                      </p>
                                      <h3 className="line-clamp-2 min-h-[3rem] text-lg font-bold leading-tight text-primary">
                                        {task.title}
                                      </h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span>{task.durationMinutes} minutes</span>
                                    </div>

                                    <Button
                                      id={`start-task-${task.id}`}
                                      onClick={() => handleStartTask(task.id)}
                                      className="w-full gap-2"
                                      variant="secondary"
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
                                </div>
                              ))}
                            </div>
                          </section>
                        )
                      })}
                    </div>
                  )}
                </TabsContent>

                {/* ── Completed tab ──────────────────────────────────────── */}
                <TabsContent value="completed" className="mt-0">
                  {completedTasks.length === 0 ? (
                    <Card className="border-white/60 bg-white/40 shadow-sm backdrop-blur-xl rounded-2xl border-dashed">
                      <CardContent className="flex h-64 flex-col items-center justify-center text-center">
                        <History className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          No completed tasks yet. Finished work will appear here.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                      {completedTasks.map((task) => (
                        <Card
                          key={task.id}
                          className="border border-white/60 bg-gradient-to-br from-card/40 to-muted/20 shadow-sm backdrop-blur-xl rounded-2xl opacity-80 hover-premium hover:opacity-100"
                        >
                          <CardHeader className="pb-3 border-b border-white/30 bg-white/20">
                            <div className="flex items-start justify-between">
                              <Badge variant="outline" className="opacity-70">
                                {task.taskType}
                              </Badge>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleDeleteTask(task.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                            <CardTitle className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">
                              {task.title}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Completed
                              {task.completedAt && ` ${new Date(task.completedAt).toLocaleDateString()}`}
                            </div>
                            {/* Actual vs estimated time */}
                            {task.actualMinutes != null ? (
                              <div className="flex items-center gap-3 text-xs text-muted-foreground/70">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Actual: {task.actualMinutes}m
                                </div>
                                <span className="text-muted-foreground/40">vs</span>
                                <div>Est: {task.durationMinutes}m</div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground/70">
                                <Clock className="h-3 w-3" />
                                {task.durationMinutes} min
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </>
          )}

          <CreateTaskDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} onSuccess={fetchTasks} />
          {editingTask && (
            <EditTaskDialog
              task={editingTask}
              open={!!editingTask}
              onOpenChange={(open) => !open && setEditingTask(null)}
              onSuccess={fetchTasks}
            />
          )}
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
