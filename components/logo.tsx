"use client"

import { cn } from "@/lib/utils"
import { useTranslations } from "@/lib/i18n/hooks"

interface LogoProps {
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
  showText?: boolean
}

const sizeClasses = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-12 h-12",
  xl: "w-16 h-16",
}

const textSizeClasses = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-xl",
  xl: "text-2xl",
}

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  const { t } = useTranslations("common")

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Keep the original geometric logo design */}
      <div className={cn("relative flex items-center justify-center", sizeClasses[size])}>
        <div className="relative w-full h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <div className="w-1/2 h-1/2 bg-primary-foreground rounded-full flex items-center justify-center">
              <div className="w-1/3 h-1/3 bg-gradient-to-br from-primary to-primary/60 rounded-full"></div>
            </div>
          </div>
          {/* Subtle glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80 rounded-full blur-sm opacity-30 -z-10"></div>
        </div>
      </div>

      {/* Only the text changes based on language */}
      {showText && (
        <span className={cn("font-bold text-foreground transition-colors duration-200", textSizeClasses[size])}>
          {t("appName")}
        </span>
      )}
    </div>
  )
}
