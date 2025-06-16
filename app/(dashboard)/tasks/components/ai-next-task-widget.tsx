"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Zap, Clock, Pause, CheckCircle, AlertCircle, Sparkles, RefreshCw } from "lucide-react"
import { pauseTaskSession, completeTask } from "../actions/enhanced-task-actions"
import { AITaskAssistant } from "./ai-task-assistant"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  estimated_minutes?: number
  current_session_id?: string
}

interface AINextTaskWidgetProps {
  tasks: Task[]
}

export function AINextTaskWidget({ tasks }: AINextTaskWidgetProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showAIAssistant, setShowAIAssistant] = useState(false)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [pauseReason, setPauseReason] = useState("")
  const [completionNotes, setCompletionNotes] = useState("")

  // Filter active tasks (in_progress status)
  const activeTasks = tasks.filter((task) => task.status === "in_progress" || task.status === "active")

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    }
  }

  const formatDuration = (startedAt: string) => {
    const start = new Date(startedAt)
    const now = new Date()
    const diffMs = now.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 60) {
      return `${diffMins}m`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return `${hours}h ${mins}m`
    }
  }

  const handlePauseTask = async () => {
    if (!selectedTask?.current_session_id) {
      toast.error("No active session found")
      return
    }

    setIsLoading(true)
    try {
      const result = await pauseTaskSession(selectedTask.current_session_id, pauseReason)
      if (result.success) {
        toast.success("Task paused successfully")
        setShowPauseModal(false)
        setPauseReason("")
        setSelectedTask(null)
        // Refresh the page to update the task list
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to pause task")
      }
    } catch (error) {
      console.error("Error pausing task:", error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCompleteTask = async () => {
    if (!selectedTask?.id) return

    setIsLoading(true)
    try {
      const result = await completeTask(selectedTask.id, completionNotes, 100)
      if (result.success) {
        toast.success("Task completed successfully!")
        setShowCompleteModal(false)
        setCompletionNotes("")
        setSelectedTask(null)
        // Refresh the page to update the task list
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to complete task")
      }
    } catch (error) {
      console.error("Error completing task:", error)
      toast.error("Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  // Show active tasks if they exist
  if (activeTasks.length > 0) {
    return (
      <>
        <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-orange-700 dark:text-orange-300">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Active Tasks in Progress ({activeTasks.length})
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/20"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-orange-600 dark:text-orange-400 mb-4">
              You have {activeTasks.length} active task{activeTasks.length > 1 ? "s" : ""}. Focus on completing them
              first.
            </div>

            {activeTasks.map((task) => (
              <div key={task.id} className="border rounded-lg p-4 bg-white dark:bg-gray-900 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{task.title}</h4>
                    {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                  </div>
                  <Badge className={getPriorityColor(task.priority)}>{task.priority || "normal"}</Badge>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Active for {formatDuration(task.updated_at)}</span>
                  </div>
                  {task.estimated_minutes && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      <span>Est. {task.estimated_minutes}min</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Dialog
                    open={showPauseModal && selectedTask?.id === task.id}
                    onOpenChange={(open) => {
                      setShowPauseModal(open)
                      if (open) setSelectedTask(task)
                      else setSelectedTask(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                      >
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pause Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="pause-reason">Reason for pausing (optional)</Label>
                          <Textarea
                            id="pause-reason"
                            value={pauseReason}
                            onChange={(e) => setPauseReason(e.target.value)}
                            placeholder="Why are you pausing this task?"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowPauseModal(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handlePauseTask} disabled={isLoading}>
                            Pause Task
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog
                    open={showCompleteModal && selectedTask?.id === task.id}
                    onOpenChange={(open) => {
                      setShowCompleteModal(open)
                      if (open) setSelectedTask(task)
                      else setSelectedTask(null)
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Complete Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="completion-notes">Completion Notes (optional)</Label>
                          <Textarea
                            id="completion-notes"
                            value={completionNotes}
                            onChange={(e) => setCompletionNotes(e.target.value)}
                            placeholder="Any notes about completing this task?"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCompleteModal(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleCompleteTask} disabled={isLoading}>
                            Complete Task
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAIAssistant(true)}
                className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-300 dark:hover:bg-purple-950/20"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Need More Tasks? Ask AI Assistant
              </Button>
            </div>
          </CardContent>
        </Card>

        <AITaskAssistant open={showAIAssistant} onOpenChange={setShowAIAssistant} />
      </>
    )
  }

  // Show AI assistant when no active tasks
  return (
    <>
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 dark:border-purple-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
            <Sparkles className="h-5 w-5" />
            AI Task Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            No active tasks found. Let AI help you get started with smart task suggestions and prioritization.
          </p>

          <Button
            onClick={() => setShowAIAssistant(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Get AI Task Recommendations
          </Button>
        </CardContent>
      </Card>

      <AITaskAssistant open={showAIAssistant} onOpenChange={setShowAIAssistant} />
    </>
  )
}
