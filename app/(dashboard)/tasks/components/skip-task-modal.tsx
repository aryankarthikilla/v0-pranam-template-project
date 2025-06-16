"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { skipTask } from "../actions/enhanced-task-actions"
import { toast } from "sonner"

interface SkipTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: any
  onSuccess: () => void
}

export function SkipTaskModal({ open, onOpenChange, task, onSuccess }: SkipTaskModalProps) {
  const [skipDuration, setSkipDuration] = useState("1hour")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const skipDurationOptions = [
    { value: "1hour", label: "1 Hour", icon: "⏰", description: "Skip for 1 hour" },
    { value: "4hours", label: "4 Hours", icon: "🕐", description: "Skip for 4 hours" },
    { value: "tomorrow", label: "Tomorrow", icon: "📅", description: "Skip until tomorrow" },
    { value: "3days", label: "3 Days", icon: "📆", description: "Skip for 3 days" },
    { value: "1week", label: "1 Week", icon: "🗓️", description: "Skip for 1 week" },
  ]

  const handleSkip = async () => {
    if (!task?.id) return

    setIsLoading(true)
    try {
      const result = await skipTask(task.id, skipDuration, reason)

      if (result.success) {
        toast.success(`Task skipped and rescheduled!`)
        setReason("")
        onSuccess()
        onOpenChange(false)
      } else {
        toast.error(result.error || "Failed to skip task")
      }
    } catch (error) {
      toast.error("Failed to skip task")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Skip Task - Reschedule</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Skipping "{task?.title}" - when should it be rescheduled?
            </p>

            <div className="space-y-2">
              {skipDurationOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 rounded-lg border cursor-pointer transition-colors ${
                    skipDuration === option.value ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={skipDuration === option.value}
                    onChange={(e) => setSkipDuration(e.target.value)}
                    className="sr-only"
                  />
                  <span className="text-lg mr-3">{option.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-muted-foreground">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="skip-reason">Reason (optional)</Label>
            <Textarea
              id="skip-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why are you skipping this task?"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSkip} disabled={isLoading}>
              {isLoading ? "Skipping..." : "Skip Task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
