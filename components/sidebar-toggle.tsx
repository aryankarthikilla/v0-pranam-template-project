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
        "fixed top-14 z-20 h-6 w-6 rounded-full border bg-background shadow-md transition-all duration-200 hover:h-8 hover:w-8",
        "flex items-center justify-center p-0",
        isCollapsed ? "left-4" : "left-60",
      )}
    >
      <ChevronRight className={cn("h-3 w-3 transition-transform duration-200", !isCollapsed && "rotate-180")} />
    </Button>
  )
}
