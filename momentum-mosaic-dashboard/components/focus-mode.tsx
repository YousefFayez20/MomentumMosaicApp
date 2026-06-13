"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { createPortal } from "react-dom"
import type { TaskResponse } from "@/lib/api"
import { Brain, Dumbbell, Shield, X, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getOrdinal } from "@/lib/utils"

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
    label: "Deep Focus",
    icon: Brain,
    ringColor: "#6366f1",
    glowColor: "rgba(99,102,241,0.35)",
    badgeClass: "border-indigo-800/50 bg-indigo-950/40 text-indigo-300",
    intention: "Protect the block. One meaningful thing gets your full attention.",
    mantra: "Depth over drift.",
  },
  SHALLOW: {
    label: "Light Focus",
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

const FULLSCREEN_RADIUS = 90
const FULLSCREEN_STROKE = 7
const DOCKED_RADIUS = 30
const DOCKED_STROKE = 4

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
  size: "sm" | "lg"
}

function CircularProgressRing({ progress, elapsed, ringColor, glowColor, overtime, size }: RingProps) {
  const radius = size === "sm" ? DOCKED_RADIUS : FULLSCREEN_RADIUS
  const stroke = size === "sm" ? DOCKED_STROKE : FULLSCREEN_STROKE
  const circumference = 2 * Math.PI * radius
  const ringSize = (radius + stroke) * 2
  const clampedProgress = Math.min(Math.max(progress, 0), 1)
  const dashOffset = circumference * (1 - clampedProgress)

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={ringSize}
        height={ringSize}
        viewBox={`0 0 ${ringSize} ${ringSize}`}
        className="focus-ring-breathe-glow -rotate-90"
        style={{ filter: `drop-shadow(0 0 8px ${glowColor})` }}
        aria-hidden="true"
      >
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted/30"
        />
        <circle
          cx={ringSize / 2}
          cy={ringSize / 2}
          r={radius}
          fill="none"
          stroke={overtime ? "#f87171" : ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="focus-ring-breathe transition-all duration-1000 ease-linear"
          style={{ transition: "stroke-dashoffset 1s linear, stroke 0.5s ease" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={size === "sm" ? "font-mono text-lg font-extrabold tabular-nums tracking-tighter" : "font-mono text-4xl font-extrabold tabular-nums tracking-tighter sm:text-5xl"}
          style={{ color: overtime ? "#f87171" : ringColor }}
        >
          {formatElapsed(elapsed)}
        </span>
        {size === "lg" && (
          <span className="mt-1 text-[0.68rem] font-bold uppercase tracking-[0.28em] text-muted-foreground/60">
            {overtime ? "Overtime" : "Elapsed"}
          </span>
        )}
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
  isCelebrating?: boolean
  completedCountToday?: number
  onCloseCelebration?: () => void
  variant?: "fullscreen" | "docked"
}

export function FocusMode({
  task,
  onComplete,
  onAbandon,
  completing,
  abandoning,
  isCelebrating = false,
  completedCountToday = 0,
  onCloseCelebration,
  variant = "docked",
}: FocusModeProps) {
  const [elapsed, setElapsed] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [showAbandonConfirm, setShowAbandonConfirm] = useState(false)
  const [particles, setParticles] = useState<Array<{
    id: number
    left: string
    color: string
    delay: string
    duration: string
    size: string
    shape: string
    animation: string
  }>>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isCelebrating) {
      const colors = ["#6366f1", "#38bdf8", "#34d399", "#a855f7", "#f43f5e", "#eab308"]
      const newParticles = Array.from({ length: 35 }).map((_, i) => {
        const isLeftDrift = Math.random() > 0.5
        return {
          id: i,
          left: `${Math.random() * 100}vw`,
          color: colors[Math.floor(Math.random() * colors.length)],
          delay: `${Math.random() * 3.5}s`,
          duration: `${3.5 + Math.random() * 4}s`,
          size: `${4 + Math.random() * 7}px`,
          shape: Math.random() > 0.4 ? "50%" : "2px",
          animation: isLeftDrift ? "particle-drift-left" : "particle-drift-right"
        }
      })
      setParticles(newParticles)
    } else {
      setParticles([])
    }
  }, [isCelebrating])

  useEffect(() => {
    if (variant !== "fullscreen") return
    
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [variant])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isCelebrating) {
        setShowAbandonConfirm((current) => !current)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isCelebrating])

  useEffect(() => {
    if (!task.startedAt || isCelebrating) return

    const startTime = new Date(task.startedAt).getTime()
    const tick = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)))
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [task.startedAt, isCelebrating])

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

  const overlay = variant === "fullscreen" ? (
    <div className="focus-overlay dark" role="dialog" aria-modal="true" aria-labelledby={isCelebrating ? "celebration-title" : "focus-session-title"}>
      <div className="focus-ambient" aria-hidden="true" style={{ "--focus-glow": meta.glowColor } as CSSProperties} />

      {/* Render celebration floating particles */}
      {isCelebrating && particles.map((p) => (
        <div
          key={p.id}
          className="focus-particle"
          style={{
            left: p.left,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            animationName: p.animation,
            width: p.size,
            height: p.size,
            borderRadius: p.shape,
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            animationIterationCount: "infinite"
          }}
        />
      ))}

      {isCelebrating ? (
        <div className="focus-card relative overflow-hidden flex flex-col items-center text-center p-8 sm:p-10 max-w-md">
          {/* Breathing pulsed circular checkmark badge */}
          <div
            className="complete-icon-enter mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed focus-ring-breathe-glow"
            style={{
              borderColor: meta.ringColor,
              animationDuration: "500ms",
              filter: `drop-shadow(0 0 8px ${meta.glowColor})`
            }}
          >
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
              <path
                className="checkmark-path"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                stroke={meta.ringColor}
              />
            </svg>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground/75 mb-2">
            Focus Block Complete
          </p>
          <h2 id="celebration-title" className="text-2xl font-bold leading-tight text-foreground mb-4 sm:text-3xl line-clamp-2">
            {task.title}
          </h2>

          <div className="h-[1px] w-12 bg-muted/40 mb-5" />

          {/* Time feedback actual vs estimated duration */}
          <div className="mb-6 space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground/60">Logged duration</p>
            <p className="text-xl font-bold text-foreground tracking-tight">
              {meta.label}: {task.actualMinutes ?? Math.max(1, Math.round(elapsed / 60))} min
            </p>
            <p className="text-xs text-muted-foreground/60">
              estimated {task.durationMinutes} min
            </p>
          </div>

          {/* Streak count completed today for DEEP tasks */}
          {task.taskType === "DEEP" && completedCountToday > 0 && (
            <div className="mb-6 w-full rounded-xl border border-indigo-500/25 bg-indigo-500/5 px-5 py-3 text-center">
              <p className="text-xs text-indigo-400 font-semibold tracking-wide uppercase mb-0.5">Consistency compounds</p>
              <p className="text-sm text-indigo-200">
                That's your {getOrdinal(completedCountToday)} deep work session today.
              </p>
            </div>
          )}

          <Button
            id="focus-celebration-continue-btn"
            className="h-12 w-full gap-2 text-base font-semibold shadow-lg mt-2 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{
              backgroundColor: meta.ringColor,
              color: "#fff",
              boxShadow: `0 8px 20px -4px ${meta.glowColor}`
            }}
            onClick={onCloseCelebration}
          >
            Acknowledge & Continue
          </Button>
        </div>
      ) : (
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
              size="lg"
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
                style={{ backgroundColor: meta.ringColor, color: "#fff", boxShadow: `0 8px 20px -4px ${meta.glowColor}` }}
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
      )}
    </div>
  ) : (
    <div className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-2xl bg-card border border-border/40 overflow-hidden dark max-w-[320px] w-full" style={{ filter: `drop-shadow(0 8px 32px ${meta.glowColor})` }}>
      <div className="p-4 relative z-10 bg-background/95 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <Badge className={`gap-1 border text-[10px] py-0 h-5 ${meta.badgeClass}`}>
            <TypeIcon className="h-3 w-3" />
            {meta.label}
          </Badge>
          <div className="flex items-center gap-1.5 rounded-full border border-muted/20 bg-muted/10 px-2 py-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-medium text-emerald-400">Live</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <CircularProgressRing
            progress={progress}
            elapsed={elapsed}
            ringColor={meta.ringColor}
            glowColor={meta.glowColor}
            overtime={overtime}
            size="sm"
          />
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold text-foreground truncate">{task.title}</h2>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
              <span className="truncate pr-2">{overtime ? `${task.durationMinutes}m reached` : formatRemaining(remainingSeconds)}</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-1 mt-1.5 overflow-hidden rounded-full bg-muted/30">
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

        <div className="mt-4 flex gap-2">
          {!showAbandonConfirm ? (
            <>
              <Button
                size="sm"
                className="flex-1 h-8 text-xs gap-1.5"
                style={{ backgroundColor: meta.ringColor, color: "#fff" }}
                onClick={handleComplete}
                disabled={completing || abandoning}
              >
                {completing ? (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : "Complete"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-xs text-muted-foreground"
                onClick={() => setShowAbandonConfirm(true)}
                disabled={completing || abandoning}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <div className="flex w-full gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-[10px]"
                onClick={() => setShowAbandonConfirm(false)}
                disabled={abandoning}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="flex-1 h-8 text-[10px]"
                onClick={handleAbandon}
                disabled={abandoning}
              >
                {abandoning ? "..." : "Abandon"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
