"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  FileText,
  Flame,
  ListChecks,
  Play,
  Sparkles,
  Zap,
} from "lucide-react"
import { useRouter } from "next/navigation"

import { AppLogo } from "@/components/app-logo"
import { BrandedLoader } from "@/components/branded-loader"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { APP_DESCRIPTION } from "@/lib/brand"
import { getGoogleLoginUrl } from "@/lib/api"

const featureCards = [
  {
    icon: Brain,
    title: "Deep work sequencing",
    description: "Line up demanding work first and move through the day with a clear order.",
  },
  {
    icon: Clock,
    title: "Focus sessions",
    description: "Start a commitment, protect the session, and compare actual time against the plan.",
  },
  {
    icon: Dumbbell,
    title: "Fitness consistency",
    description: "Keep the workout habit visible beside your work instead of treating it as an afterthought.",
  },
  {
    icon: Flame,
    title: "Momentum signal",
    description: "A daily score turns small completions into a visible discipline loop.",
  },
]

const taskSequence = [
  { label: "Deep Work", title: "Design review and product notes", time: "75m", icon: Brain, accent: "bg-indigo-500" },
  { label: "Shallow Work", title: "Admin queue and inbox sweep", time: "25m", icon: Zap, accent: "bg-sky-500" },
  { label: "Fitness", title: "Evening strength session", time: "45m", icon: Dumbbell, accent: "bg-emerald-500" },
]

const notePreview = [
  { text: "Capture today's decision points", checked: true },
  { text: "Turn messy ideas into toggle lists", checked: true },
  { text: "Link notes to the next focus block", checked: false },
]

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push(user.profileCompleted ? "/dashboard" : "/complete-profile")
    }
  }, [user, loading, router])

  const handleGoogleLogin = () => {
    window.location.assign(getGoogleLoginUrl())
  }

  if (loading || user) {
    return <BrandedLoader className="min-h-screen premium-shell" />
  }

  return (
    <main className="premium-shell min-h-screen overflow-hidden text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" aria-label="Momentum Mosaic home">
            <AppLogo size="header" wordmarkClassName="hidden sm:inline" />
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition hover:text-foreground">Features</a>
            <a href="#notes" className="transition hover:text-foreground">Notes preview</a>
          </nav>
          <Button onClick={handleGoogleLogin} className="rounded-full px-5 shadow-lg shadow-primary/15">
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8 lg:py-20">
        <div className="landing-noise" aria-hidden="true" />
        <div className="relative z-10 max-w-2xl reveal-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/10 bg-card/70 px-3 py-1 text-xs font-semibold uppercase text-muted-foreground shadow-sm backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Premium daily discipline system
          </div>
          <h1 className="text-5xl font-black leading-[0.95] text-primary sm:text-6xl lg:text-7xl">
            Momentum Mosaic
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground sm:text-xl">
            {APP_DESCRIPTION} Built for people who want a calm command center for focused work, fitness, and daily follow-through.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button onClick={handleGoogleLogin} size="lg" className="h-12 rounded-full px-6 shadow-xl shadow-primary/15">
              Continue with Google
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full border-primary/15 bg-card/70 px-6 backdrop-blur">
              <a href="#features">
                Explore features
                <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3 text-sm">
            {["Plan", "Execute", "Compound"].map((item) => (
              <div key={item} className="rounded-lg border border-primary/10 bg-card/65 px-3 py-2 font-semibold text-primary shadow-sm backdrop-blur">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 reveal-up reveal-delay-1">
          <ProductPreview />
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase text-accent">Core features</p>
            <h2 className="text-3xl font-black text-primary sm:text-4xl">A focused workflow with premium restraint.</h2>
          </div>
          <p className="max-w-xl text-muted-foreground">
            The public story matches what users see after login: task rails, a discipline shell, and calm surfaces that make the app feel composed.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon
            return (
              <article key={feature.title} className="group rounded-lg border bg-card/80 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-primary">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      <section id="notes" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <div className="rounded-lg border bg-card/80 p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-primary">Notes board preview</h2>
              <p className="text-sm text-muted-foreground">A future markdown workspace for quick capture, checklists, and next-step thinking.</p>
            </div>
          </div>
          <div className="rounded-lg border bg-background/70 p-4 font-mono text-sm shadow-inner">
            <p className="text-muted-foreground"># Today&apos;s operating notes</p>
            <div className="mt-4 space-y-3">
              {notePreview.map((note) => (
                <div key={note.text} className="flex items-start gap-3">
                  <span className="mt-0.5 text-accent">{note.checked ? "[x]" : "[ ]"}</span>
                  <span>{note.text}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-muted-foreground">- Draft next task sequence before opening the dashboard</p>
          </div>
        </div>
      </section>
    </main>
  )
}

function ProductPreview() {
  return (
    <div className="hero-device relative mx-auto w-full max-w-2xl rounded-[1.75rem] border border-primary/10 bg-card/85 p-4 shadow-2xl shadow-primary/15 backdrop-blur-xl">
      <div className="absolute -left-4 top-12 hidden rounded-lg border bg-background/90 p-3 shadow-xl shadow-primary/10 sm:block">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Focus active
        </div>
      </div>
      <div className="rounded-[1.25rem] border bg-background/80 p-4">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-muted-foreground">Daily discipline</p>
            <h2 className="text-2xl font-black text-primary">Today&apos;s Momentum</h2>
          </div>
          <div className="rounded-lg bg-primary px-3 py-2 text-right text-primary-foreground">
            <div className="text-xs opacity-75">Score</div>
            <div className="text-xl font-black">82</div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["3", "open"],
            ["2", "done"],
            ["145m", "left"],
          ].map(([value, label]) => (
            <div key={label} className="rounded-lg border bg-card/80 p-3">
              <div className="text-xl font-black text-primary">{value}</div>
              <div className="text-xs font-medium text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <div className="mt-5 space-y-3">
          {taskSequence.map((task, index) => {
            const Icon = task.icon
            return (
              <div key={task.title} className="hero-task-row rounded-lg border bg-card/90 p-4" style={{ animationDelay: `${index * 150}ms` }}>
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Icon className="h-4 w-4" />
                    {task.label}
                  </div>
                  <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className={`mb-2 h-1.5 w-9 rounded-full ${task.accent}`} />
                    <p className="font-semibold leading-tight">{task.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{task.time}</p>
                  </div>
                  <Button size="icon" className="rounded-full">
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border bg-emerald-50/80 p-4 text-emerald-800">
            <Activity className="mb-3 h-5 w-5" />
            <p className="font-bold">Workout protected</p>
            <p className="mt-1 text-sm text-emerald-700">14 day streak</p>
          </div>
          <div className="rounded-lg border bg-card/90 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary">
              <ListChecks className="h-4 w-4" />
              Notes board
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex gap-2"><CheckCircle2 className="mt-0.5 h-4 w-4 text-accent" /> Review project priorities</p>
              <p className="flex gap-2"><span className="mt-1 h-2 w-2 rounded-full bg-muted-foreground/40" /> Draft next toggle list</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
