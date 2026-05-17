"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { LayoutDashboard, ListTodo, Dumbbell, User, Menu, LogOut, X } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Tasks", href: "/tasks", icon: ListTodo },
    { name: "Fitness", href: "/fitness", icon: Dumbbell },
    { name: "Profile", href: "/profile", icon: User },
  ]

  return (
    <div className="discipline-shell relative flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <div className="discipline-ambient" aria-hidden="true" />
      <header className="sticky top-0 z-50 border-b border-white/40 bg-white/30 shadow-sm backdrop-blur-2xl relative">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="Go to Momentum Mosaic dashboard">
            <AppLogo size="header" wordmarkClassName="hidden sm:inline" />
          </Link>

          {/* Desktop Navigation */}
          <motion.nav
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="hidden items-center gap-1 rounded-full border border-white/60 bg-white/40 p-1.5 shadow-sm backdrop-blur-md md:flex"
          >
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "h-9 rounded-full gap-2 px-5 transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-100 font-semibold"
                        : "text-muted-foreground hover:bg-white/60 hover:text-foreground font-medium scale-95 hover:scale-100",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </motion.nav>

          <motion.div
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="hidden rounded-full border border-white/60 bg-white/40 px-4 py-1.5 text-right shadow-sm backdrop-blur-md md:block">
              <p className="text-sm font-bold text-primary">{user?.name}</p>
              <p className="text-xs font-medium text-muted-foreground/80">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="hidden rounded-full hover:bg-white/60 hover:text-destructive md:flex transition-colors">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full border-white/60 bg-white/40 shadow-sm backdrop-blur-md md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-white/40 bg-white/80 p-4 backdrop-blur-xl md:hidden shadow-lg">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive ? "default" : "ghost"} className={cn("w-full justify-start gap-3 rounded-xl", isActive ? "shadow-md" : "hover:bg-white/60")}>
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </Button>
                  </Link>
                )
              })}
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive mt-4" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
            <div className="mt-6 border-t border-white/40 pt-4 px-2">
              <p className="text-sm font-bold text-primary">{user?.name}</p>
              <p className="text-xs font-medium text-muted-foreground/80">{user?.email}</p>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10">{children}</main>
    </div>
  )
}
