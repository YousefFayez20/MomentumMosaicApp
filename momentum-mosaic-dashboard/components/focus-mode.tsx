"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import type { TaskResponse } from "@/lib/api"
import { Brain, Dumbbell, Shield, X, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const TASK_TYPE_META: Record<
  TaskResponse["taskType"],
  {
    label: string
    icon: typeof Brain
    ringColor: string
    glowColor: string
    badgeClass: string
    intention: string
    mantra: string
  }
> = {
  DEEP: {
    label: "Deep Work",
    icon: Brain,
    ringColor: "#6366f1",
    glowColor: "rgba(99,102,241,0.35)",
    badgeClass: "border-indigo-800/50 bg-indigo-950/40 text-indigo-300",
    intention: "Protect the block. One meaningful thing gets your full attention.",
    mantra: "Depth over drift.",
  },
  SHALLOW: {
    label: "Shallow Work",
    icon: Zap,
    ringColor: "#38bdf8",
    glowColor: "rgba(56,189,248,0.3)",
    badgeClass: "border-sky-800/50 bg-sky-950/40 text-sky-300",
    intention: "Clear the surface area with precision. Keep the loop tight.",
    mantra: "Clean motion, no wandering.",
  },
  FITNESS: {
    label: "Fitness",
    icon: Dumbbell,
    ringColor: "#34d399",
    glowColor: "rgba(52,211,153,0.3)",
    badgeClass: "border-emerald-800/50 bg-emerald-950/40 text-emerald-300",
    intention: "Show up physically. Let effort compound quietly.",
    mantra: "Body leads, momentum follows.",
  },
}

const RADIUS = 90
const STROKE = 7
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const SIZE = (RADIUS + STROKE) * 2

function formatElapsed(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const h = Math.floor(safeSeconds / 3600)
  const m = Math.floor((safeSeconds % 3600) / 60)
  const s = safeSeconds % 60

  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function formatRemaining(seconds: number) {
  const safeSeconds = Math.max(0, seconds)
  const minutes = Math.ceil(safeSeconds / 60)
  if (minutes <= 1) return "Final minute"
  return `${minutes} minutes protected`
}

interface RingProps {
  progress: number
  elapsed: number
  ringColor: string
  glowColor: string
  overtime: boolean
}

function CircularProgressRing({ progress, elapsed, ringColor, glowColor, overtime }: RingProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const dashOffset = CIRCUMFERENCE * (1 - clampedProgress)

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="focus-ring-breathe-glow -rotate-90"
        style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}
        aria-hidden="true"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="text-muted/30"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={overtime ? "#f87171" : ringColor}
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          className="focus-ring-breathe transition-all duration-1000 ease-linear"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-mono text-4xl font-bold tabular-nums tracking-tight sm:text-5xl"
          style={{ color: overtime ? "#f87171" : ringColor }}
        >
          {formatElapsed(elapsed)}
        </span>
        <span className="mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground/65">
          {overtime ? "Overtime" : "Elapsed"}
        </span>
      </div>
    </div>
  )
}

interface FocusModeProps {
  task: TaskResponse
  onComplete: () => Promise<void>
  onAbandon: () => Promise<void>
  completing: boolean
  abandoning: boolean
}

export function FocusMode({ task, onComplete, onAbandon, completing, abandoning }: FocusModeProps) {
  const [elapsed, setElapsed] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowAbandonConfirm((current) => !current)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (!task.startedAt) return

    const startTime = new Date(task.startedAt).getTime()
    const tick = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)))
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [task.startedAt])

  const meta = TASK_TYPE_META[task.taskType]
  const TypeIcon = meta.icon
  const totalSeconds = Math.max(task.durationMinutes * 60, 1)
  const progress = elapsed / totalSeconds
  const overtime = elapsed > totalSeconds
  const remainingSeconds = totalSeconds - elapsed
  const progressPercent = Math.min(Math.round(progress * 100), 100)

  const handleComplete = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    await onComplete()
  }

  const handleAbandon = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setShowAbandonConfirm(false)
    await onAbandon()
  }

  if (!mounted) return null

  const overlay = (
    <div className="focus-overlay dark" role="dialog" aria-modal="true" aria-labelledby="focus-session-title">
      <div className="focus-ambient" aria-hidden="true" style={{ "--focus-glow": meta.glowColor } as CSSProperties} />

      <div className="focus-card">
        <div className="mb-7 flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/70">
              Focus Session Active
            </p>
            <Badge className={`gap-1.5 border ${meta.badgeClass}`}>
              <TypeIcon className="h-3 w-3" />
              {meta.label}
            </Badge>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-muted/20 bg-muted/10 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <span className="text-xs font-medium text-emerald-400">Live</span>
          </div>
        </div>

        <div className="mb-8 space-y-3 text-center sm:text-left">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground/55">
            One active commitment
          </p>
          <h2 id="focus-session-title" className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">
            {task.title}
          </h2>
          <p className="mx-auto max-w-xl text-sm leading-6 text-muted-foreground sm:mx-0">
            {meta.intention}
          </p>
        </div>

        <div className="mb-7 flex flex-col items-center gap-4">
          <CircularProgressRing
            progress={progress}
            elapsed={elapsed}
            ringColor={meta.ringColor}
            glowColor={meta.glowColor}
            overtime={overtime}
          />

          <div className="w-full max-w-sm space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{overtime ? `${task.durationMinutes}m target reached` : formatRemaining(remainingSeconds)}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: overtime ? "#f87171" : meta.ringColor,
                }}
              />
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-muted/20 bg-muted/10 px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" style={{ color: meta.ringColor }} />
            <span>{meta.mantra}</span>
          </div>
        </div>

        {!showAbandonConfirm ? (
          <div className="space-y-3">
            <Button
              id="focus-complete-btn"
              className="h-12 w-full gap-2 text-base font-semibold shadow-lg"
              style={{ backgroundColor: meta.ringColor, color: "#fff", boxShadow: `0 16px 36px ${meta.glowColor}` }}
              onClick={handleComplete}
              disabled={completing || abandoning}
            >
              {completing ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Completing...
                </>
              ) : (
                "Complete Session"
              )}
            </Button>
            <div className="text-center">
              <button
                id="focus-abandon-btn"
                className="text-xs text-muted-foreground/60 underline-offset-4 transition-colors hover:text-muted-foreground hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setShowAbandonConfirm(true)}
                disabled={completing || abandoning}
              >
                Abandon session
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 rounded-xl border border-destructive/30 bg-destructive/5 p-5">
            <div className="flex items-start gap-3">
              <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-semibold text-foreground">Abandon this session?</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The task returns to planned. Keep going if this block still matters.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setShowAbandonConfirm(false)}
                disabled={abandoning}
              >
                Keep going
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 gap-1.5"
                onClick={handleAbandon}
                disabled={abandoning}
              >
                {abandoning ? (
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : null}
                {abandoning ? "Abandoning..." : "Yes, abandon"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
