"use client"

import Image from "next/image"
import { motion } from "framer-motion"

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
      <motion.div
        animate={{
          y: [0, -1.5, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative shrink-0 flex items-center justify-center"
      >
        <Image
          src={APP_LOGO_PATH}
          alt={APP_LOGO_ALT}
          width={510}
          height={510}
          priority={priority}
          className={cn("relative z-10 shrink-0 object-contain shadow-sm ring-1 ring-border/70 transition-transform duration-500 hover:scale-105", styles.mark, markClassName)}
        />
        {/* Soft elegant glowing ring that pulses and rotates behind the logo */}
        <motion.div
          animate={{
            scale: [0.95, 1.1, 0.95],
            opacity: [0.2, 0.5, 0.2],
            rotate: [0, 360],
          }}
          transition={{
            scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 8, repeat: Infinity, ease: "easeInOut" },
            rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          }}
          className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-primary/20 via-accent/10 to-transparent blur-[8px] pointer-events-none"
        />
      </motion.div>
      {showWordmark && (
        <span className={cn("font-extrabold tracking-tight text-foreground", styles.text, wordmarkClassName)}>
          Momentum <span className="text-primary">Mosaic</span>
        </span>
      )}
      {!showWordmark && <span className="sr-only">{APP_NAME}</span>}
    </div>
  )
}
