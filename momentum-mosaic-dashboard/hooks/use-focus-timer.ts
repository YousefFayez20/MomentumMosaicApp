import { useState, useEffect, useRef } from "react"
import type { TaskResponse } from "@/lib/api"

export function useFocusTimer(inProgressTask?: TaskResponse) {
  const [elapsed, setElapsed] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!inProgressTask || !inProgressTask.startedAt) {
      setElapsed(0)
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    const startTime = new Date(inProgressTask.startedAt).getTime()
    const tick = () => {
      setElapsed(Math.max(0, Math.floor((Date.now() - startTime) / 1000)))
    }

    tick()
    intervalRef.current = setInterval(tick, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [inProgressTask?.startedAt])

  const formatElapsed = (seconds: number) => {
    const safeSeconds = Math.max(0, seconds)
    const m = Math.floor(safeSeconds / 60)
    const s = safeSeconds % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  }

  const formatHeaderTime = (minutes: number) => {
    if (minutes === 0) return null
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h > 0 && m > 0) return `${h}h ${m}m focus`
    if (h > 0) return `${h}h focus`
    return `${m}m focus`
  }

  return { elapsed, formatElapsed, formatHeaderTime }
}
