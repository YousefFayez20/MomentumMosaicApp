"use client"

import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { getGoogleLoginUrl } from "@/lib/api"
import { Activity, ArrowLeft, Brain, ShieldCheck, Zap } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.assign(getGoogleLoginUrl())
  }

  return (
    <div className="premium-shell flex min-h-screen flex-col p-4">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between py-4">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to product
        </Link>
      </div>

      <div className="grid flex-1 place-items-center py-10">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="hidden lg:block">
            <AppLogo size="hero" priority className="mb-8" />
            <h1 className="max-w-xl text-5xl font-black leading-tight text-primary">
              Return to your daily operating system.
            </h1>
            <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
              Your tasks, focus sessions, workout streak, and momentum score are waiting in one calm workspace.
            </p>
            <div className="mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                { label: "Deep work", icon: Brain },
                { label: "Focus", icon: Zap },
                { label: "Streaks", icon: Activity },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.label} className="rounded-lg border bg-card/75 p-4 shadow-sm backdrop-blur">
                    <Icon className="mb-3 h-5 w-5 text-accent" />
                    <p className="text-sm font-semibold">{item.label}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mx-auto w-full max-w-md rounded-[1.5rem] border border-primary/10 bg-card/85 p-6 shadow-2xl shadow-primary/15 backdrop-blur-xl sm:p-8">
            <AppLogo size="header" priority className="mb-8 justify-center lg:hidden" />
            <div className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-black text-primary">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Sign in to structure your day and build consistency.</p>
            </div>

            <div className="mt-6 space-y-4">
              <Button
                onClick={handleGoogleLogin}
                size="lg"
                className="h-12 w-full gap-2 rounded-full shadow-lg shadow-primary/15"
                variant="default"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Built for daily discipline</span>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border bg-background/65 p-4">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Structure Your Day</p>
                <p className="text-xs text-muted-foreground">Plan, execute, and complete with intention</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10">
                <Zap className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-sm font-medium">Build Consistency</p>
                <p className="text-xs text-muted-foreground">Streaks and progress that reward daily discipline</p>
              </div>
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>

      <p className="pb-4 text-center text-sm text-muted-foreground">
        By signing in, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  )
}
