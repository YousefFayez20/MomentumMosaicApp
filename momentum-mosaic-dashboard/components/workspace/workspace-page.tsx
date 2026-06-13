"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  Maximize2,
  Menu,
  MessageSquare,
  Minimize2,
  RefreshCw,
  Trash2,
  Youtube,
  Plus,
  Play,
  CheckCircle,
  X,
  Link2,
  PlayCircle,
} from "lucide-react"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
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
import { SectionManagementPopover } from "@/components/workspace/section-management-popover"
import { WorkspaceSettingsPopover } from "@/components/workspace/workspace-settings-popover"
import { cn } from "@/lib/utils"
import { WorkspaceEntryItem, type EntrySaveState } from "@/components/workspace/workspace-entry-item"
import { useFocusTimer } from "@/hooks/use-focus-timer"
import { CreateTaskDialog } from "@/components/create-task-dialog"

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
  sectionId: number | null   // null means the "Unsectioned" synthetic group
  workspaces: WorkspaceSummaryResponse[]
}

const COLLAPSED_SECTIONS_KEY = "mm_collapsed_sections"

function getCollapsedSections(): Set<string> {
  if (typeof window === "undefined") return new Set()
  try {
    const raw = localStorage.getItem(COLLAPSED_SECTIONS_KEY)
    return raw ? new Set<string>(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function saveCollapsedSections(collapsed: Set<string>): void {
  try {
    localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify([...collapsed]))
  } catch {
    // ignore
  }
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
  // In sectioned mode: show ALL sections (including empty ones) + unsectioned group
  // In flat mode (no sections): return a single synthetic group with all workspaces
  if (sections.length === 0) {
    return workspaces.length > 0
      ? [{ id: "section-flat", label: "", sectionId: null, workspaces }]
      : []
  }

  const groupedSections = [...sections]
    .sort(compareByOrderIndex)
    .map((section) => ({
      id: `section-${section.id}`,
      label: section.name,
      sectionId: section.id,
      workspaces: workspaces.filter((workspace) => workspace.sectionId === section.id),
    }))

  const unsectioned = workspaces.filter((workspace) => workspace.sectionId === null)
  if (unsectioned.length > 0) {
    groupedSections.push({
      id: "section-unsectioned",
      label: "Unsectioned",
      sectionId: null,
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

function getYoutubeVideoId(url: string): string | null {
  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  } catch {
    return null;
  }
}

function FaviconWithFallback({ url, hostname, className }: { url: string; hostname: string; className?: string }) {
  const [error, setError] = useState(false)
  const SiteIcon = getSiteIcon(url)

  if (error) {
    return <SiteIcon className="h-4 w-4 text-muted-foreground/70" />
  }

  return (
    <img
      src={`https://www.google.com/s2/favicons?sz=64&domain=${hostname}`}
      alt={hostname}
      className={cn("h-4 w-4 object-contain", className)}
      onError={() => setError(true)}
    />
  )
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
      "workspace-context-card rounded-xl p-4 transition-colors",
      task.status === "IN_PROGRESS"
        ? "border-primary/35 bg-primary/5 dark:bg-primary/10"
        : "bg-card/70"
    )}>
      <p className="text-sm font-semibold text-foreground">{task.title}</p>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-medium text-muted-foreground">
        <span className={cn(
          "rounded-md px-2 py-0.5",
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
            className="w-full rounded-lg"
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
              className="flex-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => handleAction("complete")}
              disabled={loading}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 rounded-lg"
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
            <div className="rounded-2xl border border-destructive/20 bg-white/70 p-8 text-center shadow-sm backdrop-blur dark:bg-white/[0.03]">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <h1 className="mt-4 text-2xl font-black text-primary">Workspace unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">{error}</p>
              <Button className="mt-5 rounded-lg" onClick={() => void loadWorkspaces()}>
                Try again
              </Button>
            </div>
          ) : workspaces.length === 0 ? (
            <div className="rounded-2xl border border-white/50 bg-white/70 p-8 shadow-sm backdrop-blur dark:border-white/5 dark:bg-white/[0.03]">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground/65">
                Study Workspace
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-primary">No workspace yet</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                This MVP stays focused on execution inside existing study workspaces. Once a workspace exists, this route
                becomes the calm place to think, write, and stay inside the current DEEP commitment.
              </p>
              <Button className="mt-4 rounded-lg" onClick={() => setCreateDialogOpen(true)}>
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
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [completingTaskId, setCompletingTaskId] = useState<number | null>(null)
  const [abandoningTaskId, setAbandoningTaskId] = useState<number | null>(null)
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<string | null>(null)
  const [entrySaveStates, setEntrySaveStates] = useState<Record<number, EntrySaveState>>({})
  const [actionError, setActionError] = useState("")
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null)
  const [deepWritingMode, setDeepWritingMode] = useState(false)
  const [isExitingDeepMode, setIsExitingDeepMode] = useState(false)
  const [topbarVisible, setTopbarVisible] = useState(true)
  // Section collapse state — persisted to localStorage
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(getCollapsedSections)
  // Inline new-section creation in sidebar
  const [newSectionMode, setNewSectionMode] = useState(false)
  const [newSectionDraft, setNewSectionDraft] = useState("")
  // Sidebar "New Workspace" dialog (separate from any existing top-level dialog)
  const [createDialogOpenNav, setCreateDialogOpenNav] = useState(false)

  const restoreFocusRef = useRef<HTMLElement | null>(null)
  // Map of entryId -> textarea element, used for programmatic focus
  const entryRefsMap = useRef<Map<number, HTMLTextAreaElement>>(new Map())
  const topbarTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const deepWriteScrollRef = useRef<HTMLDivElement | null>(null)
  const newSectionInputRef = useRef<HTMLInputElement | null>(null)

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

  const workspaceTasks = useMemo(() => {
    if (!workspaceData) return []
    return workspaceData.tasks.filter((task) => task.workspaceId === workspaceId)
  }, [workspaceData, workspaceId])

  const completedWorkspaceTime = useMemo(() => {
    return workspaceTasks
      .filter((t) => t.status === "COMPLETED")
      .reduce((acc, t) => acc + (t.actualMinutes || t.durationMinutes), 0)
  }, [workspaceTasks])

  const inProgressTask = useMemo(() => {
    return workspaceTasks.find((t) => t.status === "IN_PROGRESS")
  }, [workspaceTasks])

  const { elapsed, formatElapsed } = useFocusTimer(inProgressTask)

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

  const isSectionedMode = (workspaceData?.sections.length ?? 0) > 0

  // -- Section collapse toggle --
  const toggleSectionCollapsed = (groupId: string) => {
    setCollapsedSections((prev) => {
      const next = new Set(prev)
      if (next.has(groupId)) next.delete(groupId)
      else next.add(groupId)
      saveCollapsedSections(next)
      return next
    })
  }

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

  // -- Section management handlers --
  const handleStartTask = async (taskId: number) => {
    try {
      const updated = await apiClient.startTask(taskId)
      setWorkspaceData((cur) => {
        if (!cur) return cur
        return {
          ...cur,
          tasks: cur.tasks.map((t) => (t.id === taskId ? updated : t)),
        }
      })
    } catch (err) {
      console.error(err)
    }
  }

  const handleCompleteTask = async (taskId: number) => {
    setCompletingTaskId(taskId)
    try {
      const updated = await apiClient.completeTask(taskId)
      setWorkspaceData((cur) => {
        if (!cur) return cur
        return {
          ...cur,
          tasks: cur.tasks.map((t) => (t.id === taskId ? updated : t)),
        }
      })
    } catch (err) {
      console.error(err)
    } finally {
      setCompletingTaskId(null)
    }
  }

  const handleAbandonTask = async (taskId: number) => {
    setAbandoningTaskId(taskId)
    try {
      const updated = await apiClient.abandonTask(taskId)
      setWorkspaceData((cur) => {
        if (!cur) return cur
        return {
          ...cur,
          tasks: cur.tasks.map((t) => (t.id === taskId ? updated : t)),
        }
      })
    } catch (err) {
      console.error(err)
    } finally {
      setAbandoningTaskId(null)
    }
  }

  const formatHeaderTime = (minutes: number) => {
    if (minutes === 0) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}h ${m}m focus`
    if (h > 0) return `${h}h focus`
    return `${m}m focus`
  }

  const handleRenameSection = async (sectionId: number, newName: string) => {
    try {
      const updated = await apiClient.updateSection(sectionId, { name: newName })
      setWorkspaceData((cur) => {
        if (!cur) return cur
        return {
          ...cur,
          sections: cur.sections.map((s) => (s.id === sectionId ? { ...s, name: updated.name } : s)),
          // Also update sectionName on any workspace summaries referencing this section
          workspaces: cur.workspaces.map((w) =>
            w.sectionId === sectionId ? { ...w, sectionName: updated.name } : w,
          ),
        }
      })
    } catch (err) {
      const apiError = err as ApiError
      setActionError(apiError.message || "Could not rename section.")
    }
  }

  const handleDeleteSection = async (sectionId: number) => {
    try {
      await apiClient.deleteSection(sectionId)
      setWorkspaceData((cur) => {
        if (!cur) return cur
        return {
          ...cur,
          sections: cur.sections.filter((s) => s.id !== sectionId),
          // Move affected workspaces to unsectioned
          workspaces: cur.workspaces.map((w) =>
            w.sectionId === sectionId ? { ...w, sectionId: null, sectionName: null } : w,
          ),
        }
      })
    } catch (err) {
      const apiError = err as ApiError
      setActionError(apiError.message || "Could not delete section.")
    }
  }

  const handleCreateSection = async () => {
    const trimmed = newSectionDraft.trim()
    if (!trimmed) { setNewSectionMode(false); return }
    try {
      const section = await apiClient.createSection({ name: trimmed })
      setWorkspaceData((cur) => {
        if (!cur) return cur
        return { ...cur, sections: [...cur.sections, section] }
      })
    } catch (err) {
      const apiError = err as ApiError
      setActionError(apiError.message || "Could not create section.")
    } finally {
      setNewSectionMode(false)
      setNewSectionDraft("")
    }
  }

  // -- Workspace management handlers --
  const handleRenameWorkspace = async (wsId: number, newTitle: string) => {
    try {
      await apiClient.updateWorkspace(wsId, { title: newTitle })
      setWorkspaceData((cur) => {
        if (!cur) return cur
        const updatedWorkspaces = cur.workspaces.map((w) =>
          w.id === wsId ? { ...w, title: newTitle } : w,
        )
        // Also patch the active workspace if it's the current one
        const updatedWorkspace =
          cur.workspace.id === wsId ? { ...cur.workspace, title: newTitle } : cur.workspace
        return { ...cur, workspaces: updatedWorkspaces, workspace: updatedWorkspace }
      })
    } catch (err) {
      const apiError = err as ApiError
      setActionError(apiError.message || "Could not rename workspace.")
    }
  }

  const handleMoveWorkspaceToSection = async (wsId: number, sectionId: number | null) => {
    try {
      const payload = sectionId === null ? { clearSection: true } : { sectionId }
      await apiClient.updateWorkspace(wsId, payload)
      setWorkspaceData((cur) => {
        if (!cur) return cur
        const sectionName = sectionId
          ? (cur.sections.find((s) => s.id === sectionId)?.name ?? null)
          : null
        return {
          ...cur,
          workspaces: cur.workspaces.map((w) =>
            w.id === wsId ? { ...w, sectionId, sectionName } : w,
          ),
          workspace:
            cur.workspace.id === wsId
              ? { ...cur.workspace, sectionId, sectionName }
              : cur.workspace,
        }
      })
    } catch (err) {
      const apiError = err as ApiError
      setActionError(apiError.message || "Could not move workspace.")
    }
  }

  const handleArchiveWorkspace = async (wsId: number) => {
    try {
      await apiClient.updateWorkspace(wsId, { archived: true })
      setWorkspaceData((cur) => {
        if (!cur) return cur
        return { ...cur, workspaces: cur.workspaces.filter((w) => w.id !== wsId) }
      })
      // If archiving the currently viewed workspace, navigate away
      if (wsId === workspaceId) {
        const remaining = workspaceData?.workspaces.filter((w) => w.id !== wsId)
        if (remaining && remaining.length > 0) {
          router.push(`/workspace/${remaining[0].id}`)
        } else {
          router.push("/workspace")
        }
      }
    } catch (err) {
      const apiError = err as ApiError
      setActionError(apiError.message || "Could not archive workspace.")
    }
  }

  const handleDeleteWorkspace = async (wsId: number) => {
    try {
      await apiClient.deleteWorkspace(wsId)
      const remaining = workspaceData?.workspaces.filter((w) => w.id !== wsId)
      setWorkspaceData((cur) => {
        if (!cur) return cur
        return { ...cur, workspaces: cur.workspaces.filter((w) => w.id !== wsId) }
      })
      if (wsId === workspaceId) {
        if (remaining && remaining.length > 0) {
          router.push(`/workspace/${remaining[0].id}`)
        } else {
          router.push("/workspace")
        }
      }
    } catch (err) {
      const apiError = err as ApiError
      setActionError(apiError.message || "Could not delete workspace.")
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

  // Deep Writing Mode: Escape to exit + Collapse/Expand all shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && deepWritingMode && !isExitingDeepMode) {
        handleExitDeepMode()
      }
      // Ctrl+Shift+C — collapse all toggles
      if (e.key === "C" && e.ctrlKey && e.shiftKey && !e.altKey) {
        e.preventDefault()
        void handleCollapseAll(true)
      }
      // Ctrl+Shift+E — expand all toggles
      if (e.key === "E" && e.ctrlKey && e.shiftKey && !e.altKey) {
        e.preventDefault()
        void handleCollapseAll(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [deepWritingMode, isExitingDeepMode, workspaceData])

  // Auto-hide topbar during typing in Deep Writing Mode
  useEffect(() => {
    if (!deepWritingMode) return

    const resetTopbarTimer = () => {
      setTopbarVisible(true)
      if (topbarTimerRef.current) clearTimeout(topbarTimerRef.current)
      topbarTimerRef.current = setTimeout(() => setTopbarVisible(false), 3000)
    }

    const handleMouseMove = () => {
      setTopbarVisible(true)
      if (topbarTimerRef.current) clearTimeout(topbarTimerRef.current)
      topbarTimerRef.current = setTimeout(() => setTopbarVisible(false), 3000)
    }

    const handleKeyPress = () => {
      // Hide topbar immediately on typing
      if (topbarTimerRef.current) clearTimeout(topbarTimerRef.current)
      topbarTimerRef.current = setTimeout(() => setTopbarVisible(false), 1500)
    }

    // Start visible, then fade
    resetTopbarTimer()
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("keydown", handleKeyPress)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("keydown", handleKeyPress)
      if (topbarTimerRef.current) clearTimeout(topbarTimerRef.current)
    }
  }, [deepWritingMode])

  const handleExitDeepMode = useCallback(() => {
    if (isExitingDeepMode) return
    setIsExitingDeepMode(true)
    // Wait for exit animation before unmounting
    setTimeout(() => {
      setDeepWritingMode(false)
      setIsExitingDeepMode(false)
      setTopbarVisible(true)
    }, 250)
  }, [isExitingDeepMode])

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
    // Optimistic creation — instant UI, background API
    const tempId = -Date.now()
    const optimisticEntry: WorkspaceEntryResponse = {
      id: tempId,
      parentEntryId,
      entryType,
      content,
      collapsed: false,
      orderIndex: Number.MAX_SAFE_INTEGER,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      children: [],
    }
    patchWorkspaceEntries((entries) => appendEntryToTree(entries, parentEntryId, optimisticEntry))
    focusEntryById(tempId)

    try {
      setActionError("")
      const nextEntry = await apiClient.createWorkspaceEntry(workspaceId, {
        parentEntryId,
        entryType,
        content,
      })

      // Replace optimistic entry with the real one
      patchWorkspaceEntries((entries) => {
        const withoutTemp = removeEntryFromTree(entries, tempId)
        return appendEntryToTree(withoutTemp, parentEntryId, nextEntry)
      })
      // Re-register focus to the real entry
      focusEntryById(nextEntry.id)
    } catch (error) {
      const apiError = error as ApiError
      // Remove the optimistic entry on failure
      patchWorkspaceEntries((entries) => removeEntryFromTree(entries, tempId))
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

  // Collapse or expand all toggle entries
  const handleCollapseAll = async (collapse: boolean) => {
    if (!workspaceData) return
    const collectToggles = (entries: WorkspaceEntryResponse[]): WorkspaceEntryResponse[] => {
      const result: WorkspaceEntryResponse[] = []
      for (const entry of entries) {
        if (entry.entryType === "TOGGLE" && entry.collapsed !== collapse) {
          result.push(entry)
        }
        if (entry.children.length > 0) {
          result.push(...collectToggles(entry.children))
        }
      }
      return result
    }
    const toggles = collectToggles(workspaceData.workspace.entries)
    if (toggles.length === 0) return

    // Optimistic: update all at once
    for (const toggle of toggles) {
      patchWorkspaceEntries((entries) =>
        replaceEntryInTree(entries, { ...toggle, collapsed: collapse })
      )
    }
    // Fire API calls in parallel
    await Promise.allSettled(
      toggles.map((toggle) =>
        apiClient.updateWorkspaceEntry(workspaceId, toggle.id, { collapsed: collapse })
      )
    )
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
      {/* Header */}
      <div className="border-b border-border/70 px-5 py-4">
        <p className="text-xs font-semibold text-muted-foreground">
          Study Workspace
        </p>
        <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">One calm place to work</h2>
      </div>

      {/* Workspace list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {workspaceGroups.length === 0 && (
          <p className="px-1 text-sm text-muted-foreground/50">No workspaces yet.</p>
        )}

        {workspaceGroups.map((group) => {
          const isCollapsed = collapsedSections.has(group.id)
          const showHeader = isSectionedMode && group.label !== ""
          const isUnsectioned = group.id === "section-unsectioned"

          return (
            <section key={group.id} className="mb-4">
              {/* Section header (only in sectioned mode, not for flat mode) */}
              {showHeader && (
                <div className="group/section mb-1 flex items-center justify-between gap-1">
                  <button
                    type="button"
                    onClick={() => toggleSectionCollapsed(group.id)}
                    className="flex min-w-0 flex-1 items-center gap-1.5 rounded-md px-1 py-0.5 text-left transition-colors hover:bg-muted"
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 shrink-0 text-muted-foreground/40 transition-transform duration-200",
                        !isCollapsed && "rotate-90",
                      )}
                    />
                    <h3 className="truncate text-xs font-semibold text-muted-foreground">
                      {group.label}
                    </h3>
                  </button>

                  {/* Section management — only real sections (not "Unsectioned" synthetic group) */}
                  {!isUnsectioned && group.sectionId !== null && (
                    <div className="shrink-0 opacity-0 transition-opacity duration-150 group-hover/section:opacity-100">
                      <SectionManagementPopover
                        sectionId={group.sectionId}
                        sectionName={group.label}
                        onRename={handleRenameSection}
                        onDelete={handleDeleteSection}
                      />
                    </div>
                  )}
                  {isUnsectioned && (
                    <span className="shrink-0 text-xs text-muted-foreground/30">—</span>
                  )}
                </div>
              )}

              {/* Workspace list (hidden when section is collapsed) */}
              {!isCollapsed && (
                <div className="space-y-1">
                  {group.workspaces.length === 0 && showHeader && (
                    <p className="px-2 py-1.5 text-xs text-muted-foreground/50">
                      No workspaces yet
                    </p>
                  )}
                  {group.workspaces.map((groupWorkspace) => {
                    const isActive = groupWorkspace.id === workspaceId
                    const isWorking = workspaceData?.tasks.some(
                      (t) => t.workspaceId === groupWorkspace.id && t.status === "IN_PROGRESS",
                    )
                    return (
                      <div key={groupWorkspace.id} className="group/ws relative flex items-center">
                        <button
                          type="button"
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
                            "flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors duration-150",
                            isActive
                              ? "bg-primary/[0.08] text-primary relative before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[3px] before:rounded-full before:bg-primary/70"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground",
                            isWorking && !isActive && "text-primary bg-primary/5",
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-2 truncate text-sm font-semibold">
                              {groupWorkspace.title}
                              {isWorking && (
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              )}
                            </span>
                            <span className="block pt-0.5 text-xs font-medium text-muted-foreground/60">
                              {formatUpdatedAt(groupWorkspace.lastActiveAt)}
                            </span>
                          </span>
                        </button>

                        {/* Per-workspace settings popover (visible on hover) */}
                        <div className={cn(
                          "absolute right-1.5 shrink-0 opacity-0 transition-opacity duration-150",
                          "group-hover/ws:opacity-100",
                          isActive && "opacity-100",
                        )}>
                          <WorkspaceSettingsPopover
                            workspaceId={groupWorkspace.id}
                            workspaceTitle={groupWorkspace.title}
                            currentSectionId={groupWorkspace.sectionId}
                            sections={workspaceData?.sections ?? []}
                            onRename={handleRenameWorkspace}
                            onMoveToSection={handleMoveWorkspaceToSection}
                            onArchive={handleArchiveWorkspace}
                            onDelete={handleDeleteWorkspace}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </section>
          )
        })}
      </div>

      {/* Sidebar footer: New Workspace + section actions */}
      <div className="border-t border-border/70 px-4 py-3 space-y-1.5">
        <button
          type="button"
          onClick={() => setCreateDialogOpenNav(true)}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
          New Workspace
        </button>

        {/* In flat mode: "Organize into Sections" affordance */}
        {!isSectionedMode && (
          <button
            type="button"
            onClick={() => {
              setNewSectionMode(true)
              requestAnimationFrame(() => newSectionInputRef.current?.focus())
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            Organize into Sections
          </button>
        )}

        {/* In sectioned mode: "New Section" button */}
        {isSectionedMode && (
          <button
            type="button"
            onClick={() => {
              setNewSectionMode(true)
              requestAnimationFrame(() => newSectionInputRef.current?.focus())
            }}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-3.5 w-3.5" />
            New Section
          </button>
        )}

        {/* Inline new-section input */}
        {newSectionMode && (
          <div className="flex items-center gap-1.5 px-1">
            <input
              ref={newSectionInputRef}
              type="text"
              value={newSectionDraft}
              maxLength={100}
              placeholder="Section name…"
              onChange={(e) => setNewSectionDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void handleCreateSection()
                if (e.key === "Escape") {
                  setNewSectionMode(false)
                  setNewSectionDraft("")
                }
              }}
              onBlur={() => {
                // Small delay so clicking "Save" doesn't fire blur before click
                setTimeout(() => {
                  setNewSectionMode(false)
                  setNewSectionDraft("")
                }, 150)
              }}
              className="flex-1 rounded-md border border-border bg-background px-2.5 py-1.5 text-sm font-medium text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              autoFocus
            />
          </div>
        )}
      </div>

      {/* CreateWorkspaceDialog wired to sidebar footer button */}
      <CreateWorkspaceDialog
        open={createDialogOpenNav}
        onOpenChange={setCreateDialogOpenNav}
        sections={workspaceData?.sections ?? []}
        onSuccess={(ws) => {
          setWorkspaceData((cur) => {
            if (!cur) return cur
            const summary = {
              id: ws.id,
              title: ws.title,
              sectionId: ws.sectionId,
              sectionName: ws.sectionName,
              lastActiveAt: ws.lastActiveAt,
              createdAt: ws.createdAt,
            }
            return { ...cur, workspaces: [...cur.workspaces, summary] }
          })
          setCreateDialogOpenNav(false)
          router.push(`/workspace/${ws.id}`)
        }}
      />
    </div>
  )

  const contextSurface = (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border/70 px-5 py-4">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">Workspace Context</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-foreground">Next useful action</h2>
        </div>
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-colors"
          onClick={(e) => {
            e.preventDefault()
            setResourceDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4 text-primary/70" />
        </button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">

        {/* Resources section */}
        <section className="space-y-4 border-t border-border/60 pt-5">
          <div className="flex items-center justify-between text-primary">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <h4 className="text-sm font-bold uppercase tracking-wider">Resources</h4>
            </div>
            <span className="text-xs font-medium text-muted-foreground opacity-70">
              {workspace?.resources.length ?? 0}
            </span>
          </div>
          
          <div className="space-y-2">
            {workspace && workspace.resources.length > 0 ? (
              workspace.resources
                .slice()
                .sort(compareByOrderIndex)
                .map((resource) => {
                  const videoId = getYoutubeVideoId(resource.url)
                  const isYoutube = videoId !== null
                  let displayTitle = resource.label
                  if (!displayTitle) {
                    try {
                      displayTitle = new URL(resource.url).hostname.replace(/^www\./, '')
                    } catch {
                      displayTitle = "Link"
                    }
                  }

                  let hostname = ""
                  try {
                    hostname = new URL(resource.url).hostname.replace(/^www\./, '')
                  } catch {
                    hostname = "Link"
                  }

                  const standardCard = (
                    <div className="flex items-center gap-3 p-3 bg-surface-container-low dark:bg-muted/10 rounded-lg border border-outline-variant/30 hover:border-primary transition-colors cursor-pointer group">
                      <div className={cn("w-10 h-10 rounded flex items-center justify-center shrink-0", isYoutube ? "bg-red-100 dark:bg-red-950/40 text-red-600" : "bg-surface-container-highest dark:bg-muted/30 text-muted-foreground")}>
                        {isYoutube ? <PlayCircle className="w-5 h-5" /> : <FaviconWithFallback url={resource.url} hostname={hostname} className="w-5 h-5" />}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{displayTitle}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{hostname}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
                        </a>
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-muted transition-colors"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            void handleDeleteResource(resource.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                        </button>
                      </div>
                    </div>
                  )

                  return (
                    <HoverCard key={resource.id} openDelay={300} closeDelay={150}>
                      <HoverCardTrigger asChild>
                        <div>{standardCard}</div>
                      </HoverCardTrigger>
                      <HoverCardContent side="left" align="start" sideOffset={12} className="w-72 overflow-hidden rounded-xl p-3 shadow-lg">
                        {isYoutube ? (
                          <div className="space-y-3">
                            <div
                              className="relative aspect-video w-full overflow-hidden rounded-xl cursor-pointer shadow-sm border border-black/5 dark:border-white/5"
                              onClick={() => setActiveVideoId(videoId)}
                            >
                              <img
                                src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`}
                                alt={displayTitle}
                                className="h-full w-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-colors hover:bg-black/30">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 shadow-md backdrop-blur-sm">
                                  <Play className="h-4.5 w-4.5 text-red-600 fill-red-600 ml-0.5" />
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="line-clamp-3 text-sm font-semibold text-foreground leading-snug">{displayTitle}</h4>
                              <div className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                                <Youtube className="h-3.5 w-3.5 text-red-500" />
                                YouTube Video
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-2.5">
                            <h4 className="line-clamp-4 text-sm font-semibold text-foreground leading-snug">{displayTitle}</h4>

                            {(() => {
                              const lower = hostname.toLowerCase();
                              let BadgeIcon = null;
                              let badgeText = "";
                              let badgeClass = "";

                              if (lower.includes("chatgpt.com") || lower.includes("claude.ai") || lower.includes("perplexity.ai")) {
                                BadgeIcon = Brain;
                                badgeText = "AI Assistant";
                                badgeClass = "bg-purple-500/10 text-purple-600 dark:text-purple-400";
                              } else if (lower.includes("github.com") || lower.includes("stackoverflow.com")) {
                                BadgeIcon = Github;
                                badgeText = "Development";
                                badgeClass = "bg-blue-500/10 text-blue-600 dark:text-blue-400";
                              } else if (lower.includes("figma.com") || lower.includes("dribbble.com")) {
                                BadgeIcon = Figma;
                                badgeText = "Design";
                                badgeClass = "bg-pink-500/10 text-pink-600 dark:text-pink-400";
                              } else if (lower.includes("medium.com")) {
                                BadgeIcon = BookOpen;
                                badgeText = "Article";
                                badgeClass = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                              }

                              if (BadgeIcon) {
                                return (
                                  <div className="flex items-center">
                                    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold", badgeClass)}>
                                      <BadgeIcon className="h-3 w-3" /> {badgeText}
                                    </span>
                                  </div>
                                );
                              }
                              return null;
                            })()}

                            <div className="flex items-start gap-2 text-xs text-muted-foreground break-all whitespace-normal bg-muted/50 p-2 rounded-lg">
                              <FaviconWithFallback url={resource.url} hostname={hostname} className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                              <span className="opacity-80 line-clamp-3 leading-relaxed">{resource.url}</span>
                            </div>
                          </div>
                        )}
                      </HoverCardContent>
                    </HoverCard>
                  )
                })
            ) : (
              <div className="py-6 px-4 text-center border-2 border-dashed border-outline-variant/30 rounded-lg">
                <div className="w-12 h-12 bg-surface-container mx-auto rounded-full flex items-center justify-center mb-3">
                  <Link2 className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground">No resources yet</p>
                <p className="text-xs text-muted-foreground mt-1 mb-4">Add links, videos, or documents</p>
              </div>
            )}
            
            <button
              type="button"
              className="w-full py-3 mt-2 border-2 border-dashed border-outline-variant/60 rounded-lg flex items-center justify-center gap-2 text-muted-foreground text-sm font-semibold hover:bg-surface-container-low hover:border-primary hover:text-primary transition-all"
              onClick={() => setResourceDialogOpen(true)}
            >
              <Link2 className="h-[18px] w-[18px]" />
              Add New Resource
            </button>
          </div>
        </section>

        {/* Workspace Tasks */}
        <section className="px-4 py-6 border-t border-border/5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Workspace Tasks</h3>
            <button
              className="flex h-5 w-5 items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground"
              onClick={() => setTaskDialogOpen(true)}
              title="Add task"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {workspaceTasks.length > 0 ? (
              workspaceTasks.map((task) => {
                if (task.status === "IN_PROGRESS") {
                  return (
                    <div key={task.id} className="p-4 bg-surface-container dark:bg-muted/10 rounded-lg border border-teal-500/30 shadow-sm relative overflow-hidden group transition-all">
                      <div className="flex justify-between items-start mb-1 relative z-10">
                        <p className="text-sm font-bold text-primary dark:text-teal-400 truncate max-w-[120px]">{task.title}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 text-[10px] font-bold rounded-full flex items-center gap-1 shadow-sm">
                            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse shadow-[0_0_4px_rgba(20,184,166,0.8)]"></span> Current Focus
                          </span>
                          <button 
                            className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleAbandonTask(task.id)}
                            title="Abandon task"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[10px] text-primary/70 dark:text-teal-400/70 uppercase tracking-tighter relative z-10">
                        {task.taskType} • {task.durationMinutes}M
                      </p>
                    </div>
                  )
                }

                return (
                  <div key={task.id} className="group relative flex flex-col gap-2 rounded-xl border border-muted/30 bg-muted/10 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{task.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">
                          {task.taskType} • {task.durationMinutes}m
                        </p>
                      </div>
                      {task.status === "COMPLETED" ? (
                        <div className="flex items-center gap-1.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5">
                          <span className="text-[10px] font-medium text-indigo-500">Done</span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 px-2 text-xs"
                          onClick={() => handleStartTask(task.id)}
                        >
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="px-1 py-1">
                <p className="text-sm text-muted-foreground">No tasks linked.</p>
              </div>
            )}
          </div>
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
            <div className="rounded-2xl border border-destructive/20 bg-white/70 p-8 text-center shadow-sm backdrop-blur dark:bg-white/[0.03]">
              <AlertCircle className="mx-auto h-10 w-10 text-destructive" />
              <h1 className="mt-4 text-2xl font-black text-primary">Workspace unavailable</h1>
              <p className="mt-2 text-sm text-muted-foreground">{loadError}</p>
              <Button className="mt-5 rounded-lg" onClick={() => void loadWorkspace()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload workspace
              </Button>
            </div>
          </div>
        ) : workspace ? (
          <>
            <div className="mx-auto max-w-[88rem] px-4 py-5 sm:px-6 lg:px-8">
              <div className="grid gap-5 lg:grid-cols-[17rem_minmax(0,1fr)_18rem]">
                {!isMobile && (
                  <aside className="workspace-panel overflow-hidden rounded-xl">
                    {navigationSurface}
                  </aside>
                )}

                <section className={cn(
                  "workspace-editor-shell relative min-w-0 rounded-2xl transition-all duration-700 overflow-hidden",
                  inProgressTask ? "border-teal-500/30 shadow-[0_0_40px_-15px_rgba(20,184,166,0.15)]" : ""
                )}>
                  {inProgressTask && (
                    <>
                      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none" />
                      <div className="absolute top-1/4 left-0 w-3/4 h-24 bg-primary/5 blur-2xl rounded-full animate-[breathing-glow_5s_ease-in-out_infinite] pointer-events-none -z-10" />
                    </>
                  )}
                  <div className="px-6 pt-6 pb-7 min-h-[58vh] sm:px-8 relative z-10">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {workspace.sectionName || "STUDY WORKSPACE"} {inProgressTask ? `• ${workspace.title}` : ""}
                          </p>
                          {!inProgressTask && completedWorkspaceTime > 0 && (
                            <>
                              <span className="text-muted-foreground/30">•</span>
                              <p className="text-xs font-semibold text-indigo-500/80 dark:text-indigo-400/80 flex items-center gap-1.5">
                                <Clock className="h-3 w-3" />
                                {formatHeaderTime(completedWorkspaceTime)}
                              </p>
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-1">
                          <h1 className="truncate text-2xl font-bold tracking-tight text-foreground">
                            {inProgressTask ? inProgressTask.title : workspace.title}
                          </h1>
                          
                          {inProgressTask && (
                            <div className="flex items-center gap-3 bg-surface-container-low dark:bg-muted/30 rounded-full px-3 py-1 border border-outline-variant/30 shadow-sm">
                              <span className="text-sm font-bold text-primary dark:text-teal-400 tabular-nums">
                                {formatElapsed(elapsed)}
                              </span>
                              <div className="w-px h-4 bg-outline-variant/40"></div>
                              <button 
                                className="text-muted-foreground hover:text-teal-600 transition-colors flex items-center justify-center" 
                                title="Complete task"
                                onClick={() => handleCompleteTask(inProgressTask.id)}
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isMobile ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-lg"
                              onClick={() => handleNavigationSheetChange(true)}
                            >
                              <Menu className="mr-2 h-4 w-4" />
                              Workspaces
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-lg"
                              onClick={() => handleContextSheetChange(true)}
                            >
                              <Info className="mr-2 h-4 w-4" />
                              Context
                            </Button>
                          </>
                        ) : (
                          <>
                            <WorkspaceSettingsPopover
                              workspaceId={workspace.id}
                              workspaceTitle={workspace.title}
                              currentSectionId={workspace.sectionId}
                              sections={workspaceData?.sections ?? []}
                              onRename={handleRenameWorkspace}
                              onMoveToSection={handleMoveWorkspaceToSection}
                              onArchive={handleArchiveWorkspace}
                              onDelete={handleDeleteWorkspace}
                            />
                            <button
                              type="button"
                              onClick={() => setDeepWritingMode(true)}
                              className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors duration-150 text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Enter deep writing"
                            >
                              <Maximize2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {actionError && (
                      <div className="mb-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive/70">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive/50" />
                          {actionError}
                        </span>
                      </div>
                    )}

                    {/* Writing surface — no toolbar, cursor is the primary interaction */}
                    <div
                      className="study-surface-gradient min-h-[42vh] rounded-xl px-5 py-5 sm:px-6"
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
                          <p className="text-sm text-muted-foreground/35 select-none font-normal">Start thinking...</p>
                        </div>
                      )}

                      {/* Clickable trailing area so users can always add below the last line */}
                      {workspace.entries.length > 0 && (
                        <div
                          className="group/trail mt-2 h-32 cursor-text flex items-start justify-start pl-[29px] pt-2"
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
                  <aside className="workspace-panel overflow-hidden rounded-xl">
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

            <Dialog open={activeVideoId !== null} onOpenChange={(open) => !open && setActiveVideoId(null)}>
              <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black aspect-video rounded-2xl border-none">
                {activeVideoId && (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                    title="YouTube Video Player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-none"
                  />
                )}
              </DialogContent>
            </Dialog>
          </>
        ) : null}
      </DashboardLayout>

      {/* ─── Deep Writing Mode — Fullscreen Overlay ──── */}
      {(deepWritingMode || isExitingDeepMode) && workspace && (
        <div
          className={cn(
            "deep-writing-overlay",
            isExitingDeepMode && "deep-writing-overlay--exiting"
          )}
        >
          {/* Auto-hiding topbar */}
          <div
            className={cn(
              "deep-writing-topbar",
              !topbarVisible && !isExitingDeepMode && "deep-writing-topbar--hidden"
            )}
          >
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">
                {workspace.sectionName || "Study Workspace"}
              </p>
              <h2 className="mt-0.5 truncate text-base font-bold tracking-tight text-foreground/60">
                {workspace.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleExitDeepMode}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground/40 transition-all duration-200 hover:text-muted-foreground/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              title="Exit deep writing"
            >
              <Minimize2 className="h-4 w-4" />
            </button>
          </div>

          {/* Scrollable writing surface */}
          <div className="deep-writing-scroll" ref={deepWriteScrollRef}>
            <div className="deep-writing-column">
              <div
                className="py-4"
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
                    <p className="text-sm text-muted-foreground/25 select-none font-normal">Start thinking...</p>
                  </div>
                )}

                {/* Generous trailing click area */}
                {workspace.entries.length > 0 && (
                  <div
                    className="group/trail mt-2 h-[40vh] cursor-text flex items-start justify-start pl-[29px] pt-2"
                    onClick={() => void handleCreateEntry(null, "BULLET")}
                    aria-hidden="true"
                  >
                    <span className="h-[5px] w-[5px] rounded-full bg-primary/0 transition-colors duration-300 group-hover/trail:bg-primary/15" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateTaskDialog
        open={taskDialogOpen}
        onOpenChange={setTaskDialogOpen}
        onSuccess={loadWorkspace}
        defaultWorkspaceId={workspaceId}
      />

    </AuthGuard>
  )
}
