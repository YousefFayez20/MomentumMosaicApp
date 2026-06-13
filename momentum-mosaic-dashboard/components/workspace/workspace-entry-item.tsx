"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronRight, GripVertical, MoreHorizontal, Trash2 } from "lucide-react"

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
  const isCollapsed = entry.entryType === "TOGGLE" && entry.collapsed
  const syncLabel =
    saveState === "dirty"
      ? "Unsaved"
      : saveState === "saving"
        ? "Saving"
        : saveState === "saved"
          ? "Saved"
          : saveState === "error"
            ? "Sync failed"
            : ""

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
  }, [entry.content])

  useEffect(() => {
    onEntrySaveStateChange(entry.id, "idle")
    return () => {
      clearAutosaveTimer()
      clearSaveResetTimer()
      onEntrySaveStateChange(entry.id, "idle")
    }
  }, [entry.id])

  const handleChange = (nextDraft: string) => {
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
      if (saveState === "dirty") void persistDraft()
      if (entry.entryType === "TOGGLE" && !entry.collapsed) {
        onCreateChild(entry)
      } else {
        onCreateSibling(entry)
      }
    } else if (e.key === "Tab") {
      e.preventDefault()
      if (saveState === "dirty") void persistDraft()
      onCreateChild(entry)
    } else if (e.key === "Backspace" && draft === "") {
      e.preventDefault()
      onDeleteAndFocusPrevious(entry)
    }
  }

  const setTextareaRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      textareaRef.current = el
      onRegisterRef(entry.id, el)
    },
    [entry.id],
  )

  return (
    <div className="group/entry entry-appear" style={{ paddingLeft: `${depth * 20}px` }}>
      <div className="flex items-start gap-3 py-1 -mx-2 px-2 transition-colors duration-150 ease-out rounded-md hover:bg-muted/45 focus-within:bg-muted/55 focus-within:ring-1 focus-within:ring-primary/10">
        <div className="mt-[9px] shrink-0">
          {entry.entryType === "TOGGLE" ? (
            <button
              type="button"
              aria-label={entry.collapsed ? "Expand section" : "Collapse section"}
              className="flex items-center justify-center p-0.5 rounded text-muted-foreground/50 transition-colors duration-150 hover:text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/20"
              onClick={() => onToggleCollapse(entry, !entry.collapsed)}
            >
              <ChevronRight
                className={`h-4 w-4 transition-transform duration-200 ease-out ${entry.collapsed ? "" : "rotate-90"}`}
              />
            </button>
          ) : (
          <span className="block h-[5px] w-[5px] rounded-full bg-muted-foreground/45 transition-colors group-focus-within/entry:bg-primary group-hover/entry:bg-primary/65" />
          )}
        </div>

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
            className="w-full resize-none overflow-hidden bg-transparent text-[15px] leading-7 font-normal text-foreground/90 focus:outline-none placeholder:text-muted-foreground/35"
          />

          {(syncLabel || saveState === "error") && (
            <div
              className={cn(
                "mt-1 flex items-center gap-2 text-xs",
                saveState === "error" ? "text-destructive/80" : "text-muted-foreground/55",
              )}
            >
              <span>{saveState === "error" ? errorMessage || "Unable to sync." : syncLabel}</span>
              {saveState === "saving" && (
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              )}
              {saveState === "error" && (
              <button
                type="button"
                className="font-medium text-primary underline-offset-2 transition-colors hover:text-primary/80"
                onClick={() => void persistDraft()}
              >
                Retry
              </button>
              )}
            </div>
          )}
        </div>

        <div className="relative mt-[9px] flex items-center gap-1 opacity-35 transition-opacity duration-150 group-hover/entry:opacity-100 focus-within:opacity-100">
          <button
            type="button"
            className="p-1 text-muted-foreground/50 transition-colors duration-150 hover:text-foreground rounded-md hover:bg-muted"
            tabIndex={-1}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            className="p-1 text-muted-foreground/50 transition-colors duration-150 hover:text-destructive rounded-md hover:bg-muted"
            tabIndex={-1}
            aria-label="Delete line"
            onClick={() => onDelete(entry)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <div className="relative">
            <button
              type="button"
              className="p-1 text-muted-foreground/50 transition-colors duration-150 hover:text-foreground rounded-md hover:bg-muted"
              tabIndex={-1}
              aria-label="More options"
              onClick={() => setTypeMenuOpen((v) => !v)}
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </button>

            {typeMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setTypeMenuOpen(false)} />
                <div className="absolute right-0 top-full z-20 mt-1.5 overflow-hidden rounded-lg border border-border bg-popover shadow-lg min-w-[130px] py-1 animate-in fade-in-0 zoom-in-95 duration-150">
                  {(["BULLET", "TOGGLE"] as WorkspaceEntryType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-muted",
                        entry.entryType === type ? "text-primary" : "text-muted-foreground",
                      )}
                      onClick={() => {
                        setTypeMenuOpen(false)
                        if (entry.entryType !== type) onConvertType(entry, type)
                      }}
                    >
                      {type === "BULLET" ? (
                        <span className="h-1 w-1 rounded-full bg-current" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                      {type === "BULLET" ? "Bullet" : "Toggle"}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {!isCollapsed && hasChildren && (
        <div>
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
