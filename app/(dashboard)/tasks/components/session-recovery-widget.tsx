"use client"

import { RefreshCw } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { fixOrphanedTasks } from "../actions/enhanced-task-actions"

interface SessionRecoveryWidgetProps {
  onRecoveryComplete?: () => void
}

export function SessionRecoveryWidget({ onRecoveryComplete }: SessionRecoveryWidgetProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Button
      onClick={async () => {
        setIsLoading(true)
        try {
          const result = await fixOrphanedTasks()
          if (result.success) {
            toast.success(result.message || "Orphaned tasks fixed successfully!")
            if (onRecoveryComplete) {
              onRecoveryComplete()
            }
          } else {
            toast.error(result.error || "Failed to fix orphaned tasks")
          }
        } catch (error) {
          toast.error("Failed to fix orphaned tasks")
        } finally {
          setIsLoading(false)
        }
      }}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      <RefreshCw className="h-4 w-4 mr-2" />
      Fix Orphaned Tasks
    </Button>
  )
}
