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
          <div className="command-surface mb-8 rounded-lg p-5 sm:p-6">
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Physical consistency</p>
            <h2 className="text-3xl font-bold text-primary">Workout Discipline</h2>
            <p className="text-muted-foreground">Log today's workout and protect your streak</p>
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <Card className="border border-primary/20 bg-gradient-to-br from-primary/10 to-transparent shadow-sm backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
                <Flame className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold text-primary">{streak}</div>
                <p className="text-xs text-muted-foreground">{streak === 1 ? "day" : "days"} in a row</p>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/85 shadow-sm backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Status</CardTitle>
                <Calendar className="h-5 w-5 text-chart-3" />
              </CardHeader>
              <CardContent>
                {todayLog?.didWorkout ? (
                  <Badge variant="default" className="text-base">
                    <CheckCircle2 className="mr-1 h-4 w-4" />
                    Complete
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-base">
                    <XCircle className="mr-1 h-4 w-4" />
                    Not Started
                  </Badge>
                )}
                <p className="mt-1 text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border border-primary/20 bg-card/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-primary" />
                  Log Today's Workout
                </CardTitle>
                <CardDescription>Mark whether today's workout was completed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-3">
                  {!todayLog?.didWorkout ? (
                    <>
                      <Button
                        size="lg"
                        onClick={() => handleMarkWorkout(true)}
                        disabled={submitting}
                        className="w-full gap-2"
                      >
                        <CheckCircle2 className="h-5 w-5" />
                        {submitting ? "Logging..." : "Yes, I Worked Out Today"}
                      </Button>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleMarkWorkout(false)}
                        disabled={submitting}
                        className="w-full gap-2"
                      >
                        <XCircle className="h-5 w-5" />
                        {submitting ? "Updating..." : "No, Skip Today"}
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="rounded-lg bg-primary/10 p-4 text-center">
                        <CheckCircle2 className="mx-auto mb-2 h-12 w-12 text-primary" />
                        <p className="font-semibold text-primary">Workout logged</p>
                        <p className="text-sm text-muted-foreground">Today's streak is protected.</p>
                      </div>
                      <Button
                        size="lg"
                        variant="outline"
                        onClick={() => handleMarkWorkout(false)}
                        disabled={submitting}
                        className="w-full"
                      >
                        Remove Today's Workout
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/10 bg-card/85 shadow-sm backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                  Streak Milestones
                </CardTitle>
                <CardDescription>Steady repetition is what turns this into a habit.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-lg border bg-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Current Position</span>
                    <Badge variant={streak >= 7 ? "default" : "secondary"}>
                      {streak >= 7 ? "Established" : "Building"}
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold">{streak > 0 ? `${streak} day streak` : "No streak yet"}</p>
                  <p className="text-xs text-muted-foreground">
                    {streak > 0 ? "Keep showing up and let the streak compound." : "Log today to start the chain."}
                  </p>
                </div>

                <div className="space-y-3">
                  {[7, 14, 30].map((milestone) => {
                    const achieved = streak >= milestone

                    return (
                      <div
                        key={milestone}
                        className="flex items-center justify-between rounded-lg border bg-muted/20 p-4 text-sm"
                      >
                        <div className="flex items-center gap-2">
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
