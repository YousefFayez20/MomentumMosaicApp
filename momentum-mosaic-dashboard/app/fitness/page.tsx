"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type ApiError } from "@/lib/api"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Flame, Activity, Calendar, CheckCircle2, XCircle, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { BrandedLoader } from "@/components/branded-loader"

export default function FitnessPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [todayLog, setTodayLog] = useState<{ didWorkout: boolean; date: string } | null>(null)
  const [streak, setStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const fetchFitnessData = async () => {
    if (!user) return
    if (!user.userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const streakData = await apiClient.getWorkoutStreak()
      setStreak(streakData as number)

      try {
        const todayData = await apiClient.getTodayFitness()
        setTodayLog(todayData)
      } catch (err) {
        console.log("No workout log found for today (this is normal for a new day)")
        setTodayLog(null)
      }
    } catch (err) {
      const apiError = err as ApiError
      console.error("[Fitness] Fetch error:", apiError)

      if (apiError.status === 403 && apiError.error === "PROFILE_NOT_COMPLETED") {
        router.push("/complete-profile")
        return
      }

      if (apiError.status === 401) {
        router.push("/login")
        return
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFitnessData()
  }, [user])

  const handleMarkWorkout = async (didWorkout: boolean) => {
    if (!user?.userId) return

    try {
      setSubmitting(true)
      await apiClient.markWorkout(didWorkout)
      await fetchFitnessData()

      toast({
        title: didWorkout ? "Workout logged" : "Workout removed",
        description: didWorkout
          ? "Nice work. Your streak and status are up to date."
          : "Today's workout status has been undone.",
      })
    } catch (err) {
      toast({
        title: "Could not update workout",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <AuthGuard>
        <DashboardLayout>
          <BrandedLoader className="h-[calc(100vh-4rem)]" label="Loading workout discipline" />
        </DashboardLayout>
      </AuthGuard>
    )
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
          <div className="command-surface mb-10 rounded-2xl p-6 sm:p-8">
            <p className="mb-3 tracking-widest text-xs font-bold uppercase text-muted-foreground/80">Physical consistency</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-primary sm:text-4xl">Workout Discipline</h2>
            <p className="mt-2 text-muted-foreground">Log today's workout and protect your streak</p>
          </div>

          <div className="mb-10 grid gap-5 sm:grid-cols-2">
            <Card className="border border-white/60 bg-gradient-to-br from-card/80 to-muted/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] backdrop-blur-xl hover-premium rounded-2xl relative overflow-hidden">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/5 blur-3xl" />
              <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                <CardTitle className="text-sm font-bold tracking-wider uppercase text-muted-foreground/80">Current Streak</CardTitle>
                <Flame className="h-6 w-6 text-primary" />
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/60 drop-shadow-sm">{streak}</div>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{streak === 1 ? "day" : "days"} in a row</p>
              </CardContent>
            </Card>

            <Card className="border border-white/60 bg-gradient-to-br from-card/80 to-muted/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] backdrop-blur-xl hover-premium rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="text-sm font-bold tracking-wider uppercase text-muted-foreground/80">Today's Status</CardTitle>
                <Calendar className="h-5 w-5 text-chart-3" />
              </CardHeader>
              <CardContent>
                {todayLog?.didWorkout ? (
                  <Badge variant="default" className="text-base px-4 py-1.5 shadow-sm">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-base px-4 py-1.5 border border-white/60 bg-white/60 backdrop-blur-sm shadow-sm">
                    <XCircle className="mr-1 h-4 w-4" />
                    Not Started
                  </Badge>
                )}
                <p className="mt-3 text-xs font-bold text-muted-foreground/60">{new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-white/60 bg-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] backdrop-blur-xl rounded-2xl">
              <CardHeader className="bg-white/40 border-b border-white/40 pb-5">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Log Today's Workout
                </CardTitle>
                <CardDescription>Mark whether today's workout was completed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                <div className="flex flex-col gap-4">
                  {!todayLog?.didWorkout ? (
                    <>
                      <Button
                        size="lg"
                        onClick={() => handleMarkWorkout(true)}
                        disabled={submitting}
                        className="w-full gap-2 rounded-xl py-6 text-lg shadow-lg shadow-primary/10 transition-all hover:-translate-y-0.5"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        {submitting ? "Logging..." : "Yes, I Worked Out Today"}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleMarkWorkout(false)}
                        disabled={submitting}
                        className="w-full gap-2 rounded-xl py-6 bg-white/60 backdrop-blur-sm border-white/60 hover:bg-white/80"
                      >
                        <XCircle className="h-5 w-5" />
                        {submitting ? "Updating..." : "No, Skip Today"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-8 text-center shadow-inner">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                          <CheckCircle2 className="h-8 w-8 text-primary" />
                        </div>
                        <p className="text-xl font-bold text-primary">Workout logged</p>
                        <p className="mt-1 text-sm text-muted-foreground">Today's streak is protected.</p>
                      </div>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleMarkWorkout(false)}
                        disabled={submitting}
                        className="w-full rounded-xl bg-white/60 backdrop-blur-sm border-white/60 hover:bg-white/80"
                      >
                        Remove Today's Workout
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-white/60 bg-white/40 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] backdrop-blur-xl rounded-2xl">
              <CardHeader className="bg-white/40 border-b border-white/40 pb-5">
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  Streak Milestones
                </CardTitle>
                <CardDescription>Steady repetition is what turns this into a habit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="rounded-xl border border-white/60 bg-white/60 p-5 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold tracking-wider uppercase text-muted-foreground/80">Current Position</span>
                    <Badge variant={streak >= 7 ? "default" : "secondary"} className={streak < 7 ? "border border-white/60 bg-white/60" : ""}>
                      {streak >= 7 ? "Established" : "Building"}
                    </Badge>
                  </div>
                  <p className="text-3xl font-bold text-primary">{streak > 0 ? `${streak} day streak` : "No streak yet"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {streak > 0 ? "Keep showing up and let the streak compound." : "Log today to start the chain."}
                  </p>
                </div>

                <div className="space-y-4">
                  {[7, 14, 30].map((milestone) => {
                    const achieved = streak >= milestone

                    return (
                      <div
                        key={milestone}
                        className={`flex items-center justify-between rounded-xl border p-5 text-sm shadow-sm transition-colors ${achieved ? "bg-primary/5 border-primary/20" : "bg-white/40 border-white/60"}`}
                      >
                        <div className="flex items-center gap-3">
                          <Flame className={`h-4 w-4 ${achieved ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="font-medium">{milestone}-day streak</span>
                        </div>
                        <span className={achieved ? "font-semibold text-primary" : "text-muted-foreground"}>
                          {achieved ? "Achieved" : `${Math.max(0, milestone - streak)} days to go`}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </AuthGuard>
  )
}
