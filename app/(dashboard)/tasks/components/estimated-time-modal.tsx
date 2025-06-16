"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Clock, Edit } from "lucide-react"
import { updateTaskEstimatedTime } from "../actions/enhanced-task-actions"
import { toast } from "sonner"

interface EstimatedTimeModalProps {
  taskId: string
  currentEstimate: number
  onUpdate?: () => void
  trigger?: React.ReactNode
}

export function EstimatedTimeModal({ taskId, currentEstimate, onUpdate, trigger }: EstimatedTimeModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [estimatedMinutes, setEstimatedMinutes] = useState(currentEstimate)
  const [isLoading, setIsLoading] = useState(false)

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const result = await updateTaskEstimatedTime(taskId, estimatedMinutes)
      if (result.success) {
        toast.success("Estimated time updated")
        setIsOpen(false)
        onUpdate?.()
      } else {
        toast.error(result.error || "Failed to update estimated time")
      }
    } catch (error) {
      toast.error("Failed to update estimated time")
    } finally {
      setIsLoading(false)
    }
  }

  const quickTimes = [5, 10, 15, 30, 45, 60, 90, 120, 180, 240]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="h-auto p-1 text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {formatTime(currentEstimate)}
            <Edit className="h-3 w-3 ml-1" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Estimated Time
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="estimated-minutes">Minutes</Label>
            <Input
              id="estimated-minutes"
              type="number"
              min="1"
              max="1440"
              value={estimatedMinutes}
              onChange={(e) => setEstimatedMinutes(Number.parseInt(e.target.value) || 1)}
              placeholder="Enter minutes"
            />
            <p className="text-xs text-muted-foreground">Current estimate: {formatTime(estimatedMinutes)}</p>
          </div>

          <div className="space-y-2">
            <Label>Quick Select</Label>
            <div className="grid grid-cols-5 gap-2">
              {quickTimes.map((minutes) => (
                <Button
                  key={minutes}
                  variant={estimatedMinutes === minutes ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEstimatedMinutes(minutes)}
                  className="text-xs"
                >
                  {formatTime(minutes)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
