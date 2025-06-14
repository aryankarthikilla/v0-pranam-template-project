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
        "fixed z-20 rounded-full border bg-background shadow-md transition-all duration-200",
        "flex items-center justify-center p-0",
        // Default size (half of original)
        "h-3 w-3",
        // Hover size (original size) with theme colors
        "hover:h-6 hover:w-6 hover:bg-muted hover:text-primary hover:border-primary/20",
        // Position at intersection of sidebar right edge and header bottom
        // Sidebar width is typically 256px (w-64), so position at that point
        isCollapsed ? "left-[76px]" : "left-[252px]",
        // Position at header height (typically 64px for header)
        "top-[60px]",
        // Transform to center the button exactly at the intersection
        "-translate-x-1/2 -translate-y-1/2",
      )}
    >
      <ChevronRight
        className={cn("h-2 w-2 transition-all duration-200", "hover:h-3 hover:w-3", !isCollapsed && "rotate-180")}
      />
    </Button>
  )
}
