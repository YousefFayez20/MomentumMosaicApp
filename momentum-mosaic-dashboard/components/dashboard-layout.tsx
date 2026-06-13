"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { AppLogo } from "@/components/app-logo"
import { LayoutDashboard, ListTodo, Dumbbell, User, Menu, LogOut, X, BookOpenText } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export function DashboardLayout({
  children,
  beforeNavigate,
}: {
  children: React.ReactNode
  beforeNavigate?: (href: string) => boolean
}) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Workspace", href: "/workspace", icon: BookOpenText },
    { name: "Tasks", href: "/tasks", icon: ListTodo },
    { name: "Fitness", href: "/fitness", icon: Dumbbell },
    { name: "Profile", href: "/profile", icon: User },
  ]

  const handleNavigate = (href: string) => {
    const workspaceActive = href === "/workspace" && pathname.startsWith("/workspace")
    if (pathname === href || workspaceActive) {
      setMobileMenuOpen(false)
      return
    }

    if (beforeNavigate && beforeNavigate(href) === false) {
      return
    }

    setMobileMenuOpen(false)
    router.push(href)
  }

  return (
    <div className="discipline-shell relative flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <div className="discipline-ambient" aria-hidden="true" />
      <header className="app-header-surface sticky top-0 z-50 relative">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => handleNavigate("/dashboard")}
            aria-label="Go to Momentum Mosaic dashboard"
            className="cursor-pointer"
          >
            <AppLogo size="header" wordmarkClassName="hidden sm:inline" />
          </button>

          {/* Desktop Navigation */}
          <nav
            className="app-nav-surface hidden items-center gap-1 rounded-xl p-1 md:flex"
          >
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = item.href === "/workspace" ? pathname.startsWith("/workspace") : pathname === item.href
              return (
                <Button
                  key={item.href}
                  type="button"
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => handleNavigate(item.href)}
                  className={cn(
                    "h-9 rounded-lg gap-2 px-4 text-sm transition-colors duration-150",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground font-medium",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              )
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden border-l border-border/70 pl-4 text-right md:block">
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs font-medium text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} className="hidden rounded-lg hover:bg-muted hover:text-destructive md:flex transition-colors">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-border bg-background/95 p-4 backdrop-blur-xl md:hidden shadow-sm">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = item.href === "/workspace" ? pathname.startsWith("/workspace") : pathname === item.href
                return (
                  <Button
                    key={item.href}
                    type="button"
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => handleNavigate(item.href)}
                    className={cn("w-full justify-start gap-3 rounded-lg", isActive ? "" : "hover:bg-muted")}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{item.name}</span>
                  </Button>
                )
              })}
              <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive mt-4" onClick={logout}>
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
            <div className="mt-6 border-t border-border pt-4 px-2">
              <p className="text-sm font-semibold text-foreground">{user?.name}</p>
              <p className="text-xs font-medium text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10">{children}</main>
    </div>
  )
}
