"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  BookOpen,
  Brain,
  ChevronRight,
  Clock,
  ExternalLink,
  Figma,
  Github,
  Globe,
  Info,
  Menu,
  MessageSquare,
  RefreshCw,
  Trash2,
  Youtube,
  Plus,
} from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AuthGuard } from "@/components/auth-guard"
import { BrandedLoader } from "@/components/branded-loader"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  apiClient,
  type ApiError,
  type TaskResponse,
  type WorkspaceEntryResponse,
  type WorkspaceEntryType,
  type WorkspaceResourceResponse,
  type WorkspaceResponse,
  type WorkspaceSectionResponse,
  type WorkspaceSummaryResponse,
} from "@/lib/api"
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog"
import { AddResourceDialog } from "@/components/workspace/add-resource-dialog"
import { cn } from "@/lib/utils"
import { WorkspaceEntryItem, type EntrySaveState } from "@/components/workspace/workspace-entry-item"

interface WorkspacePageProps {
  workspaceId: number
}

type WorkspaceLoadState = {
  workspace: WorkspaceResponse
  sections: WorkspaceSectionResponse[]
  workspaces: WorkspaceSummaryResponse[]
  tasks: TaskResponse[]
}

type WorkspaceGroup = {
  id: string
  label: string
  workspaces: WorkspaceSummaryResponse[]
}

function compareByOrderIndex<T extends { orderIndex: number | null }>(left: T, right: T) {
  return (left.orderIndex ?? Number.MAX_SAFE_INTEGER) - (right.orderIndex ?? Number.MAX_SAFE_INTEGER)
}

function appendEntryToTree(
  entries: WorkspaceEntryResponse[],
  parentEntryId: number | null,
  nextEntry: WorkspaceEntryResponse,
): WorkspaceEntryResponse[] {
  if (parentEntryId === null) {
    return [...entries, nextEntry].sort(compareByOrderIndex)
  }

  return entries.map((entry) => {
    if (entry.id === parentEntryId) {
      return {
        ...entry,
        collapsed: false,
        children: [...entry.children, nextEntry].sort(compareByOrderIndex),
      }
    }

    return {
      ...entry,
      children: appendEntryToTree(entry.children, parentEntryId, nextEntry),
    }
  })
}

function replaceEntryInTree(
  entries: WorkspaceEntryResponse[],
  nextEntry: WorkspaceEntryResponse,
): WorkspaceEntryResponse[] {
  return entries.map((entry) => {
    if (entry.id === nextEntry.id) {
      return {
        ...nextEntry,
        children: entry.children,
      }
    }

    return {
      ...entry,
      children: replaceEntryInTree(entry.children, nextEntry),
    }
  })
}

function removeEntryFromTree(entries: WorkspaceEntryResponse[], entryId: number): WorkspaceEntryResponse[] {
  return entries
    .filter((entry) => entry.id !== entryId)
    .map((entry) => ({
      ...entry,
      children: removeEntryFromTree(entry.children, entryId),
    }))
}

function collectEntryIds(entry: WorkspaceEntryResponse): number[] {
  return [entry.id, ...entry.children.flatMap(collectEntryIds)]
}

function getWorkspaceGroups(
  sections: WorkspaceSectionResponse[],
  workspaces: WorkspaceSummaryResponse[],
): WorkspaceGroup[] {
  const groupedSections = [...sections]
    .sort(compareByOrderIndex)
    .map((section) => ({
      id: `section-${section.id}`,
      label: section.name,
      workspaces: workspaces.filter((workspace) => workspace.sectionId === section.id),
    }))
    .filter((group) => group.workspaces.length > 0)

  const unsectioned = workspaces.filter((workspace) => workspace.sectionId === null)
  if (unsectioned.length > 0) {
    groupedSections.push({
      id: "section-open",
      label: "Open Workspaces",
      workspaces: unsectioned,
    })
  }

  return groupedSections
}

function getSiteIcon(url: string) {
  try {
    const hostname = new URL(url).hostname.toLowerCase()
    if (hostname.includes("youtube.com")) return Youtube
    if (hostname.includes("github.com")) return Github
    if (hostname.includes("medium.com")) return BookOpen
    if (hostname.includes("figma.com")) return Figma
    if (hostname.includes("stackoverflow.com")) return MessageSquare
  } catch {
    // invalid URL
  }
  return Globe
}

function formatTaskStatus(task: TaskResponse) {
  switch (task.status) {
    case "IN_PROGRESS":
      return "In progress"
    case "COMPLETED":
      return "Completed"
    default:
      return "Planned"
  }
}

function FocusTaskCard({ task, onUpdate }: { task: TaskResponse; onUpdate: () => void }) {
  const [loading, setLoading] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (task.status !== "IN_PROGRESS" || !task.startedAt) return
    const started = new Date(task.startedAt).getTime()
    
    const updateTimer = () => {
      const now = new Date().getTime()
      setElapsed(Math.max(0, Math.floor((now - started) / 60000)))
    }
    
    updateTimer()
    const interval = setInterval(updateTimer, 60000)
    return () => clearInterval(interval)
  }, [task.status, task.startedAt])

  const handleAction = async (action: "start" | "complete" | "abandon") => {
    setLoading(true)
    try {
      if (action === "start") await apiClient.startTask(task.id)
      if (action === "complete") await apiClient.completeTask(task.id)
      if (action === "abandon") await apiClient.abandonTask(task.id)
      onUpdate()
    } catch (err) {
      console.error("Failed to update task", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn(
      "rounded-2xl border p-4 shadow-sm transition-colors",
      task.status === "IN_PROGRESS" 
        ? "border-primary/40 bg-primary/5 dark:bg-primary/10 shadow-[0_0_15px_rgba(172,206,197,0.15)]" 
        : "border-white/50 bg-white/70 dark:border-white/5 dark:bg-white/[0.03]"
    )}>
      <p className="text-sm font-semibold text-primary">{task.title}</p>
      
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-muted-foreground">
        <span className={cn(
          "rounded-full px-2.5 py-1",
          task.status === "IN_PROGRESS" ? "bg-primary/20 text-primary" : "bg-primary/8 text-primary"
        )}>
          {task.status === "IN_PROGRESS" && task.startedAt ? `${elapsed} min focused` : formatTaskStatus(task)}
        </span>
        {task.status !== "IN_PROGRESS" && (
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {task.durationMinutes} min planned
          </span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {task.status === "PLANNED" && (
          <Button 
            size="sm" 
            className="w-full rounded-full" 
            onClick={() => handleAction("start")}
            disabled={loading}
          >
            Start Focus
          </Button>
        )}
        {task.status === "IN_PROGRESS" && (
          <>
            <Button 
              size="sm" 
              className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" 
              onClick={() => handleAction("complete")}
              disabled={loading}
            >
              Complete
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              className="flex-1 rounded-full" 
              onClick={() => handleAction("abandon")}
              disabled={loading}
            >
              Abandon
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function formatUpdatedAt(timestamp: string | null) {
  if (!timestamp) return "No recent activity"

  const date = new Date(timestamp)
  return `Updated ${date.toLocaleDateString([], { month: "short", day: "numeric" })}`
}

export function WorkspaceHomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [workspaces, setWorkspaces] = useState<WorkspaceSummaryResponse[]>([])
  const [sections, setSections] = useState<WorkspaceSectionResponse[]>([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const loadWorkspaces = async () => {
    try {
      setLoading(true)
      setError("")
      const [workspaceList, sectionList] = await Promise.all([
        apiClient.getWorkspaces(),
        apiClient.getWorkspaceSections(),
      ])
      setWorkspaces(workspaceList)
      setSections(sectionList)

      if (workspaceList.length > 0) {
        router.replace(`/workspace/${workspaceList[0].id}`)
      }
    } catch (error) {
      const apiError = error as ApiError
      setError(apiError.message || "Could not load workspaces.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWorkspaces()
  }, [])

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <BrandedLoader className="min-h-[50vh]" label="Loading workspace" />
          ) : error ? (
            <div className="rounded-3xl border border-destructive/20 bg-white/70 p-8 text-center shadow-sm backdrop-blur dark:bg-white/[0.03]">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <h1 className="mt-4 text-2xl font-black text-primary">Workspace unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button className="mt-5 rounded-full" onClick={() => void loadWorkspaces()}>
                Try again
              </Button>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="rounded-3xl border border-white/50 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-white/5 dark:bg-white/[0.03]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/65">
                Study Workspace
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-primary">No workspace yet</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                This MVP stays focused on execution inside existing study workspaces. Once a workspace exists, this route
                becomes the calm place to think, write, and stay inside the current DEEP commitment.
              </p>
              <Button className="mt-4 rounded-full" onClick={() => setCreateDialogOpen(true)}>
                Create Workspace
              </Button>
            </div>
            ) : null}
            <CreateWorkspaceDialog
              open={createDialogOpen}
              onOpenChange={setCreateDialogOpen}
              sections={sections}
              onSuccess={(workspace) => {
                router.replace(`/workspace/${workspace.id}`)
              }}
            />
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}

export function WorkspacePage({ workspaceId }: WorkspacePageProps) {
  const router = useRouter()
  const isMobile = useIsMobile()

  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [workspaceData, setWorkspaceData] = useState<WorkspaceLoadState | null>(null)
  const [navigationOpen, setNavigationOpen] = useState(false)
  const [contextOpen, setContextOpen] = useState(false)
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false)
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<string | null>(null)
  const [entrySaveStates, setEntrySaveStates] = useState<Record<number, EntrySaveState>>({})
  const [actionError, setActionError] = useState("")

  const restoreFocusRef = useRef<HTMLElement | null>(null)
  // Map of entryId -> textarea element, used for programmatic focus
  const entryRefsMap = useRef<Map<number, HTMLTextAreaElement>>(new Map())

  const focusEntryById = (entryId: number) => {
    // Use both the ref map (for already-mounted entries) and a DOM query
    // (for entries that just appeared after a state update)
    window.requestAnimationFrame(() => {
      const fromMap = entryRefsMap.current.get(entryId)
      if (fromMap) {
        fromMap.focus()
        fromMap.setSelectionRange(fromMap.value.length, fromMap.value.length)
        return
      }
      // Fallback: data attribute query after new entry renders
      const el = document.querySelector<HTMLTextAreaElement>(`[data-entry-id="${entryId}"]`)
      if (el) {
        el.focus()
        el.setSelectionRange(el.value.length, el.value.length)
      }
    })
  }

  const registerEntryRef = (entryId: number, el: HTMLTextAreaElement | null) => {
    if (el) entryRefsMap.current.set(entryId, el)
    else entryRefsMap.current.delete(entryId)
  }

  const linkedDeepTasks = useMemo(() => {
    if (!workspaceData) return []

    return workspaceData.tasks
      .filter((task) => task.workspaceId === workspaceId && task.taskType === "DEEP")
      .sort((left, right) => {
        const leftScore = left.status === "IN_PROGRESS" ? 0 : left.status === "PLANNED" ? 1 : 2
        const rightScore = right.status === "IN_PROGRESS" ? 0 : right.status === "PLANNED" ? 1 : 2
        return leftScore - rightScore
      })
  }, [workspaceData, workspaceId])

  const workspaceGroups = useMemo(() => {
    if (!workspaceData) return []
    return getWorkspaceGroups(workspaceData.sections, workspaceData.workspaces)
  }, [workspaceData])

  const hasPendingChanges = useMemo(
    () =>
      Object.values(entrySaveStates).some((state) =>
        state === "dirty" || state === "saving" || state === "error",
      ),
    [entrySaveStates],
  )

  const loadWorkspace = async () => {
    try {
      setLoading(true)
      setLoadError("")
      setActionError("")

      const [workspace, sections, workspaces, tasks] = await Promise.all([
        apiClient.getWorkspace(workspaceId),
        apiClient.getWorkspaceSections(),
        apiClient.getWorkspaces(),
        apiClient.getTasks(),
      ])

      setEntrySaveStates({})
      setWorkspaceData({ workspace, sections, workspaces, tasks })
    } catch (error) {
      const apiError = error as ApiError

      if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
        router.push("/complete-profile")
        return
      }

      if (apiError.status === 401) {
        router.push("/login")
        return
      }

      setLoadError(apiError.message || "Could not load this workspace.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadWorkspace()
  }, [workspaceId])

  useEffect(() => {
    if (!hasPendingChanges) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [hasPendingChanges])

  const captureRestoreTarget = () => {
    const activeElement = document.activeElement
    restoreFocusRef.current = activeElement instanceof HTMLElement ? activeElement : null
  }

  const restoreFocus = () => {
    window.requestAnimationFrame(() => {
      restoreFocusRef.current?.focus()
    })
  }

  const handleNavigationSheetChange = (open: boolean) => {
    if (open) {
      captureRestoreTarget()
      setContextOpen(false)
    } else {
      restoreFocus()
    }

    setNavigationOpen(open)
  }

  const handleContextSheetChange = (open: boolean) => {
    if (open) {
      captureRestoreTarget()
      setNavigationOpen(false)
    } else {
      restoreFocus()
    }

    setContextOpen(open)
  }

  const patchWorkspaceEntries = (updater: (entries: WorkspaceEntryResponse[]) => WorkspaceEntryResponse[]) => {
    setWorkspaceData((current) => {
      if (!current) return current

      return {
        ...current,
        workspace: {
          ...current.workspace,
          entries: updater(current.workspace.entries),
        },
      }
    })
  }

  const setEntrySaveState = (entryId: number, state: EntrySaveState) => {
    setEntrySaveStates((current) => {
      if (state === "idle") {
        const nextState = { ...current }
        delete nextState[entryId]
        return nextState
      }

      return {
        ...current,
        [entryId]: state,
      }
    })
  }

  const handleEntrySaved = (updatedEntry: WorkspaceEntryResponse) => {
    setActionError("")
    patchWorkspaceEntries((entries) => replaceEntryInTree(entries, updatedEntry))
  }

  const handleCreateEntry = async (
    parentEntryId: number | null,
    entryType: WorkspaceEntryType,
    content = "",
  ) => {
    try {
      setActionError("")
      const nextEntry = await apiClient.createWorkspaceEntry(workspaceId, {
        parentEntryId,
        entryType,
        content,
      })

      patchWorkspaceEntries((entries) => appendEntryToTree(entries, parentEntryId, nextEntry))
      // Focus the newly created textarea after React re-renders
      focusEntryById(nextEntry.id)
    } catch (error) {
      const apiError = error as ApiError
      setActionError(apiError.message || "Could not add an entry.")
    }
  }

  // Hover-× delete: confirm only when the entry has children (would erase more than expected)
  const handleDeleteEntry = async (entry: WorkspaceEntryResponse) => {
    if (entry.children.length > 0) {
      const ok = window.confirm("Delete this section and all its nested lines?")
      if (!ok) return
    }
    try {
      setActionError("")
      await apiClient.deleteWorkspaceEntry(workspaceId, entry.id)
      patchWorkspaceEntries((entries) => removeEntryFromTree(entries, entry.id))
      const removedIds = new Set(collectEntryIds(entry))
      setEntrySaveStates((current) =>
        Object.fromEntries(
          Object.entries(current).filter(([entryId]) => !removedIds.has(Number(entryId))),
        ),
      )
    } catch (error) {
      const apiError = error as ApiError
      setActionError(apiError.message || "Could not delete this entry.")
    }
  }

  const handleDeleteResource = async (resourceId: number) => {
    try {
      setActionError("")
      await apiClient.deleteWorkspaceResource(workspaceId, resourceId)
      setWorkspaceData((current) => {
        if (!current) return current
        return {
          ...current,
          workspace: {
            ...current.workspace,
            resources: current.workspace.resources.filter((r) => r.id !== resourceId),
          },
        }
      })
    } catch (error) {
      const apiError = error as ApiError
      setActionError(apiError.message || "Could not delete resource.")
    }
  }

  // Keyboard Backspace on empty line: no confirmation, focus previous textarea by DOM order
  const handleDeleteAndFocusPrevious = async (entry: WorkspaceEntryResponse) => {
    // Find the textarea that comes before this one in DOM order, then focus it
    const allTextareas = Array.from(
      document.querySelectorAll<HTMLTextAreaElement>("[data-entry-id]")
    )
    const currentIdx = allTextareas.findIndex(
      (el) => el.getAttribute("data-entry-id") === String(entry.id)
    )
    const prevTextarea = currentIdx > 0 ? allTextareas[currentIdx - 1] : null

    try {
      setActionError("")
      await apiClient.deleteWorkspaceEntry(workspaceId, entry.id)
      patchWorkspaceEntries((entries) => removeEntryFromTree(entries, entry.id))
      setEntrySaveStates((current) => {
        const next = { ...current }
        delete next[entry.id]
        return next
      })
      // Focus the previous line after state update
      window.requestAnimationFrame(() => {
        prevTextarea?.focus()
        if (prevTextarea) {
          prevTextarea.setSelectionRange(prevTextarea.value.length, prevTextarea.value.length)
        }
      })
    } catch (error) {
      const apiError = error as ApiError
      setActionError(apiError.message || "Could not delete this entry.")
    }
  }

  // Type conversion (from slash command or popover)
  const handleConvertType = async (entry: WorkspaceEntryResponse, newType: WorkspaceEntryType) => {
    // Optimistic update
    patchWorkspaceEntries((entries) =>
      replaceEntryInTree(entries, { ...entry, entryType: newType })
    )
    try {
      const updatedEntry = await apiClient.updateWorkspaceEntry(workspaceId, entry.id, {
        entryType: newType,
      })
      patchWorkspaceEntries((entries) => replaceEntryInTree(entries, updatedEntry))
    } catch {
      // Revert on failure
      patchWorkspaceEntries((entries) => replaceEntryInTree(entries, entry))
    }
  }

  const handleToggleCollapse = async (entry: WorkspaceEntryResponse, nextCollapsed: boolean) => {
    patchWorkspaceEntries((entries) =>
      replaceEntryInTree(entries, {
        ...entry,
        collapsed: nextCollapsed,
      }),
    )

    try {
      const updatedEntry = await apiClient.updateWorkspaceEntry(workspaceId, entry.id, {
        collapsed: nextCollapsed,
      })

      patchWorkspaceEntries((entries) => replaceEntryInTree(entries, updatedEntry))
    } catch (error) {
      const apiError = error as ApiError
      patchWorkspaceEntries((entries) =>
        replaceEntryInTree(entries, {
          ...entry,
          collapsed: entry.collapsed,
        }),
      )
      setActionError(apiError.message || "Could not update nested visibility.")
    }
  }

  const handleWorkspaceNavigation = (href: string) => {
    if (hasPendingChanges) {
      setPendingNavigationTarget(href)
      return false
    }

    return true
  }

  const workspace = workspaceData?.workspace

  const navigationSurface = (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/40 px-5 py-4 dark:border-white/5">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
          Study Workspace
        </p>
        <h2 className="mt-2 text-lg font-black tracking-tight text-primary">One calm place to work</h2>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
        {workspaceGroups.map((group) => (
          <section key={group.id} className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
              {group.label}
            </h3>
            <div className="space-y-1.5">
              {group.workspaces.map((groupWorkspace) => {
                const isActive = groupWorkspace.id === workspaceId
                const isWorking = workspaceData?.tasks.some(t => t.workspaceId === groupWorkspace.id && t.status === "IN_PROGRESS")
                return (
                  <Button
                    key={groupWorkspace.id}
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (groupWorkspace.id === workspaceId) {
                        setNavigationOpen(false)
                        return
                      }

                      const href = `/workspace/${groupWorkspace.id}`
                      if (handleWorkspaceNavigation(href)) {
                        router.push(href)
                      }
                    }}
                    className={cn(
                      "h-auto w-full items-start justify-between rounded-2xl px-3 py-3 text-left",
                      isActive
                        ? "bg-primary/[0.06] text-primary hover:bg-primary/[0.08] relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-primary/60"
                        : "text-muted-foreground hover:bg-white/60 hover:text-primary dark:hover:bg-white/[0.04]",
                      isWorking && !isActive && "text-primary bg-primary/5"
                    )}
                  >
                    <span className="min-w-0">
                      <span className="truncate text-sm font-semibold flex items-center gap-2">
                        {groupWorkspace.title}
                        {isWorking && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                      </span>
                      <span className="block pt-1 text-[11px] font-medium text-muted-foreground/70">
                        {formatUpdatedAt(groupWorkspace.lastActiveAt)}
                      </span>
                    </span>
                    <ChevronRight className="mt-0.5 h-4 w-4 shrink-0" />
                  </Button>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )

  const contextSurface = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-white/40 px-5 py-4 dark:border-white/5">
        <h2 className="text-lg font-black tracking-tight text-primary">Resources</h2>
        <button 
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          onClick={(e) => {
            e.preventDefault()
            setResourceDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 text-primary/70" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-primary">Linked Deep Commitment</h3>
          </div>

          {linkedDeepTasks.length > 0 ? (
            <div className="space-y-3">
              {linkedDeepTasks.map((task) => (
                <FocusTaskCard key={task.id} task={task} onUpdate={loadWorkspace} />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/50 bg-white/60 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/[0.03]">
              No DEEP task is linked to this workspace yet.
            </div>
          )}
        </section>

        <section className="space-y-3">
          {workspace && workspace.resources.length > 0 ? (
            <div className="space-y-1">
              {workspace.resources
                .slice()
                .sort(compareByOrderIndex)
                .map((resource) => {
                  const SiteIcon = getSiteIcon(resource.url)
                  let displayTitle = resource.label
                  if (!displayTitle) {
                    try {
                      displayTitle = new URL(resource.url).hostname.replace(/^www\./, '')
                    } catch {
                      displayTitle = "Link"
                    }
                  }
                  
                  return (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-[background] duration-150 ease-in-out hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
                    >
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center">
                        <SiteIcon className="h-4 w-4 text-muted-foreground/70" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-primary/80">
                        {displayTitle}
                      </span>
                      <span className="flex items-center gap-1 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-primary transition-colors" />
                        <button
                          type="button"
                          className="flex items-center justify-center rounded-sm p-0.5 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            void handleDeleteResource(resource.id)
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground/50 hover:text-destructive transition-colors" />
                        </button>
                      </span>
                    </a>
                  )
                })}
            </div>
          ) : (
            <div className="px-1 py-2">
              <p className="text-[13px] font-medium text-primary/80">No resources yet.</p>
              <button 
                type="button"
                className="mt-2.5 flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground/80 hover:text-primary transition-colors"
                onClick={(e) => {
                  e.preventDefault()
                  setResourceDialogOpen(true)
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add your first resource</span>
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  )

  return (
    <AuthGuard>
      <DashboardLayout beforeNavigate={handleWorkspaceNavigation}>
        {loading ? (
          <BrandedLoader className="min-h-[70vh]" label="Loading workspace" />
        ) : loadError ? (
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-destructive/20 bg-white/70 p-8 text-center shadow-sm backdrop-blur dark:bg-white/[0.03]">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <h1 className="mt-4 text-2xl font-black text-primary">Workspace unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
              <Button className="mt-5 rounded-full" onClick={() => void loadWorkspace()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload workspace
              </Button>
            </div>
          </div>
        ) : workspace ? (
          <>
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)_19rem]">
                {!isMobile && (
                  <aside className="overflow-hidden rounded-3xl border border-white/50 bg-white/65 shadow-sm backdrop-blur dark:border-white/5 dark:bg-white/[0.03]">
                    {navigationSurface}
                  </aside>
                )}

                <section className="min-w-0 bg-card rounded-3xl border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_32px_rgba(0,0,0,0.03)] dark:border-white/[0.04]">
                  <div className="px-6 pt-6 pb-6 min-h-[40vh]">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground/50">
                          {workspace.sectionName || "Study Workspace"}
                        </p>
                        <h1 className="mt-1.5 truncate text-2xl font-bold tracking-tight text-foreground/85">
                          {workspace.title}
                        </h1>
                      </div>

                      {isMobile && (
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full bg-white/80"
                            onClick={() => handleNavigationSheetChange(true)}
                          >
                            <Menu className="mr-2 h-4 w-4" />
                            Workspaces
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="rounded-full bg-white/80"
                            onClick={() => handleContextSheetChange(true)}
                          >
                            <Info className="mr-2 h-4 w-4" />
                            Context
                          </Button>
                        </div>
                      )}
                    </div>

                    {actionError && (
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-destructive/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive/50" />
                          {actionError}
                        </span>
                      </div>
                    )}

                    {/* Writing surface — no toolbar, cursor is the primary interaction */}
                    <div
                      className="study-surface-gradient rounded-xl px-6 py-5"
                      onClick={(e) => {
                        if (e.target === e.currentTarget) {
                          void handleCreateEntry(null, "BULLET")
                        }
                      }}
                    >
                      {workspace.entries.length > 0 ? (
                        <div className="space-y-0">
                          {workspace.entries
                            .slice()
                            .sort(compareByOrderIndex)
                            .map((entry) => (
                              <WorkspaceEntryItem
                                key={entry.id}
                                workspaceId={workspaceId}
                                entry={entry}
                                depth={0}
                                onEntrySaved={handleEntrySaved}
                                onEntrySaveStateChange={setEntrySaveState}
                                onCreateSibling={(sourceEntry) =>
                                  void handleCreateEntry(sourceEntry.parentEntryId, sourceEntry.entryType)
                                }
                                onCreateChild={(sourceEntry) => void handleCreateEntry(sourceEntry.id, "BULLET")}
                                onDelete={(sourceEntry) => void handleDeleteEntry(sourceEntry)}
                                onDeleteAndFocusPrevious={(sourceEntry) => void handleDeleteAndFocusPrevious(sourceEntry)}
                                onToggleCollapse={(sourceEntry, nextCollapsed) =>
                                  void handleToggleCollapse(sourceEntry, nextCollapsed)
                                }
                                onConvertType={(sourceEntry, newType) => void handleConvertType(sourceEntry, newType)}
                                onRegisterRef={registerEntryRef}
                              />
                            ))}
                        </div>
                      ) : (
                        <div
                          className="flex flex-col items-start py-6 cursor-text"
                          onClick={() => void handleCreateEntry(null, "BULLET")}
                        >
                          <p className="text-[15px] text-muted-foreground/30 select-none font-[410]">Start writing...</p>
                        </div>
                      )}

                      {/* Clickable trailing area so users can always add below the last line */}
                      {workspace.entries.length > 0 && (
                        <div
                          className="group/trail mt-2 h-20 cursor-text flex items-start justify-start pl-[29px] pt-2"
                          onClick={() => void handleCreateEntry(null, "BULLET")}
                          aria-hidden="true"
                        >
                          <span className="h-[5px] w-[5px] rounded-full bg-primary/0 transition-colors duration-300 group-hover/trail:bg-primary/15" />
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {!isMobile && (
                  <aside className="overflow-hidden rounded-3xl border border-white/50 bg-white/65 shadow-sm backdrop-blur dark:border-white/5 dark:bg-white/[0.03]">
                    {contextSurface}
                  </aside>
                )}
              </div>
            </div>

            <Sheet open={navigationOpen} onOpenChange={handleNavigationSheetChange}>
              <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Workspaces</SheetTitle>
                  <SheetDescription>Choose a study workspace.</SheetDescription>
                </SheetHeader>
                {navigationSurface}
              </SheetContent>
            </Sheet>

            <Sheet open={contextOpen} onOpenChange={handleContextSheetChange}>
              <SheetContent side="bottom" className="max-h-[85vh] p-0">
                <SheetHeader className="sr-only">
                  <SheetTitle>Workspace context</SheetTitle>
                  <SheetDescription>Linked task context and resources.</SheetDescription>
                </SheetHeader>
                {contextSurface}
              </SheetContent>
            </Sheet>

            <AlertDialog
              open={pendingNavigationTarget !== null}
              onOpenChange={(open) => {
                if (!open) {
                  setPendingNavigationTarget(null)
                }
              }}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Leave with unsaved workspace changes?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Some lines are still saving or need another attempt. Leaving now may drop the latest draft.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Stay here</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (pendingNavigationTarget) {
                        router.push(pendingNavigationTarget)
                      }
                      setPendingNavigationTarget(null)
                    }}
                  >
                    Leave workspace
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AddResourceDialog 
              open={resourceDialogOpen}
              onOpenChange={setResourceDialogOpen}
              workspaceId={workspaceId}
              onSuccess={(resource) => {
                setWorkspaceData((current) => {
                  if (!current) return current
                  return {
                    ...current,
                    workspace: {
                      ...current.workspace,
                      resources: [...current.workspace.resources, resource],
                    },
                  }
                })
              }}
            />
          </>
        ) : null}
      </DashboardLayout>
    </AuthGuard>
  )
}
