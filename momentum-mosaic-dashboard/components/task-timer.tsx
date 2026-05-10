"use client"

import { useEffect, useState } from "react"
import { Clock, Play, CheckCircle2 } from "lucide-react"

interface TaskTimerProps {
  startedAt: string | null
  durationMinutes: number
}

export function TaskTimer({ startedAt, durationMinutes }: TaskTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startedAt) return

    const start = new Date(startedAt).getTime()
    
    const update = () => {
      const now = new Date().getTime()
      setElapsed(Math.floor((now - start) / 1000))
    }

    update()
    const interval = setInterval(update, 1000)
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

  const progress = Math.min(100, (elapsed / (durationMinutes * 60)) * 100)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400">
          <Clock className="h-4 w-4 animate-pulse" />
          <span>Focused for {formatTime(elapsed)}</span>
        </div>
        <span className="text-xs text-muted-foreground">Target: {durationMinutes}m</span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-indigo-100 dark:bg-indigo-950/40">
        <div 
          className="h-full bg-indigo-500 transition-all duration-1000" 
          style={{ width: `${progress}%` }} 
        />
      </div>
    </div>
  )
}
