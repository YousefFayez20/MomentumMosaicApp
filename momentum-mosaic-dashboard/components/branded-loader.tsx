import { AppLogo } from "@/components/app-logo"
import { APP_NAME } from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandedLoaderProps = {
  className?: string
  label?: string
}

export function BrandedLoader({ className, label = `Loading ${APP_NAME}` }: BrandedLoaderProps) {
  return (
    <div className={cn("flex h-full min-h-[16rem] flex-col items-center justify-center gap-4", className)} role="status">
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-primary/10 blur-xl" />
        <AppLogo showWordmark={false} size="hero" markClassName="relative h-14 w-14 rounded-2xl" priority />
      </div>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
