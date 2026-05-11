"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import type { TaskResponse } from "@/lib/api"
import { Brain, Zap, Dumbbell, ArrowRight, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"

const TASK_TYPE_META: Record<
  TaskResponse["taskType"],
  { label: string; icon: typeof Brain; completionMessage: string; reflection: string; color: string }
> = {
  DEEP: {
    label: "Deep Work",
    icon: Brain,
    completionMessage: "Deep work finished.",
    reflection: "You protected depth. That is the discipline.",
    color: "#6366f1",
  },
  SHALLOW: {
    label: "Shallow Work",
    icon: Zap,
    completionMessage: "Task complete.",
    reflection: "Loose ends closed. Attention returns cleaner.",
    color: "#38bdf8",
  },
  FITNESS: {
    label: "Fitness",
    icon: Dumbbell,
    completionMessage: "Fitness session done.",
    reflection: "Effort logged. Momentum preserved.",
    color: "#34d399",
  },
}

function formatMinutes(minutes: number) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

interface SessionCompleteProps {
  task: TaskResponse
  onDismiss: () => void
}

export function SessionComplete({ task, onDismiss }: SessionCompleteProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const meta = TASK_TYPE_META[task.taskType]
  const TypeIcon = meta.icon

  const actual = task.actualMinutes ?? task.durationMinutes
  const estimated = task.durationMinutes
  const diff = actual - estimated
  const isUnder = diff <= 0
  const diffText =
    diff === 0
      ? "Right on target."
      : isUnder
      ? `${Math.abs(diff)}m under estimate. Efficient.`
      : `${diff}m over estimate.`

  const overlay = (
    <div className="focus-overlay dark" style={{ alignItems: "center" }}>
      <div
        className="focus-card text-center"
        style={{ maxWidth: "440px", animation: "focus-enter 500ms cubic-bezier(0.16,1,0.3,1) both" }}
      >
        {/* Animated checkmark icon */}
        <div className="complete-icon-enter mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2"
          style={{ borderColor: meta.color, boxShadow: `0 0 28px ${meta.color}44` }}>
          <svg
            viewBox="0 0 52 52"
            className="h-10 w-10"
            fill="none"
            stroke={meta.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path className="checkmark-path" d="M14 27 l9 9 l16 -18" />
          </svg>
        </div>

        {/* Heading */}
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
          Focus session completed
        </p>
        <h2 className="mb-2 text-2xl font-bold text-foreground">
          {meta.completionMessage}
        </h2>
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {task.title}
        </p>

        <div className="mb-6 rounded-2xl border border-muted/25 bg-muted/10 px-4 py-3 text-sm text-muted-foreground">
          {meta.reflection}
        </div>

        {/* Time comparison */}
        <div className="mb-8 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-muted/30 bg-muted/10 p-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Clock className="h-3.5 w-3.5" />
              Actual time
            </div>
            <div
              className="text-2xl font-bold font-mono tabular-nums"
              style={{ color: meta.color }}
            >
              {formatMinutes(actual)}
            </div>
          </div>
          <div className="rounded-xl border border-muted/30 bg-muted/10 p-4">
            <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Clock className="h-3.5 w-3.5" />
              Estimated
            </div>
            <div className="text-2xl font-bold font-mono tabular-nums text-foreground/60">
              {formatMinutes(estimated)}
            </div>
          </div>
        </div>

        {/* Diff message */}
        <p className="mb-6 text-sm text-muted-foreground">
          {diffText} Momentum preserved.
        </p>

        {/* Type badge row */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <TypeIcon className="h-4 w-4" style={{ color: meta.color }} />
          <span className="text-xs font-medium text-muted-foreground">{meta.label}</span>
        </div>

        <Button
          id="session-complete-dismiss"
          className="h-11 w-full gap-2 font-semibold"
          onClick={onDismiss}
          style={{ backgroundColor: meta.color, color: "#fff" }}
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
