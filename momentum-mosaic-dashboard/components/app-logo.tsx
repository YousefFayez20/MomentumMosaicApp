import Image from "next/image"

import { APP_LOGO_ALT, APP_LOGO_PATH, APP_NAME } from "@/lib/brand"
import { cn } from "@/lib/utils"

const logoSizes = {
  compact: {
    mark: "h-9 w-9 rounded-lg",
    text: "text-lg",
  },
  header: {
    mark: "h-10 w-10 rounded-xl",
    text: "text-xl",
  },
  hero: {
    mark: "h-16 w-16 rounded-2xl",
    text: "text-4xl",
  },
} as const

type AppLogoProps = {
  size?: keyof typeof logoSizes
  showWordmark?: boolean
  priority?: boolean
  className?: string
  markClassName?: string
  wordmarkClassName?: string
}

export function AppLogo({
  size = "header",
  showWordmark = true,
  priority = false,
  className,
  markClassName,
  wordmarkClassName,
}: AppLogoProps) {
  const styles = logoSizes[size]

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Image
        src={APP_LOGO_PATH}
        alt={APP_LOGO_ALT}
        width={510}
        height={510}
        priority={priority}
        className={cn("shrink-0 object-contain shadow-sm ring-1 ring-border/70", styles.mark, markClassName)}
      />
      {showWordmark && (
        <span className={cn("font-extrabold tracking-tight text-foreground", styles.text, wordmarkClassName)}>
          Momentum <span className="text-primary">Mosaic</span>
        </span>
      )}
      {!showWordmark && <span className="sr-only">{APP_NAME}</span>}
    </div>
  )
}
