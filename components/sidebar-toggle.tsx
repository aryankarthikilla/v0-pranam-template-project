"use client"

import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

export function SidebarToggle() {
  const { state, toggleSidebar } = useSidebar()
  const isCollapsed = state === "collapsed"

  return (
    <Button
      onClick={toggleSidebar}
      variant="ghost"
      size="sm"
      className={cn(
        "fixed top-14 z-20 rounded-full border bg-background shadow-md transition-all duration-200",
        "flex items-center justify-center p-0",
        // Default size (half of original)
        "h-3 w-3",
        // Hover size (original size) with theme colors
        "hover:h-6 hover:w-6 hover:bg-muted hover:text-primary hover:border-primary/20",
        // Position adjustments - move 2px up and 2px right from intersection
        isCollapsed ? "left-6" : "left-62",
        // Move up 2px from top-14 (56px) to top-[54px]
        "top-[54px]",
      )}
    >
      <ChevronRight
        className={cn("h-2 w-2 transition-all duration-200", "hover:h-3 hover:w-3", !isCollapsed && "rotate-180")}
      />
    </Button>
  )
}
