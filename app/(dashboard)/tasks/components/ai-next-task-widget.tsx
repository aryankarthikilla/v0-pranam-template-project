"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Brain, Clock, RefreshCw, Sparkles, Play, Pause, CheckCircle, SkipForward, Calendar } from "lucide-react"
import { prioritizeMyTasks } from "../actions/ai-task-actions-enhanced"
import {
  startTaskSession,
  pauseTaskSession,
  completeTask,
  skipTask,
  getActiveSessions,
} from "../actions/enhanced-task-actions"
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
  const [noTasksReason, setNoTasksReason] = useState<string | null>(null)

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
    setNoTasksReason(null)
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
          const status = taskDetails.status || "pending"
          setTaskState(status)

          // If task is in progress, try to find the active session
          if (status === "in_progress" || status === "active") {
            const sessionId = taskDetails.current_session_id
            if (sessionId) {
              setCurrentSessionId(sessionId)
            } else {
              // Fallback: check for active sessions for this task
              try {
                const activeSessions = await getActiveSessions()
                const taskSession = activeSessions.find((s) => s.task_id === taskId)
                if (taskSession) {
                  setCurrentSessionId(taskSession.id)
                } else {
                  // No active session found, reset task state
                  console.warn("Task marked as in_progress but no active session found")
                  setTaskState("pending")
                }
              } catch (error) {
                console.error("Failed to get active sessions:", error)
                setTaskState("pending")
              }
            }
          } else {
            setCurrentSessionId(null)
          }
        }
      } else {
        // No recommendations available - could be because all tasks are scheduled
        setRecommendation(null)
        setNoTasksReason(result.error || "No recommendations available")

        if (result.error && result.error.includes("scheduled for later")) {
          toast.info("All tasks are scheduled for later. Great job managing your time!")
        } else {
          toast.error("No recommendations available")
        }
      }
    } catch (error) {
      console.error("Failed to get AI recommendation:", error)
      toast.error("Failed to get AI recommendation")
      setNoTasksReason("Failed to get recommendations")
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

        // Immediately update local state - don't wait for re-analysis
        setTaskState("in_progress")
        setCurrentSessionId(result.session.id)

        // Update the recommendation reasoning to reflect the new state
        setRecommendation((prev) => ({
          ...prev,
          reason:
            "This task is now active and in progress. You can pause it if you need a break or complete it when finished.",
        }))

        setLastUpdated(new Date())
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
    console.log("handlePauseTask called", { currentSessionId, pauseReason, taskId: recommendation?.task_details?.id })

    // If no session ID, try to find it
    let sessionIdToUse = currentSessionId

    if (!sessionIdToUse && recommendation?.task_details?.id) {
      console.log("No session ID, trying to find active session for task")
      try {
        const activeSessions = await getActiveSessions()
        const taskSession = activeSessions.find((s) => s.task_id === recommendation.task_details.id)
        if (taskSession) {
          sessionIdToUse = taskSession.id
          setCurrentSessionId(taskSession.id)
          console.log("Found active session:", taskSession.id)
        }
      } catch (error) {
        console.error("Failed to find active session:", error)
      }
    }

    if (!sessionIdToUse) {
      console.error("No session ID available, cannot pause task")
      toast.error("No active session found. Task may not be properly started.")
      setShowPauseModal(false)
      // Reset task state since there's no active session
      setTaskState("pending")
      return
    }

    setIsLoading(true)
    try {
      console.log("Calling pauseTaskSession with:", sessionIdToUse, pauseReason)
      const result = await pauseTaskSession(sessionIdToUse, pauseReason)
      console.log("pauseTaskSession result:", result)

      if (result.success) {
        console.log("Pause successful, updating state")
        toast.success("Task paused successfully! Use Skip to reschedule when you want to work on it again.")

        // Immediately update local state
        setTaskState("pending")
        setCurrentSessionId(null)
        setPauseReason("")
        setShowPauseModal(false)

        // Update reasoning to reflect paused state
        setRecommendation((prev) => ({
          ...prev,
          reason:
            "This task was paused and is ready to be resumed. You can start it again or skip it to schedule for later.",
        }))

        setLastUpdated(new Date())
      } else {
        console.error("Pause failed:", result.error)
        toast.error(result.error || "Failed to pause task")
      }
    } catch (error) {
      console.error("Pause task error:", error)
      toast.error("Failed to pause task")
    } finally {
      console.log("Setting loading to false")
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
        setCurrentSessionId(null)
        setCompletionNotes("")
        setShowCompleteModal(false)

        // Get next recommendation after completing
        setTimeout(() => {
          getRecommendation()
        }, 1000)
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

        // Get next recommendation after skipping
        setTimeout(() => {
          getRecommendation()
        }, 1000)
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
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                              <p className="text-sm text-blue-700 dark:text-blue-300">
                                💡 <strong>Tip:</strong> After pausing, you can use the "Skip" button to schedule when
                                you want to work on this task again!
                              </p>
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
        ) : noTasksReason ? (
          <div className="text-center py-8">
            <div className="flex flex-col items-center gap-4">
              {noTasksReason.includes("scheduled for later") ? (
                <>
                  <Calendar className="h-12 w-12 text-green-500" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-green-700 dark:text-green-300">All Tasks Scheduled!</h3>
                    <p className="text-sm text-muted-foreground max-w-md">
                      Great job! All your tasks are scheduled for later. The AI will recommend them when it's time to
                      work on them.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Brain className="h-12 w-12 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-muted-foreground">No Recommendations</h3>
                    <p className="text-sm text-muted-foreground">{noTasksReason}</p>
                  </div>
                </>
              )}
              <Button onClick={getRecommendation} variant="outline" className="mt-2">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
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
