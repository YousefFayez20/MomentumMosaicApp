"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AlertCircle, ChevronDown, ChevronRight } from "lucide-react"

import { apiClient, type ApiError, type WorkspaceEntryResponse, type WorkspaceEntryType } from "@/lib/api"
import { cn } from "@/lib/utils"

export type EntrySaveState = "idle" | "dirty" | "saving" | "saved" | "error"

interface WorkspaceEntryItemProps {
  workspaceId: number
  entry: WorkspaceEntryResponse
  depth: number
  onEntrySaved: (entry: WorkspaceEntryResponse) => void
  onEntrySaveStateChange: (entryId: number, state: EntrySaveState) => void
  onCreateSibling: (entry: WorkspaceEntryResponse) => void
  onCreateChild: (entry: WorkspaceEntryResponse) => void
  onDelete: (entry: WorkspaceEntryResponse) => void
  onDeleteAndFocusPrevious: (entry: WorkspaceEntryResponse) => void
  onToggleCollapse: (entry: WorkspaceEntryResponse, nextCollapsed: boolean) => void
  onConvertType: (entry: WorkspaceEntryResponse, newType: WorkspaceEntryType) => void
  onRegisterRef: (entryId: number, el: HTMLTextAreaElement | null) => void
}

const SAVE_RESET_DELAY_MS = 1500
const AUTOSAVE_DELAY_MS = 800

export function WorkspaceEntryItem({
  workspaceId,
  entry,
  depth,
  onEntrySaved,
  onEntrySaveStateChange,
  onCreateSibling,
  onCreateChild,
  onDelete,
  onDeleteAndFocusPrevious,
  onToggleCollapse,
  onConvertType,
  onRegisterRef,
}: WorkspaceEntryItemProps) {
  const [draft, setDraft] = useState(entry.content ?? "")
  const [persistedContent, setPersistedContent] = useState(entry.content ?? "")
  const [saveState, setSaveState] = useState<EntrySaveState>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [typeMenuOpen, setTypeMenuOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const latestDraftRef = useRef(draft)
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const saveResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestRequestTokenRef = useRef(0)

  const hasChildren = entry.children.length > 0

  // ── Save state helpers ───────────────────────────────────────────────────

  const syncSaveState = (nextState: EntrySaveState, nextError = "") => {
    setSaveState(nextState)
    setErrorMessage(nextError)
    onEntrySaveStateChange(entry.id, nextState)
  }

  const clearAutosaveTimer = () => {
    if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current)
    autosaveTimerRef.current = null
  }

  const clearSaveResetTimer = () => {
    if (saveResetTimerRef.current) clearTimeout(saveResetTimerRef.current)
    saveResetTimerRef.current = null
  }

  const queueSavedReset = (savedContent: string) => {
    clearSaveResetTimer()
    saveResetTimerRef.current = setTimeout(() => {
      if (latestDraftRef.current === savedContent) syncSaveState("idle")
    }, SAVE_RESET_DELAY_MS)
  }

  const resizeTextarea = () => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "0px"
    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
  }

  const persistDraft = async (contentToSave = latestDraftRef.current) => {
    clearAutosaveTimer()
    clearSaveResetTimer()

    if (contentToSave === persistedContent && saveState !== "error") {
      syncSaveState("idle")
      return
    }

    const requestToken = latestRequestTokenRef.current + 1
    latestRequestTokenRef.current = requestToken
    syncSaveState("saving")

    try {
      const updatedEntry = await apiClient.updateWorkspaceEntry(workspaceId, entry.id, {
        content: contentToSave,
      })

      if (requestToken !== latestRequestTokenRef.current) return

      const savedContent = updatedEntry.content ?? ""
      setPersistedContent(savedContent)
      onEntrySaved(updatedEntry)

      if (latestDraftRef.current === savedContent) {
        setDraft(savedContent)
        syncSaveState("saved")
        queueSavedReset(savedContent)
        return
      }

      syncSaveState("dirty")
    } catch (error) {
      if (requestToken !== latestRequestTokenRef.current) return
      const apiError = error as ApiError
      if (latestDraftRef.current !== contentToSave) {
        syncSaveState("dirty")
        return
      }
      syncSaveState("error", apiError.message || "Save failed")
    }
  }

  const scheduleAutosave = (nextDraft: string) => {
    clearAutosaveTimer()
    autosaveTimerRef.current = setTimeout(() => void persistDraft(nextDraft), AUTOSAVE_DELAY_MS)
  }

  // ── Sync effects ─────────────────────────────────────────────────────────

  useEffect(() => {
    latestDraftRef.current = draft
    resizeTextarea()
  }, [draft])

  useEffect(() => {
    const incomingContent = entry.content ?? ""
    setPersistedContent(incomingContent)
    if (saveState === "idle" || saveState === "saved") {
      setDraft(incomingContent)
      latestDraftRef.current = incomingContent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.content])

  useEffect(() => {
    onEntrySaveStateChange(entry.id, "idle")
    return () => {
      clearAutosaveTimer()
      clearSaveResetTimer()
      onEntrySaveStateChange(entry.id, "idle")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id])

  // ── Event handlers ───────────────────────────────────────────────────────

  const handleChange = (nextDraft: string) => {
    // Slash commands — convert block type and wipe the command text
    const trimmed = nextDraft.trimStart()
    if (trimmed.toLowerCase() === "/toggle" && entry.entryType !== "TOGGLE") {
      setDraft("")
      latestDraftRef.current = ""
      onConvertType(entry, "TOGGLE")
      return
    }
    if (trimmed.toLowerCase() === "/bullet" && entry.entryType !== "BULLET") {
      setDraft("")
      latestDraftRef.current = ""
      onConvertType(entry, "BULLET")
      return
    }

    setDraft(nextDraft)
    latestDraftRef.current = nextDraft
    clearSaveResetTimer()

    if (nextDraft === persistedContent) {
      clearAutosaveTimer()
      syncSaveState("idle")
      return
    }

    syncSaveState("dirty")
    scheduleAutosave(nextDraft)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      // Flush any pending content before spawning next line
      if (saveState === "dirty") void persistDraft()
      if (entry.entryType === "TOGGLE" && !entry.collapsed) {
        // Enter on an expanded toggle creates a child
        onCreateChild(entry)
      } else {
        onCreateSibling(entry)
      }
    } else if (e.key === "Backspace" && draft === "") {
      e.preventDefault()
      onDeleteAndFocusPrevious(entry)
    }
  }

  // Register this textarea with the parent's ref map for focus management
  const setTextareaRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el
      onRegisterRef(entry.id, el)
    },
    // entry.id and onRegisterRef are stable; no need to add saveState etc.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entry.id],
  )

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="group/entry relative" style={{ marginLeft: `${depth * 20}px` }}>
      <div className="flex items-start gap-1.5 py-[1px]">

        {/* Left indicator: toggle chevron or bullet dot */}
        <div className="relative mt-[9px] shrink-0">
          {entry.entryType === "TOGGLE" ? (
            <button
              type="button"
              aria-label={entry.collapsed ? "Expand section" : "Collapse section"}
              className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground/40 transition-colors hover:bg-primary/10 hover:text-primary"
              onClick={() => onToggleCollapse(entry, !entry.collapsed)}
            >
              {entry.collapsed
                ? <ChevronRight className="h-3.5 w-3.5" />
                : <ChevronDown className="h-3.5 w-3.5" />
              }
            </button>
          ) : (
            <button
              type="button"
              aria-label="Change block type"
              className="flex h-5 w-5 items-center justify-center rounded transition-colors hover:bg-primary/10"
              onClick={() => setTypeMenuOpen((v) => !v)}
            >
              <span className="h-[5px] w-[5px] rounded-full bg-muted-foreground/30 transition-colors group-hover/entry:bg-muted-foreground/50" />
            </button>
          )}

          {/* Type-switch mini popover */}
          {typeMenuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setTypeMenuOpen(false)} />
              <div className="absolute left-6 top-0 z-20 overflow-hidden rounded-lg border border-white/50 bg-white/90 shadow-lg backdrop-blur dark:border-white/10 dark:bg-zinc-900/95">
                {(["BULLET", "TOGGLE"] as WorkspaceEntryType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium transition-colors hover:bg-primary/10",
                      entry.entryType === type ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => {
                      setTypeMenuOpen(false)
                      if (entry.entryType !== type) onConvertType(entry, type)
                    }}
                  >
                    {type === "BULLET"
                      ? <span className="h-[5px] w-[5px] rounded-full bg-current" />
                      : <ChevronRight className="h-3 w-3" />
                    }
                    {type === "BULLET" ? "Bullet" : "Toggle"}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Textarea — the only surface the user interacts with */}
        <div className="relative min-w-0 flex-1">
          <textarea
            ref={setTextareaRef}
            data-entry-id={entry.id}
            value={draft}
            rows={1}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (saveState === "dirty" || saveState === "error") void persistDraft()
            }}
            className={cn(
              "w-full resize-none bg-transparent py-1 text-sm leading-6 text-on-surface outline-none placeholder:text-muted-foreground/25",
              entry.entryType === "TOGGLE" && "font-semibold",
            )}
            placeholder={entry.entryType === "TOGGLE" ? "Section heading…" : ""}
          />

          {/* Error state — tiny, out of the way, only appears on actual error */}
          {saveState === "error" && (
            <div
              title={errorMessage}
              className="absolute right-0 top-2 flex items-center gap-1 text-destructive"
            >
              <AlertCircle className="h-3 w-3" />
              <button
                type="button"
                className="text-[10px] underline"
                onClick={() => void persistDraft()}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Hover-reveal delete × — for mouse users, completely invisible otherwise */}
        <button
          type="button"
          aria-label="Delete line"
          className="mt-[9px] shrink-0 text-[16px] leading-none text-muted-foreground/0 transition-colors group-hover/entry:text-muted-foreground/25 hover:!text-destructive"
          onClick={() => onDelete(entry)}
        >
          ×
        </button>
      </div>

      {/* Children of a TOGGLE — rendered flush, no card wrapping */}
      {entry.entryType === "TOGGLE" && !entry.collapsed && hasChildren && (
        <div className="border-l border-muted-foreground/10 pl-1">
          {entry.children.map((childEntry) => (
            <WorkspaceEntryItem
              key={childEntry.id}
              workspaceId={workspaceId}
              entry={childEntry}
              depth={depth + 1}
              onEntrySaved={onEntrySaved}
              onEntrySaveStateChange={onEntrySaveStateChange}
              onCreateSibling={onCreateSibling}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
              onDeleteAndFocusPrevious={onDeleteAndFocusPrevious}
              onToggleCollapse={onToggleCollapse}
              onConvertType={onConvertType}
              onRegisterRef={onRegisterRef}
            />
          ))}
        </div>
      )}
    </div>
  )
}
