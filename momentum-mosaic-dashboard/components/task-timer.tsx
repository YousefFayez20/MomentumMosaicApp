"use client"

import { useEffect, useState } from "react"

interface TaskTimerProps {
  startedAt: string | null
  durationMinutes: number
}

export function TaskTimer({ startedAt, durationMinutes }: TaskTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return

    const start = new Date(startedAt).getTime()

    const tick = () => {
      setElapsed(Math.floor((Date.now() - start) / 1000))
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [startedAt])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) {
      return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    }
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const progress = Math.min(1, elapsed / (durationMinutes * 60))
  const overtime = elapsed > durationMinutes * 60

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Pulsing live indicator */}
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
          </span>
          <span
            className={`font-mono text-sm font-semibold tabular-nums ${overtime ? "text-red-400" : "text-indigo-500 dark:text-indigo-400"}`}
          >
            {formatTime(elapsed)}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{durationMinutes}m</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950/40">
        <div
          className="h-full rounded-full transition-all duration-1000"
          style={{
            width: `${progress * 100}%`,
            backgroundColor: overtime ? "#f87171" : "#6366f1",
          }}
        />
      </div>
    </div>
  )
}
