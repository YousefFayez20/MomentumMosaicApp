"use client"

import { useEffect, useRef, useState } from "react"
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface SectionManagementPopoverProps {
  sectionId: number
  sectionName: string
  onRename: (sectionId: number, newName: string) => Promise<void>
  onDelete: (sectionId: number) => Promise<void>
}

export function SectionManagementPopover({
  sectionId,
  sectionName,
  onRename,
  onDelete,
}: SectionManagementPopoverProps) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"menu" | "rename" | "confirmDelete">("menu")
  const [renameDraft, setRenameDraft] = useState(sectionName)
  const [busy, setBusy] = useState(false)
  const renameInputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // Sync name if parent prop changes
  useEffect(() => {
    setRenameDraft(sectionName)
  }, [sectionName])

  // Focus rename input when entering rename mode
  useEffect(() => {
    if (mode === "rename") {
      requestAnimationFrame(() => {
        renameInputRef.current?.select()
      })
    }
  }, [mode])

  // Close on outside click
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
    setRenameDraft(sectionName)
  }

  const handleRenameSubmit = async () => {
    const trimmed = renameDraft.trim()
    if (!trimmed || trimmed === sectionName) {
      handleClose()
      return
    }
    setBusy(true)
    try {
      await onRename(sectionId, trimmed)
      setOpen(false)
      setMode("menu")
    } finally {
      setBusy(false)
    }
  }

  const handleDeleteConfirm = async () => {
    setBusy(true)
    try {
      await onDelete(sectionId)
      setOpen(false)
      setMode("menu")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        aria-label={`Manage section ${sectionName}`}
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
          "flex h-5 w-5 items-center justify-center rounded transition-all duration-150",
          "text-muted-foreground/30 hover:text-muted-foreground/70 hover:bg-black/[0.05] dark:hover:bg-white/[0.08]",
          open && "opacity-100 text-muted-foreground/60 bg-black/[0.04] dark:bg-white/[0.06]",
        )}
      >
        <MoreHorizontal className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] overflow-hidden rounded-xl border border-black/[0.06] bg-white/95 shadow-xl shadow-black/[0.08] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/95 animate-in fade-in-0 zoom-in-95 duration-150">
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
                Rename section
              </p>
              <input
                ref={renameInputRef}
                type="text"
                value={renameDraft}
                maxLength={100}
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

          {mode === "confirmDelete" && (
            <div className="p-2.5">
              <p className="mb-1 text-sm font-semibold text-foreground/80">Delete section?</p>
              <p className="mb-3 text-xs leading-relaxed text-muted-foreground/70">
                Workspaces in this section will become unsectioned.
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
