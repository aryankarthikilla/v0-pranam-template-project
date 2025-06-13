"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

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

export function Logo({ className, size = "md", showText = true }: LogoProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <Image src="/images/pranam-logo.png" alt="Pranam Logo" fill className="object-contain" priority />
      </div>
      {showText && (
        <span
          className={cn(
            "font-bold text-gray-900 dark:text-white",
            size === "sm" && "text-sm",
            size === "md" && "text-lg",
            size === "lg" && "text-xl",
            size === "xl" && "text-2xl",
          )}
        >
          प्रणाम (Pranam)
        </span>
      )}
    </div>
  )
}
