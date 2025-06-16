"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Brain, Clock, RefreshCw, Sparkles, Play, Pause, CheckCircle, SkipForward } from "lucide-react"
import { prioritizeMyTasks } from "../actions/ai-task-actions-enhanced"
import { startTaskSession, pauseTaskSession, completeTask, skipTask } from "../actions/enhanced-task-actions"
import { toast } from "sonner"

interface AINextTaskWidgetProps {
  tasks: any[]
}

export function AINextTaskWidget({ tasks }: AINextTaskWidgetProps) {
  const [recommendation, setRecommendation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [taskState, setTaskState] = useState<"pending" | "in_progress" | "completed">("pending")
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [pauseReason, setPauseReason] = useState("")
  const [completionNotes, setCompletionNotes] = useState("")
  const [skipDuration, setSkipDuration] = useState("1hour")
  const [skipReason, setSkipReason] = useState("")
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
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

  const getRecommendation = async () => {
    if (tasks.length === 0) return

    setIsLoading(true)
    try {
      const result = await prioritizeMyTasks()

      if (result.success && result.prioritization?.recommended_next_task) {
        setRecommendation(result.prioritization.recommended_next_task)
        setLastUpdated(new Date())

        // Find the actual task details
        const taskId = result.prioritization.recommended_next_task.task_id
        const taskDetails = tasks.find((t) => t.id === taskId)
        if (taskDetails) {
          setRecommendation({
            ...result.prioritization.recommended_next_task,
            task_details: taskDetails,
          })

          // Set task state based on current status
          setTaskState(taskDetails.status || "pending")
          setCurrentSessionId(taskDetails.current_session_id || null)
        }
      } else {
        toast.error("No recommendations available")
      }
    } catch (error) {
      console.error("Failed to get AI recommendation:", error)
      toast.error("Failed to get AI recommendation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTask = async () => {
    if (!recommendation?.task_details?.id) return

    setIsLoading(true)
    try {
      const result = await startTaskSession(recommendation.task_details.id, undefined, "web")
      if (result.success) {
        toast.success("Task started successfully!")
        setTaskState("in_progress")
        setCurrentSessionId(result.session.id)
      } else {
        toast.error(result.error || "Failed to start task")
      }
    } catch (error) {
      toast.error("Failed to start task")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePauseTask = async () => {
    if (!currentSessionId) return

    setIsLoading(true)
    try {
      const result = await pauseTaskSession(currentSessionId, pauseReason)
      if (result.success) {
        toast.success("Task paused successfully!")
        setTaskState("pending")
        setCurrentSessionId(null)
        setPauseReason("")
        setShowPauseModal(false) // Ensure modal closes
        getRecommendation() // Refresh to get next recommendation
      } else {
        toast.error(result.error || "Failed to pause task")
      }
    } catch (error) {
      console.error("Pause task error:", error)
      toast.error("Failed to pause task")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelPause = () => {
    setPauseReason("")
    setShowPauseModal(false)
  }

  const handleCompleteTask = async () => {
    if (!recommendation?.task_details?.id) return

    setIsLoading(true)
    try {
      const result = await completeTask(recommendation.task_details.id, completionNotes, 100)
      if (result.success) {
        toast.success("Task completed successfully!")
        setTaskState("completed")
        setCompletionNotes("")
        setShowCompleteModal(false)
        getRecommendation() // Refresh to get next recommendation
      } else {
        toast.error(result.error || "Failed to complete task")
      }
    } catch (error) {
      toast.error("Failed to complete task")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipTask = async () => {
    if (!recommendation?.task_details?.id) return

    setIsLoading(true)
    try {
      const result = await skipTask(recommendation.task_details.id, skipDuration, skipReason)
      if (result.success) {
        toast.success(`Task skipped and rescheduled!`)
        setSkipReason("")
        setShowSkipModal(false)
        getRecommendation() // Refresh to get next recommendation
      } else {
        toast.error(result.error || "Failed to skip task")
      }
    } catch (error) {
      toast.error("Failed to skip task")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load on mount if we have tasks
  useEffect(() => {
    if (tasks.length > 0 && !recommendation) {
      getRecommendation()
    }
  }, [tasks.length])

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Brain className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            Create some tasks first, then I'll suggest which one to work on next!
          </p>
        </CardContent>
      </Card>
    )
  }

  const skipDurationOptions = [
    { value: "1hour", label: "1 Hour", icon: "⏰" },
    { value: "4hours", label: "4 Hours", icon: "🕐" },
    { value: "tomorrow", label: "Tomorrow", icon: "📅" },
    { value: "3days", label: "3 Days", icon: "📆" },
    { value: "1week", label: "1 Week", icon: "🗓️" },
  ]

  return (
    <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-purple-700 dark:text-purple-300">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Recommended Next Task
            {taskState === "in_progress" && (
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Active</Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={getRecommendation}
            disabled={isLoading}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/20"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-2 text-purple-600">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span>AI is analyzing your tasks...</span>
            </div>
          </div>
        ) : recommendation ? (
          <div className="space-y-4">
            {/* Recommended Task */}
            <div className="p-4 bg-white/60 dark:bg-gray-900/60 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">
                  {recommendation.task_details?.title || "Task"}
                </h4>
                {recommendation.task_details?.priority && (
                  <Badge className={getPriorityColor(recommendation.task_details.priority)}>
                    {recommendation.task_details.priority}
                  </Badge>
                )}
              </div>

              {recommendation.task_details?.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {recommendation.task_details.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 mb-3">
                <Brain className="h-3 w-3" />
                <span className="font-medium">AI Reasoning:</span>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-950/30 p-3 rounded border-l-4 border-purple-400">
                {recommendation.reason}
              </p>

              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
                </div>

                <div className="flex gap-2">
                  {/* Task State: PENDING - Show Start, Skip, Complete */}
                  {taskState === "pending" && (
                    <>
                      <Button
                        size="sm"
                        onClick={handleStartTask}
                        disabled={isLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>

                      <Dialog open={showSkipModal} onOpenChange={setShowSkipModal}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-orange-300 text-orange-700 hover:bg-orange-50"
                          >
                            <SkipForward className="h-3 w-3 mr-1" />
                            Skip
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Skip Task - Reschedule</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>When should this task be rescheduled?</Label>
                              <div className="grid grid-cols-2 gap-2 mt-2">
                                {skipDurationOptions.map((option) => (
                                  <Button
                                    key={option.value}
                                    variant={skipDuration === option.value ? "default" : "outline"}
                                    onClick={() => setSkipDuration(option.value)}
                                    className="justify-start"
                                  >
                                    <span className="mr-2">{option.icon}</span>
                                    {option.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="skip-reason">Reason (optional)</Label>
                              <Textarea
                                id="skip-reason"
                                value={skipReason}
                                onChange={(e) => setSkipReason(e.target.value)}
                                placeholder="Why are you skipping this task?"
                                className="mt-1"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" onClick={() => setShowSkipModal(false)}>
                                Cancel
                              </Button>
                              <Button onClick={handleSkipTask} disabled={isLoading}>
                                Skip Task
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
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
                    </>
                  )}

                  {/* Task State: IN_PROGRESS - Show Pause, Complete (NO Skip) */}
                  {taskState === "in_progress" && (
                    <>
                      <Dialog open={showPauseModal} onOpenChange={setShowPauseModal}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          >
                            <Pause className="h-3 w-3 mr-1" />
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
                              <Button variant="outline" onClick={handleCancelPause}>
                                Cancel
                              </Button>
                              <Button onClick={handlePauseTask} disabled={isLoading}>
                                Pause Task
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Dialog open={showCompleteModal} onOpenChange={setShowCompleteModal}>
                        <DialogTrigger asChild>
                          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                            <CheckCircle className="h-3 w-3 mr-1" />
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
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Button
              onClick={getRecommendation}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Get AI Recommendation
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
