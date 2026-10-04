"use client"

import { useEffect } from "react"
import Link from "next/link"
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  FileText,
  Flame,
  Sparkles,
  Zap,
  Circle
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
    <main className="min-h-screen overflow-x-hidden bg-[#FAFAFA] text-[#0b1c30] font-sans selection:bg-blue-600/20 selection:text-blue-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[#FAFAFA]/80 backdrop-blur-xl border-b border-slate-200/50">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-16">
          <Link href="/" aria-label="Momentum Mosaic home">
            <AppLogo size="header" wordmarkClassName="hidden sm:inline" />
          </Link>
          <nav className="hidden items-center gap-10 text-[16px] font-semibold text-slate-500 md:flex">
            <a href="#features" className="transition-colors hover:text-[#0b1c30]">Philosophy</a>
            <a href="#notes" className="transition-colors hover:text-[#0b1c30]">Journal</a>
            <a href="#notes" className="transition-colors hover:text-[#0b1c30]">Library</a>
            <a href="#notes" className="transition-colors hover:text-[#0b1c30]">Growth Maps</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleGoogleLogin} className="hidden sm:inline-flex text-slate-500 hover:text-[#0b1c30] font-semibold text-[14px]">
              Sign In
            </Button>
            <Button onClick={handleGoogleLogin} className="rounded-lg px-6 shadow-lg shadow-blue-600/20 bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 text-[14px] font-semibold font-sans">
              Watch Demo
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1440px] grid-cols-1 items-center gap-16 px-4 py-16 lg:grid-cols-12 lg:px-16 lg:py-24">
        
        {/* Hero Content */}
        <div className="relative z-10 lg:col-span-5 space-y-10 reveal-up">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white px-5 py-2 text-xs font-bold uppercase tracking-wider text-blue-600 shadow-sm">
            Premium daily discipline system
          </div>
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-[#0b1c30] sm:text-6xl lg:text-[56px] lg:leading-[64px]">
            Momentum <br /><span className="text-blue-600">Mosaic</span>
          </h1>
          <p className="max-w-md text-lg italic font-medium leading-relaxed text-slate-500 font-serif">
            {APP_DESCRIPTION} A calm command center for focused work, fitness, and daily follow-through.
          </p>
          <div className="flex flex-col gap-5 sm:flex-row pt-6">
            <Button onClick={handleGoogleLogin} size="lg" className="group flex h-14 items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 text-[14px] font-semibold text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.2)] transition-all hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(37,99,235,0.3)] active:scale-95">
              <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#ffffff" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#ffffff" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#ffffff" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#ffffff" />
              </svg>
              Continue with Google
            </Button>
            <Button asChild size="lg" variant="outline" className="flex h-14 items-center justify-center rounded-xl border border-slate-200/80 bg-white px-8 text-[14px] font-semibold text-[#0b1c30] shadow-sm transition-all hover:border-slate-300 hover:shadow-md active:scale-95">
              <a href="#features">
                Explore features
              </a>
            </Button>
          </div>
        </div>

        {/* Product Preview */}
        <div className="relative lg:col-span-7 reveal-up reveal-delay-1">
          <ProductPreview />
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-16">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-600">Core features</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-[#0b1c30] sm:text-4xl">A focused workflow with premium restraint.</h2>
          </div>
          <p className="max-w-xl text-lg text-slate-500 font-medium">
            The public story matches what users see after login: task rails, a discipline shell, and calm surfaces that make the app feel composed.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featureCards.map((feature) => {
            const Icon = feature.icon
            return (
              <article key={feature.title} className="group rounded-2xl border border-slate-200/60 bg-white p-6 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(37,99,235,0.1)]">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-[#0b1c30] text-[18px]">{feature.title}</h3>
                <p className="mt-2 text-[16px] leading-relaxed text-slate-500">{feature.description}</p>
              </article>
            )
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-[#FAFAFA] border-t border-slate-200/50 mt-12">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-4 py-8 sm:px-6 md:flex-row lg:px-16">
          <div className="flex items-center gap-4">
            <span className="text-[14px] font-bold text-[#0b1c30]">Momentum Mosaic</span>
            <span className="text-[12px] font-semibold text-slate-500/80">© 2024. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-8">
            <a href="#" className="text-[12px] font-semibold text-slate-500 transition-colors hover:text-[#0b1c30]">Privacy Policy</a>
            <a href="#" className="text-[12px] font-semibold text-slate-500 transition-colors hover:text-[#0b1c30]">Terms of Service</a>
            <a href="#" className="text-[12px] font-semibold text-slate-500 transition-colors hover:text-[#0b1c30]">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  )
}

function ProductPreview() {
  return (
    <div className="relative w-full">
      {/* Decorative Glows */}
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-blue-300/10 blur-[120px] pointer-events-none" />
      
      {/* Main Mosaic Shell */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative overflow-hidden rounded-[1.5rem] border border-slate-200/60 bg-white/90 p-6 shadow-[0_30px_60px_-10px_rgba(0,0,0,0.03),0_10px_20px_-5px_rgba(0,0,0,0.02)] backdrop-blur-3xl md:rounded-[2rem] md:p-12"
      >
        {/* Premium SVG Connections - Continuity Flow */}
        <svg className="absolute inset-0 z-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
          <defs>
            <linearGradient id="vectorGrad" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stopColor="#2563eb" stopOpacity="0" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur result="coloredBlur" stdDeviation="3" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Continuous flow from Active Session to Workspace Notes */}
          <path 
            d="M 150 150 C 300 150, 300 650, 650 650" 
            fill="none" stroke="#E5E7EB" strokeWidth="1" 
          />
          <motion.path 
            d="M 150 150 C 300 150, 300 650, 650 650" 
            fill="none" filter="url(#glow)" stroke="url(#vectorGrad)" strokeWidth="1.5"
            initial={{ strokeDasharray: "8 20", strokeDashoffset: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          />
          {/* Flow from Momentum Score to Today's Sequence */}
          <path 
            d="M 650 150 C 500 150, 500 650, 150 650" 
            fill="none" stroke="#E5E7EB" strokeWidth="1" 
          />
          <motion.path 
            d="M 650 150 C 500 150, 500 650, 150 650" 
            fill="none" filter="url(#glow)" stroke="url(#vectorGrad)" strokeWidth="1.5"
            initial={{ strokeDasharray: "8 20", strokeDashoffset: 1000 }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 20, ease: "linear", repeat: Infinity }}
          />
          {/* Horizontal bridge */}
          <path 
            d="M 250 250 L 550 250" 
            fill="none" stroke="#E5E7EB" strokeDasharray="4 4" strokeWidth="1" 
          />
        </svg>

        <div className="relative z-10 grid gap-6 md:grid-cols-2 md:grid-rows-2">
          
          {/* Zone 1: Active Focus Session */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h3 className="mb-2 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Active Session</h3>
                <p className="text-[20px] font-bold text-[#0b1c30]">System architecture</p>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-[12px] font-bold text-blue-600 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600"></span>
                </span>
                Focus Mode Active
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[14px]">
                <span className="font-semibold text-slate-500">75m planned</span>
                <span className="font-bold text-blue-600">42m elapsed</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full border border-slate-200/80 bg-slate-50">
                <div className="relative h-full w-[56%] overflow-hidden rounded-full bg-blue-600 shadow-[0_0_12px_rgba(37,99,235,0.6)]">
                  <motion.div 
                    initial={{ x: "-100%" }}
                    animate={{ x: "200%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 h-full w-full -skew-x-12 transform bg-white/20" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Zone 2: Momentum Score */}
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/60 bg-white p-8 text-center shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="relative mb-6 h-36 w-36">
              <svg className="h-full w-full -rotate-90 drop-shadow-md" viewBox="0 0 100 100">
                <circle cx="50" cy="50" fill="none" r="44" stroke="#eff4ff" strokeWidth="8" />
                <circle cx="50" cy="50" fill="none" r="44" stroke="#2563eb" strokeDasharray="276" strokeDashoffset="50" strokeLinecap="round" strokeWidth="8" className="drop-shadow-[0_4px_6px_rgba(37,99,235,0.3)]" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[40px] font-extrabold tracking-tight text-[#0b1c30]">82</span>
                <span className="mt-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">Score</span>
              </div>
            </div>
            <h4 className="mb-2 text-lg font-bold text-[#0b1c30]">Momentum Signal</h4>
            <p className="rounded-full border border-blue-100 bg-blue-50 px-5 py-1.5 text-[14px] font-semibold text-blue-600 shadow-sm">Highly disciplined</p>
          </div>

          {/* Zone 3: Today's Sequence */}
          <div className="rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <h3 className="mb-6 text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Today's Sequence</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm transition-colors">
                <CheckCircle2 className="h-6 w-6 text-blue-600" />
                <span className="text-[16px] font-semibold text-[#0b1c30]">Design review</span>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors">
                <Circle className="h-6 w-6 text-slate-400" />
                <span className="text-[16px] font-medium text-[#0b1c30]">Team sync</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-colors">
                <div className="flex items-center gap-4">
                  <Dumbbell className="h-6 w-6 text-amber-600" />
                  <span className="text-[16px] font-medium text-[#0b1c30]">Evening strength</span>
                </div>
                <span className="rounded bg-amber-50 px-2 py-1 text-[12px] font-bold text-amber-700">18:00</span>
              </div>
            </div>
          </div>

          {/* Zone 4: Workspace Notes */}
          <div className="flex flex-col rounded-2xl border border-slate-200/60 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
            <div className="mb-6 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <h3 className="text-[12px] font-bold uppercase tracking-[0.1em] text-slate-500">Workspace Notes</h3>
            </div>
            <div className="space-y-4">
              <h4 className="text-[20px] font-medium italic text-[#0b1c30] font-serif">Strategic Architecture</h4>
              <ul className="space-y-2">
                <li className="flex items-center gap-3 text-[16px] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  Define core nodes
                </li>
                <li className="flex items-center gap-3 text-[16px] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  Map execution flow
                </li>
                <li className="flex items-center gap-3 text-[16px] text-slate-600">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-400"></span>
                  Review hierarchy
                </li>
              </ul>
              <div className="border-t border-slate-200/80 pt-4">
                <details className="group" open>
                  <summary className="flex cursor-pointer list-none items-center gap-2 text-[14px] font-semibold text-[#0b1c30]">
                    <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-open:rotate-90" />
                    Implementation Details
                  </summary>
                  <div className="pl-7 pt-2 text-[16px] text-slate-600 font-serif">
                    Finalize 1px border audit
                  </div>
                </details>
              </div>
            </div>
          </div>

        </div>
      </motion.div>

      {/* Floating Decorative Elements */}
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -left-8 -top-8 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] z-20"
      >
        <Zap className="h-6 w-6 text-amber-600 fill-current" />
      </motion.div>
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute -bottom-6 -right-6 rounded-2xl border border-slate-200/60 bg-white p-5 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] z-20"
      >
        <Sparkles className="h-6 w-6 text-blue-600 fill-current" />
      </motion.div>
    </div>
  )
}
