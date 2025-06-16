"use client"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  loading?: boolean
  className?: string
}

export function AnimatedCheckbox({
  checked,
  onChange,
  disabled = false,
  loading = false,
  className,
}: AnimatedCheckboxProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && !loading && onChange(!checked)}
      disabled={disabled || loading}
      className={cn(
        "relative h-5 w-5 rounded border-2 transition-all duration-200 ease-in-out",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "hover:scale-110 active:scale-95",
        checked
          ? "bg-primary border-primary text-primary-foreground"
          : "border-input bg-background hover:border-primary/50",
        disabled && "opacity-50 cursor-not-allowed",
        loading && "cursor-wait",
        className,
      )}
    >
      {/* Checkmark */}
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-all duration-200",
          checked ? "scale-100 opacity-100" : "scale-0 opacity-0",
        )}
      >
        <Check className="h-3 w-3" />
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
    </button>
  )
}
