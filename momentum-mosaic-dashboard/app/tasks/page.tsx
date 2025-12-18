"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type TaskResponse, type ApiError } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Check, Trash2, Clock, Edit2, Brain, Zap, Dumbbell, ListTodo, Timer, History, PlayCircle, Layers, CheckCircle2 } from "lucide-react"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

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
      const data = await apiClient.getTasks(user.userId)
      setTasks(data)
    } catch (err) {
      const apiError = err as ApiError
      console.error("[v0] Tasks fetch error:", apiError)

      if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
        router.push("/complete-profile")
        return
      }

      if (apiError.status === 401) {
        router.push("/login")
        return
      }

      toast({
        title: "Error",
        description: "Failed to load tasks",
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
      await apiClient.completeTask(user.userId, taskId)
      toast({
        title: "Success",
        description: "Task marked as complete!",
      })
      fetchTasks()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to complete task",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const handleDeleteTask = async (taskId: number) => {
    if (!user?.userId) return

    try {
      await apiClient.deleteTask(user.userId, taskId)
      toast({
        title: "Success",
        description: "Task deleted successfully",
      })
      fetchTasks()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      })
      console.error(err)
    }
  }

  const activeTasks = tasks.filter((t) => !t.completed)
  const completedTasks = tasks.filter((t) => t.completed)

  const totalActiveMinutes = activeTasks.reduce((sum, t) => sum + t.durationMinutes, 0)
  const totalCompletedMinutes = completedTasks.reduce((sum, t) => sum + t.durationMinutes, 0)

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Tasks</h2>
              <p className="text-muted-foreground">Manage your productivity and fitness tasks</p>
            </div>
            <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </div>

          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary bg-card/50 shadow-sm transition-all hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Tasks</p>
                      <div className="text-3xl font-bold">{activeTasks.length}</div>
                    </div>
                    <div className="rounded-full bg-primary/10 p-3 text-primary">
                      <ListTodo className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 bg-card/50 shadow-sm transition-all hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Active Time</p>
                      <div className="text-3xl font-bold">
                        {Math.floor(totalActiveMinutes / 60)}h {totalActiveMinutes % 60}m
                      </div>
                    </div>
                    <div className="rounded-full bg-blue-500/10 p-3 text-blue-500">
                      <Timer className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500 bg-card/50 shadow-sm transition-all hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Completed</p>
                      <div className="text-3xl font-bold">{completedTasks.length}</div>
                    </div>
                    <div className="rounded-full bg-green-500/10 p-3 text-green-500">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-l-4 border-l-violet-500 bg-card/50 shadow-sm transition-all hover:shadow-md">
                  <CardContent className="flex items-center justify-between p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                      <div className="text-3xl font-bold">
                        {Math.floor(totalCompletedMinutes / 60)}h {totalCompletedMinutes % 60}m
                      </div>
                    </div>
                    <div className="rounded-full bg-violet-500/10 p-3 text-violet-500">
                      <History className="h-6 w-6" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks Tabs */}
              <Tabs defaultValue="active" className="w-full">
                <TabsList className="mb-6 grid w-full max-w-md grid-cols-2 rounded-full p-1">
                  <TabsTrigger value="active" className="rounded-full">Active ({activeTasks.length})</TabsTrigger>
                  <TabsTrigger value="completed" className="rounded-full">Completed ({completedTasks.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="active" className="mt-0">
                  {activeTasks.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="flex h-64 flex-col items-center justify-center p-6 text-center">
                        <div className="mb-4 rounded-full bg-muted p-4">
                          <Layers className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold">No active tasks</h3>
                        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                          You're all caught up! Take a break or create a new task to keep the momentum going.
                        </p>
                        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2 rounded-full">
                          <Plus className="h-4 w-4" />
                          Create New Task
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {activeTasks.map((task) => {
                        let typeStyles = {
                          border: "border-l-slate-500",
                          bg: "bg-slate-50 dark:bg-slate-950/20",
                          icon: <Layers className="h-4 w-4 text-slate-500" />,
                          color: "text-slate-600"
                        }

                        if (task.taskType === "DEEP") {
                          typeStyles = {
                            border: "border-l-indigo-500",
                            bg: "bg-indigo-50/50 dark:bg-indigo-950/20",
                            icon: <Brain className="h-4 w-4 text-indigo-500" />,
                            color: "text-indigo-600 dark:text-indigo-400"
                          }
                        } else if (task.taskType === "SHALLOW") {
                          typeStyles = {
                            border: "border-l-sky-500",
                            bg: "bg-sky-50/50 dark:bg-sky-950/20",
                            icon: <Zap className="h-4 w-4 text-sky-500" />,
                            color: "text-sky-600 dark:text-sky-400"
                          }
                        } else if (task.taskType === "FITNESS") {
                          typeStyles = {
                            border: "border-l-emerald-500",
                            bg: "bg-emerald-50/50 dark:bg-emerald-950/20",
                            icon: <Dumbbell className="h-4 w-4 text-emerald-500" />,
                            color: "text-emerald-600 dark:text-emerald-400"
                          }
                        }

                        return (
                          <Card key={task.id} className={`group relative overflow-hidden border-l-4 transition-all hover:-translate-y-1 hover:shadow-lg ${typeStyles.border}`}>
                            <CardHeader className="pb-3">
                              <div className="mb-2 flex items-start justify-between">
                                <div className={`flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-semibold ${typeStyles.bg} ${typeStyles.color}`}>
                                  {typeStyles.icon}
                                  {task.taskType}
                                </div>
                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => setEditingTask(task)}
                                    className="h-8 w-8 hover:bg-muted"
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
                              <CardTitle className="line-clamp-2 text-lg leading-tight">
                                {task.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>{task.durationMinutes} minutes</span>
                              </div>
                              <Button
                                onClick={() => handleCompleteTask(task.id)}
                                className="w-full gap-2 rounded-full transition-colors group-hover:bg-primary group-hover:text-primary-foreground"
                                variant="secondary"
                              >
                                <Check className="h-4 w-4" />
                                Mark Complete
                              </Button>
                            </CardContent>
                          </Card>
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
                        <p className="text-muted-foreground">No completed tasks yet. Finish a task to see it here!</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {completedTasks.map((task) => (
                        <Card key={task.id} className="border-l-4 border-l-muted opacity-75 transition-opacity hover:opacity-100">
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
                            <CardTitle className="text-lg line-through decoration-muted-foreground/50 text-muted-foreground">
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
