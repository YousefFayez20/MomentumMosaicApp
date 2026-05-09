"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type TaskResponse, type ApiError } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Check, Trash2, Clock, Edit2, Brain, Zap, Dumbbell, ListTodo, History, Layers, CheckCircle2 } from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { BrandedLoader } from "@/components/branded-loader"

const TASK_TYPE_ORDER: Array<TaskResponse["taskType"]> = ["DEEP", "SHALLOW", "FITNESS"]

const TASK_TYPE_META: Record<
  TaskResponse["taskType"],
  { label: string; icon: typeof Brain; railClassName: string; markerClassName: string; textClassName: string }
> = {
  DEEP: {
    label: "Deep Work",
    icon: Brain,
    railClassName: "border-indigo-200 bg-indigo-50/70 dark:border-indigo-900/60 dark:bg-indigo-950/20",
    markerClassName: "bg-indigo-500",
    textClassName: "text-indigo-700 dark:text-indigo-300",
  },
  SHALLOW: {
    label: "Shallow Work",
    icon: Zap,
    railClassName: "border-sky-200 bg-sky-50/70 dark:border-sky-900/60 dark:bg-sky-950/20",
    markerClassName: "bg-sky-500",
    textClassName: "text-sky-700 dark:text-sky-300",
  },
  FITNESS: {
    label: "Fitness",
    icon: Dumbbell,
    railClassName: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/60 dark:bg-emerald-950/20",
    markerClassName: "bg-emerald-500",
    textClassName: "text-emerald-700 dark:text-emerald-300",
  },
}

function formatMinutes(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}

export default function TasksPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [tasks, setTasks] = useState<TaskResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskResponse | null>(null)

  const fetchTasks = async () => {
    if (!user) return
    if (!user.userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await apiClient.getTasks()
      setTasks(data)
    } catch (err) {
      const apiError = err as ApiError
      console.error("[Tasks] Fetch error:", apiError)

      if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
        router.push("/complete-profile")
        return
      }

      if (apiError.status === 401) {
        router.push("/login")
        return
      }

      toast({
        title: "Could not load tasks",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user])

  const handleCompleteTask = async (taskId: number) => {
    if (!user?.userId) return

    try {
      await apiClient.completeTask(taskId)
      toast({
        title: "Task completed",
        description: "Nice work. One less thing on the plate.",
      })
      fetchTasks()
    } catch (err) {
      toast({
        title: "Could not complete task",
        description: "Please try again.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!user?.userId) return

    try {
      await apiClient.deleteTask(taskId)
      toast({
        title: "Task removed",
        description: "It's been removed from your list.",
      })
      fetchTasks()
    } catch (err) {
      toast({
        title: "Could not remove task",
        description: "Please try again.",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)
  const totalActiveMinutes = activeTasks.reduce((sum, t) => sum + t.durationMinutes, 0)
  const groupedActiveTasks = TASK_TYPE_ORDER.map((taskType) => ({
    taskType,
    tasks: activeTasks.filter((task) => task.taskType === taskType),
  })).filter((group) => group.tasks.length > 0)

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="reveal-up mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Commitment board</p>
              <h2 className="text-3xl font-bold">Tasks</h2>
              <p className="text-muted-foreground">Your active commitments and completed work</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          {loading ? (
            <BrandedLoader className="h-64" label="Loading tasks" />
          ) : (
            <>
              <div className="reveal-up reveal-delay-1 mb-8 grid gap-4 sm:grid-cols-2 lg:max-w-3xl">
                <Card className="border-l-4 border-l-primary bg-card/80 shadow-sm transition-all hover:shadow-md">
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

                <Card className="border-l-4 border-l-green-500 bg-card/80 shadow-sm transition-all hover:shadow-md">
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

              <Tabs defaultValue="active" className="reveal-up reveal-delay-2 w-full">
                <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <TabsList className="grid w-full max-w-md grid-cols-2 rounded-full p-1">
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

                <TabsContent value="active" className="mt-0">
                  {activeTasks.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex h-64 flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                          <Layers className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No active tasks</h3>
                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                          You're all caught up for now. Add a task when you're ready to plan the next block.
                        </p>
                        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 rounded-full">
                          <Plus className="h-4 w-4" />
                          Create New Task
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-7">
                      {groupedActiveTasks.map((group) => {
                        const meta = TASK_TYPE_META[group.taskType]
                        const GroupIcon = meta.icon

                        return (
                          <section key={group.taskType} className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className={`flex items-center gap-2 text-sm font-semibold ${meta.textClassName}`}>
                                <GroupIcon className="h-4 w-4" />
                                {meta.label}
                              </div>
                              <span className="text-xs font-medium uppercase text-muted-foreground">
                                {group.tasks.length} {group.tasks.length === 1 ? "commitment" : "commitments"}
                              </span>
                            </div>

                            <div className="commitment-rail flex gap-3 overflow-x-auto pb-3">
                              {group.tasks.map((task, taskIndex) => (
                                <div
                                  key={task.id}
                                  className={`group min-w-[250px] rounded-lg border p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:min-w-[300px] ${meta.railClassName}`}
                                >
                                  <div className="mb-4 flex items-center justify-between">
                                    <span className={`h-2 w-8 rounded-full ${meta.markerClassName}`} />
                                    <div className="flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => setEditingTask(task)}
                                        className="h-8 w-8 hover:bg-background/60"
                                      >
                                        <Edit2 className="h-3.5 w-3.5" />
                                      </Button>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDeleteTask(task.id)}
                                        className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="mb-1 font-mono text-xs text-muted-foreground">
                                        {String(taskIndex + 1).padStart(2, "0")}
                                      </p>
                                      <h3 className="line-clamp-2 min-h-12 text-lg font-semibold leading-tight">{task.title}</h3>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Clock className="h-4 w-4" />
                                      <span>{task.durationMinutes} minutes</span>
                                    </div>
                                    <Button
                                      onClick={() => handleCompleteTask(task.id)}
                                      className="w-full gap-2"
                                      variant="secondary"
                                    >
                                      <Check className="h-4 w-4" />
                                      Mark Complete
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

                <TabsContent value="completed" className="mt-0">
                  {completedTasks.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex h-64 flex-col items-center justify-center text-center">
                        <History className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No completed tasks yet. Finished work will appear here.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {completedTasks.map((task) => (
                        <Card
                          key={task.id}
                          className="border-l-4 border-l-muted opacity-75 transition-opacity hover:opacity-100"
                        >
                          <CardHeader className="pb-3">
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
                          <CardContent>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              Completed
                              {task.completedAt && ` ${new Date(task.completedAt).toLocaleDateString()}`}
                            </div>
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground/70">
                              <Clock className="h-3 w-3" />
                              {task.durationMinutes} min
                            </div>
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
