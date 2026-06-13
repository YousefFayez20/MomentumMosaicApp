"use client"

import { useEffect, useRef, useState } from "react"
import { Archive, ChevronRight, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { WorkspaceSectionResponse } from "@/lib/api"

interface WorkspaceSettingsPopoverProps {
  workspaceId: number
  workspaceTitle: string
  currentSectionId: number | null
  sections: WorkspaceSectionResponse[]
  onRename: (workspaceId: number, newTitle: string) => Promise<void>
  onMoveToSection: (workspaceId: number, sectionId: number | null) => Promise<void>
  onArchive: (workspaceId: number) => Promise<void>
  onDelete: (workspaceId: number) => Promise<void>
}

type PopoverMode = "menu" | "rename" | "move" | "confirmDelete"

export function WorkspaceSettingsPopover({
  workspaceId,
  workspaceTitle,
  currentSectionId,
  sections,
  onRename,
  onMoveToSection,
  onArchive,
  onDelete,
}: WorkspaceSettingsPopoverProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<PopoverMode>("menu")
  const [renameDraft, setRenameDraft] = useState(workspaceTitle)
  const [busy, setBusy] = useState(false)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRenameDraft(workspaceTitle)
  }, [workspaceTitle])

  useEffect(() => {
    if (mode === "rename") {
      requestAnimationFrame(() => renameInputRef.current?.select())
    }
  }, [mode])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        handleClose()
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const handleClose = () => {
    setOpen(false)
    setMode("menu")
    setRenameDraft(workspaceTitle)
  }

  const handleRenameSubmit = async () => {
    const trimmed = renameDraft.trim()
    if (!trimmed || trimmed === workspaceTitle) {
      handleClose()
      return
    }
    setBusy(true)
    try {
      await onRename(workspaceId, trimmed)
      handleClose()
    } finally {
      setBusy(false)
    }
  }

  const handleArchive = async () => {
    setBusy(true)
    try {
      await onArchive(workspaceId)
      handleClose()
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setBusy(true)
    try {
      await onDelete(workspaceId)
      handleClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        aria-label="Workspace settings"
        onClick={(e) => {
          e.stopPropagation()
          if (open) {
            handleClose()
          } else {
            setMode("menu")
            setOpen(true)
          }
        }}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150",
          "text-muted-foreground/35 hover:text-muted-foreground/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]",
          open && "opacity-100 text-muted-foreground/60 bg-black/[0.04] dark:bg-white/[0.06]",
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-black/[0.06] bg-white/95 shadow-xl shadow-black/[0.08] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95 animate-in fade-in-0 zoom-in-95 duration-150">

          {mode === "menu" && (
            <div className="py-1">
              <button
                type="button"
                onClick={() => setMode("rename")}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-primary/[0.07] hover:text-primary transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </button>
              <button
                type="button"
                onClick={() => setMode("move")}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-primary/[0.07] hover:text-primary transition-colors"
              >
                <ChevronRight className="h-3.5 w-3.5" />
                Move to Section
              </button>
              <div className="my-1 h-px bg-black/[0.05] dark:bg-white/[0.06]" />
              <button
                type="button"
                onClick={() => void handleArchive()}
                disabled={busy}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-black/[0.04] hover:text-foreground/80 transition-colors disabled:opacity-40"
              >
                <Archive className="h-3.5 w-3.5" />
                Archive
              </button>
              <button
                type="button"
                onClick={() => setMode("confirmDelete")}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm font-medium text-muted-foreground hover:bg-destructive/[0.07] hover:text-destructive transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            </div>
          )}

          {mode === "rename" && (
            <div className="p-2.5">
              <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                Rename workspace
              </p>
              <input
                ref={renameInputRef}
                type="text"
                value={renameDraft}
                maxLength={200}
                onChange={(e) => setRenameDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleRenameSubmit()
                  if (e.key === "Escape") handleClose()
                }}
                disabled={busy}
                className="w-full rounded-lg border border-black/[0.08] bg-white/80 px-2.5 py-1.5 text-sm font-medium text-primary placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-primary/30 dark:border-white/10 dark:bg-white/[0.06]"
              />
              <div className="mt-2 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => void handleRenameSubmit()}
                  disabled={busy || !renameDraft.trim()}
                  className="flex-1 rounded-lg bg-primary/[0.09] px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/[0.15] disabled:opacity-40"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={busy}
                  className="flex-1 rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-black/[0.07] dark:bg-white/[0.05]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {mode === "move" && (
            <div className="py-1">
              <p className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                Move to section
              </p>
              <button
                type="button"
                onClick={async () => {
                  setBusy(true)
                  try {
                    await onMoveToSection(workspaceId, null)
                    handleClose()
                  } finally {
                    setBusy(false)
                  }
                }}
                disabled={busy || currentSectionId === null}
                className={cn(
                  "flex w-full items-center px-3 py-2 text-left text-sm font-medium transition-colors",
                  currentSectionId === null
                    ? "text-primary bg-primary/[0.06] cursor-default"
                    : "text-muted-foreground hover:bg-primary/[0.06] hover:text-primary",
                  "disabled:opacity-50",
                )}
              >
                Unsectioned
              </button>
              {sections.map((sec) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={async () => {
                    setBusy(true)
                    try {
                      await onMoveToSection(workspaceId, sec.id)
                      handleClose()
                    } finally {
                      setBusy(false)
                    }
                  }}
                  disabled={busy || currentSectionId === sec.id}
                  className={cn(
                    "flex w-full items-center px-3 py-2 text-left text-sm font-medium transition-colors",
                    currentSectionId === sec.id
                      ? "text-primary bg-primary/[0.06] cursor-default"
                      : "text-muted-foreground hover:bg-primary/[0.06] hover:text-primary",
                    "disabled:opacity-50",
                  )}
                >
                  {sec.name}
                </button>
              ))}
              <div className="my-1 h-px bg-black/[0.05] dark:bg-white/[0.06]" />
              <button
                type="button"
                onClick={() => setMode("menu")}
                className="flex w-full items-center px-3 py-2 text-left text-xs font-medium text-muted-foreground/60 hover:text-muted-foreground transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {mode === "confirmDelete" && (
            <div className="p-2.5">
              <p className="mb-1 text-sm font-semibold text-foreground/80">Delete workspace?</p>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground/70">
                All entries and resources will be permanently lost.
              </p>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => void handleDeleteConfirm()}
                  disabled={busy}
                  className="flex-1 rounded-lg bg-destructive/[0.09] px-2.5 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/[0.16] disabled:opacity-40"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={busy}
                  className="flex-1 rounded-lg bg-black/[0.04] px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-black/[0.07] dark:bg-white/[0.05]"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
