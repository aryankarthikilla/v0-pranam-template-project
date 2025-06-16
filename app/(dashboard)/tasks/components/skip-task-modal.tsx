"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, Coffee, Moon } from "lucide-react"
import { skipTask } from "../actions/enhanced-task-actions"
import { toast } from "sonner"

interface SkipTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
  onSuccess: () => void
}

const SKIP_OPTIONS = [
  { value: "1hour", label: "1 Hour", icon: Coffee, description: "Quick break" },
  { value: "4hours", label: "4 Hours", icon: Clock, description: "Later today" },
  { value: "tomorrow", label: "Tomorrow", icon: Calendar, description: "Next day" },
  { value: "3days", label: "3 Days", icon: Calendar, description: "This week" },
  { value: "1week", label: "1 Week", icon: Moon, description: "Next week" },
]

export function SkipTaskModal({ open, onOpenChange, task, onSuccess }: SkipTaskModalProps) {
  const [selectedDuration, setSelectedDuration] = useState("tomorrow")
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSkip = async () => {
    if (!task?.id) return

    setIsSubmitting(true)
    try {
      const result = await skipTask(task.id, selectedDuration, reason)

      if (result.success) {
        toast.success(`Task skipped until ${new Date(result.scheduledFor!).toLocaleString()}`)
        onSuccess()
        onOpenChange(false)
        setReason("")
      } else {
        toast.error(result.error || "Failed to skip task")
      }
    } catch (error) {
      toast.error("Failed to skip task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScheduledTime = () => {
    const now = new Date()
    const scheduled = new Date(now)

    switch (selectedDuration) {
      case "1hour":
        scheduled.setHours(now.getHours() + 1)
        break
      case "4hours":
        scheduled.setHours(now.getHours() + 4)
        break
      case "tomorrow":
        scheduled.setDate(now.getDate() + 1)
        scheduled.setHours(9, 0, 0, 0) // 9 AM tomorrow
        break
      case "3days":
        scheduled.setDate(now.getDate() + 3)
        scheduled.setHours(9, 0, 0, 0)
        break
      case "1week":
        scheduled.setDate(now.getDate() + 7)
        scheduled.setHours(9, 0, 0, 0)
        break
    }

    return scheduled
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            Skip Task
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm">{task?.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              This task will be rescheduled and appear in your task list at the selected time.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Skip Duration</label>
            <div className="grid grid-cols-1 gap-2">
              {SKIP_OPTIONS.map((option) => {
                const Icon = option.icon
                const isSelected = selectedDuration === option.value

                return (
                  <button
                    key={option.value}
                    onClick={() => setSelectedDuration(option.value)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      isSelected
                        ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${isSelected ? "text-orange-600" : "text-muted-foreground"}`} />
                      <div className="text-left">
                        <div
                          className={`text-sm font-medium ${isSelected ? "text-orange-700 dark:text-orange-300" : ""}`}
                        >
                          {option.label}
                        </div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                        Selected
                      </Badge>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Scheduled For</span>
            </div>
            <p className="text-sm text-blue-600 dark:text-blue-400">{getScheduledTime().toLocaleString()}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (Optional)</label>
            <Textarea
              placeholder="Why are you skipping this task? e.g., waiting for information, not the right time, need to focus on something else..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleSkip} disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700">
              {isSubmitting ? "Skipping..." : "Skip Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
