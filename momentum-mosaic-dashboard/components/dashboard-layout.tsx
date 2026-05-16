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
    <div className="discipline-shell flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 border-b border-white/60 bg-card/80 shadow-sm shadow-primary/5 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" aria-label="Go to Momentum Mosaic dashboard">
            <AppLogo size="header" wordmarkClassName="hidden sm:inline" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 rounded-full border border-primary/10 bg-background/60 px-2 py-1 shadow-sm backdrop-blur md:flex">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={cn(
                      "h-9 rounded-full gap-2 px-4",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-card hover:text-foreground",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <div className="hidden rounded-full border border-primary/10 bg-background/65 px-3 py-2 text-right shadow-sm backdrop-blur md:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="icon" onClick={logout} className="hidden rounded-full border-primary/10 bg-background/65 md:flex">
              <LogOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full border-primary/10 bg-background/65 md:hidden"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="border-t bg-card/90 p-4 backdrop-blur md:hidden">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    <Button variant={isActive ? "default" : "ghost"} className="w-full justify-start gap-2">
                      <Icon className="h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                )
              })}
              <Button variant="ghost" className="w-full justify-start gap-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>
    </div>
  )
}
