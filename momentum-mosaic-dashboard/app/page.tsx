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
import { motion } from "framer-motion"

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
              <h2 className="text-2xl font-black text-primary">Study workspace preview</h2>
              <p className="text-sm text-muted-foreground">A plain-text workspace for focused thinking, quick capture, and one active block at a time.</p>
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
    <div className="relative mx-auto w-full max-w-4xl">
      {/* Background ambient glow behind the preview */}
      <div className="absolute inset-0 -m-8 bg-primary/10 blur-[100px] rounded-full" aria-hidden="true" />
      
      {/* Main Container - The Operating System Window */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{
          opacity: { duration: 0.8, ease: "easeOut" },
          y: { duration: 12, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
        }}
        className="relative z-10 rounded-[2rem] border border-primary/10 bg-card/85 p-4 shadow-2xl backdrop-blur-2xl sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-12">
          
          {/* Top Left: Active Focus Session (Immersive) */}
          <div className="flex flex-col justify-between rounded-[1.5rem] border border-indigo-500/20 bg-indigo-500/5 p-6 sm:col-span-8 relative overflow-hidden">
             {/* Subtle glow behind the active task */}
             <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-indigo-500/20 blur-[50px]" />
             
             <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex w-fit items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500 breathe-opacity" />
                  </span>
                  Focus Mode Active
                </div>
                <div className="font-mono text-xs font-medium text-indigo-600/70 dark:text-indigo-400/70 tracking-wider">SESSION_01</div>
             </div>
             
             <div className="relative z-10 mt-10 mb-8">
               <h3 className="text-3xl font-black text-foreground sm:text-4xl tracking-tight">System architecture</h3>
               <p className="mt-2 text-sm font-medium text-muted-foreground flex items-center gap-2">
                 <Brain className="h-4 w-4" />
                 Deep work • 75m planned
               </p>
             </div>
             
             <div className="relative z-10 flex items-center gap-5">
               <div className="font-mono text-4xl font-light text-foreground tracking-tighter">34:12</div>
               <div className="h-1.5 flex-1 bg-indigo-500/10 overflow-hidden rounded-full">
                 <div className="h-full bg-indigo-500 w-[45%] rounded-full relative">
                   <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-r from-transparent to-white/50 blur-[2px]" />
                 </div>
               </div>
               <div className="font-mono text-sm font-medium text-indigo-600 dark:text-indigo-400">45%</div>
             </div>
          </div>
          
          {/* Top Right: Momentum Score Centerpiece */}
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-primary/10 bg-muted/30 p-6 sm:col-span-4 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
            
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="absolute inset-0 h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="2" className="text-primary/10" />
                <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="289" strokeDashoffset="52" className="text-primary transition-all duration-1000" strokeLinecap="round" />
              </svg>
              <div className="text-center">
                <div className="text-4xl font-black text-foreground tracking-tighter">82</div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mt-1">Score</div>
              </div>
            </div>
            
            <div className="mt-6 text-center z-10">
              <div className="text-xs font-bold text-foreground">Momentum Signal</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1 font-semibold">Highly disciplined</div>
            </div>
          </div>
          
          {/* Bottom Left: The Sequence */}
          <div className="rounded-[1.5rem] border border-primary/5 bg-muted/30 p-5 sm:col-span-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Today's Sequence</div>
              <div className="text-xs font-semibold text-muted-foreground/70">2/5 Done</div>
            </div>
            <div className="space-y-4">
               {/* Completed Task */}
               <div className="flex items-center gap-3 opacity-50">
                 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                   <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                 </div>
                 <div className="flex-1 truncate text-sm font-medium text-foreground line-through decoration-muted-foreground/50">Morning sync & planning</div>
               </div>
               
               {/* Active Task Marker */}
               <div className="flex items-center gap-3">
                 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-500/20">
                   <div className="h-2 w-2 rounded-full bg-indigo-500" />
                 </div>
                 <div className="flex-1 truncate text-sm font-bold text-foreground">System architecture</div>
               </div>
               
               {/* Upcoming Task */}
               <div className="flex items-center gap-3">
                 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/20">
                   <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                 </div>
                 <div className="flex-1 truncate text-sm font-medium text-muted-foreground">Frontend alignment</div>
               </div>
               
               {/* Fitness Task */}
               <div className="flex items-center gap-3">
                 <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                   <Dumbbell className="h-3 w-3 text-emerald-600 dark:text-emerald-500" />
                 </div>
                 <div className="flex-1 truncate text-sm font-medium text-emerald-700 dark:text-emerald-400/80">Zone 2 Run (45m)</div>
               </div>
            </div>
          </div>
          
          {/* Bottom Right: Status & Insights */}
          <div className="grid gap-4 sm:col-span-7 sm:grid-cols-2">
            <div className="flex flex-col justify-between rounded-[1.5rem] border border-emerald-500/15 bg-emerald-500/5 p-5 relative overflow-hidden group">
               <div className="absolute -right-4 -top-4 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:-translate-y-2">
                 <Flame className="h-32 w-32 text-emerald-500" />
               </div>
               <div className="relative z-10">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500/70">Fitness Protocol</div>
                 <div className="mt-2 text-3xl font-black text-emerald-600 dark:text-emerald-400">14 Day</div>
                 <div className="text-xs font-semibold text-emerald-600/70 dark:text-emerald-500/60 mt-1 uppercase tracking-wider">unbroken streak</div>
               </div>
               <div className="relative z-10 mt-6 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-3 py-2 w-fit">
                 <span className="flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                   <CheckCircle2 className="h-3.5 w-3.5" />
                 </span>
                 <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Protected today</span>
               </div>
            </div>
            
            <div className="flex flex-col justify-between rounded-[1.5rem] border border-primary/5 bg-muted/30 p-5">
               <div className="flex items-center justify-between">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Capacity</div>
                 <Activity className="h-4 w-4 text-muted-foreground/50" />
               </div>
               
               <div className="mt-4">
                 <div className="flex items-baseline gap-1.5">
                   <div className="text-3xl font-black text-foreground tracking-tighter">145</div>
                   <div className="text-sm font-bold text-muted-foreground">min</div>
                 </div>
                 <div className="mt-1 text-xs font-semibold text-muted-foreground/60">remaining focus time</div>
               </div>
               
               <div className="mt-6 flex h-8 gap-1.5 items-end">
                 {[1, 0.8, 1, 0.9, 0.4, 0.1, 0].map((val, i) => (
                   <div key={i} className="flex-1 rounded-sm bg-primary/10 overflow-hidden relative" style={{ height: '100%' }}>
                     <div className="absolute bottom-0 w-full bg-primary rounded-sm transition-all" style={{ height: `${val * 100}%` }} />
                   </div>
                 ))}
               </div>
            </div>
          </div>
          
        </div>
      </motion.div>
      
      {/* Floating Decorative Elements for Depth */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0, y: [0, -6, 0] }}
        transition={{ 
          opacity: { delay: 1.2, duration: 0.8 },
          x: { delay: 1.2, duration: 0.8 },
          y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
        }}
        className="absolute -right-6 -top-6 z-20 hidden rounded-2xl border border-primary/10 bg-card/95 p-4 shadow-2xl backdrop-blur-xl sm:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">Execution tight</div>
            <div className="text-xs font-medium text-muted-foreground">Estimates matching actuals</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
