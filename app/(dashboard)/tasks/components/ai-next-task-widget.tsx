"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Brain,
  Clock,
  RefreshCw,
  Sparkles,
  Play,
  Pause,
  CheckCircle,
  SkipForward,
  Calendar,
  Zap,
  AlertCircle,
  Plus,
} from "lucide-react"
import { prioritizeMyTasks } from "../actions/ai-task-actions-enhanced"
import {
  startTaskSession,
  pauseTaskSession,
  completeTask,
  skipTask,
  getActiveSessions,
} from "../actions/enhanced-task-actions"
import { toast } from "sonner"
import { SessionRecoveryWidget } from "./session-recovery-widget"

interface AINextTaskWidgetProps {
  tasks: any[]
  loading: boolean
  onTaskUpdate?: () => void
}

interface TaskRecommendation {
  task_id?: string
  reason: string
  task_details?: any
  [key: string]: any
}

export function AINextTaskWidget({ tasks, loading, onTaskUpdate }: AINextTaskWidgetProps) {
  const [recommendation, setRecommendation] = useState<TaskRecommendation | null>(null)
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
  const [activeTaskActions, setActiveTaskActions] = useState<{ [taskId: string]: boolean }>({})

  // New state for active task pause modal
  const [showActiveTaskPauseModal, setShowActiveTaskPauseModal] = useState(false)
  const [activeTaskPauseReason, setActiveTaskPauseReason] = useState("")
  const [selectedActiveTaskId, setSelectedActiveTaskId] = useState<string | null>(null)

  // Filter tasks by status
  const activeTasks = tasks.filter((task) => task.status === "in_progress" || task.status === "active")
  const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "todo")
  const totalTasks = tasks.length

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

  const getRecommendation = async () => {
    if (pendingTasks.length === 0) {
      setNoTasksReason("No pending tasks available")
      return
    }

    setIsLoading(true)
    setNoTasksReason(null)
    try {
      const result = await prioritizeMyTasks()

      if (result.success && result.prioritization?.recommended_next_task) {
        setRecommendation(result.prioritization.recommended_next_task)
        setLastUpdated(new Date())

        // Find the actual task details
        const taskId = result.prioritization.recommended_next_task.task_id
        const taskDetails = pendingTasks.find((t) => t.id === taskId)
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
        setRecommendation((prev: TaskRecommendation | null) => {
          if (!prev) return null
          return {
            ...prev,
            reason:
              "This task is now active and in progress. You can pause it if you need a break or complete it when finished.",
          }
        })

        setLastUpdated(new Date())

        // Refresh parent data
        if (onTaskUpdate) {
          onTaskUpdate()
        }
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
        setRecommendation((prev: TaskRecommendation | null) => {
          if (!prev) return null
          return {
            ...prev,
            reason:
              "This task was paused and is ready to be resumed. You can start it again or skip it to schedule for later.",
          }
        })

        setLastUpdated(new Date())

        // Refresh parent data
        if (onTaskUpdate) {
          onTaskUpdate()
        }
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

        // Refresh parent data
        if (onTaskUpdate) {
          onTaskUpdate()
        }

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

  // Modified to show modal instead of directly pausing
  const handlePauseActiveTask = async (taskId: string) => {
    console.log("🔄 handlePauseActiveTask called for taskId:", taskId)

    // Find the task details
    const task = activeTasks.find((t) => t.id === taskId)
    console.log("📋 Task details:", task)

    setSelectedActiveTaskId(taskId)
    setShowActiveTaskPauseModal(true)
    console.log("✅ Modal should be opening for task:", taskId)
  }

  // Enhanced function to handle the actual pause with better session finding
  const handleConfirmPauseActiveTask = async () => {
    console.log("🚀 handleConfirmPauseActiveTask called")
    console.log("📝 Selected task ID:", selectedActiveTaskId)
    console.log("💭 Pause reason:", activeTaskPauseReason)

    if (!selectedActiveTaskId) {
      console.error("❌ No selected task ID")
      toast.error("No task selected for pausing")
      setShowActiveTaskPauseModal(false)
      return
    }

    // Set loading state for this specific task
    setActiveTaskActions((prev) => ({ ...prev, [selectedActiveTaskId]: true }))
    console.log("⏳ Set loading state for task:", selectedActiveTaskId)

    try {
      // Find the task details
      const task = activeTasks.find((t) => t.id === selectedActiveTaskId)
      console.log("📋 Task found:", task)

      // Strategy 1: Use the current_session_id from the task if available
      const sessionIdToUse = task?.current_session_id

      if (sessionIdToUse) {
        console.log("🎯 Using current_session_id from task:", sessionIdToUse)

        const result = await pauseTaskSession(sessionIdToUse, activeTaskPauseReason || "Paused from active tasks")
        console.log("✅ Pause result using current_session_id:", result)

        if (result.success) {
          toast.success("Task paused successfully!")
          console.log("🎉 Task paused successfully using current_session_id")
        } else {
          console.error("❌ Failed to pause using current_session_id:", result.error)
          toast.error(result.error || "Failed to pause task")
        }
      } else {
        // Strategy 2: Try to find any active session for this task
        console.log("🔍 No current_session_id, getting active sessions...")
        const activeSessions = await getActiveSessions()
        console.log("📊 Active sessions found:", activeSessions)

        const taskSessions = activeSessions.filter((s) => s.task_id === selectedActiveTaskId)
        console.log("🎯 Sessions for this task:", taskSessions)

        if (taskSessions.length > 0) {
          // Use the most recent session
          const sessionToUse = taskSessions[0] // getActiveSessions should return most recent first

          if (sessionToUse) {
            console.log("⏸️ Attempting to pause session:", sessionToUse.id)

            const result = await pauseTaskSession(sessionToUse.id, activeTaskPauseReason || "Paused from active tasks")
            console.log("📊 Pause result:", result)

            if (result.success) {
              toast.success("Task paused successfully!")
              console.log("🎉 Task paused successfully!")
            } else {
              toast.error(result.error || "Failed to pause task")
              console.error("❌ Pause failed:", result.error)
            }
          } else {
            console.error("❌ Session found but is undefined")
            toast.error("Session data is invalid. The task may need to be reset.")
          }
        } else {
          console.error("❌ No active sessions found for task:", selectedActiveTaskId)
          toast.error("No active session found. The task may need to be reset.")
        }
      }

      // Refresh parent data regardless of success/failure
      if (onTaskUpdate) {
        console.log("🔄 Calling onTaskUpdate")
        onTaskUpdate()
      }
    } catch (error) {
      console.error("💥 Exception in handleConfirmPauseActiveTask:", error)
      toast.error("Failed to pause task")
    } finally {
      // Always clean up state
      console.log("🧹 Cleaning up state...")
      setActiveTaskActions((prev) => ({ ...prev, [selectedActiveTaskId]: false }))
      setShowActiveTaskPauseModal(false)
      setActiveTaskPauseReason("")
      setSelectedActiveTaskId(null)
      console.log("✅ State cleanup complete")
    }
  }

  // New function to handle cancel pause modal
  const handleCancelActiveTaskPause = () => {
    console.log("❌ handleCancelActiveTaskPause called")
    setShowActiveTaskPauseModal(false)
    setActiveTaskPauseReason("")
    setSelectedActiveTaskId(null)
    console.log("✅ Modal cancelled and state reset")
  }

  const handleCompleteActiveTask = async (taskId: string) => {
    console.log("✅ handleCompleteActiveTask called for taskId:", taskId)
    setActiveTaskActions((prev) => ({ ...prev, [taskId]: true }))

    try {
      const result = await completeTask(taskId, "Completed from active tasks", 100)
      console.log("📊 Complete result:", result)

      if (result.success) {
        toast.success("Task completed successfully!")
        console.log("🎉 Task completed successfully!")
        if (onTaskUpdate) {
          onTaskUpdate()
        }
      } else {
        toast.error(result.error || "Failed to complete task")
        console.error("❌ Complete failed:", result.error)
      }
    } catch (error) {
      console.error("💥 Exception in handleCompleteActiveTask:", error)
      toast.error("Failed to complete task")
    } finally {
      setActiveTaskActions((prev) => ({ ...prev, [taskId]: false }))
      console.log("✅ Complete action finished for task:", taskId)
    }
  }

  // Auto-load on mount if we have tasks and no active tasks
  useEffect(() => {
    if (!loading && pendingTasks.length > 0 && activeTasks.length === 0 && !recommendation) {
      getRecommendation()
    }
  }, [loading, pendingTasks.length, activeTasks.length])

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="border-purple-200 dark:border-purple-800">
          <CardHeader>
            <div className="animate-pulse">
              <div className="h-6 bg-muted rounded w-48"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse">
              <div className="h-20 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // SCENARIO 1: No tasks at all in the system
  if (totalTasks === 0) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Tasks Yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first task to get started with AI-powered task management!
          </p>
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Task
          </Button>
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

  // Get the selected task details for the pause modal
  const selectedActiveTask = selectedActiveTaskId ? activeTasks.find((task) => task.id === selectedActiveTaskId) : null

  return (
    <div className="space-y-4">
      {/* AI Recommendation Card - Show when there are pending tasks */}
      {pendingTasks.length > 0 && (
        <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-purple-700 dark:text-purple-300">
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Recommended Next Task
                {pendingTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingTasks.length} pending
                  </Badge>
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
                                    💡 <strong>Tip:</strong> After pausing, you can use the "Skip" button to schedule
                                    when you want to work on this task again!
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
                          Great job! All your tasks are scheduled for later. The AI will recommend them when it's time
                          to work on them.
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
                  {activeTasks.length > 0 ? "Need More Tasks? Get AI Recommendation" : "Get AI Task Recommendation"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Active Tasks Card - Show when there are active tasks */}
      {activeTasks.length > 0 && (
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
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                    onClick={() => handlePauseActiveTask(task.id)}
                    disabled={activeTaskActions[task.id] || isLoading}
                  >
                    <Pause className="h-4 w-4 mr-1" />
                    {activeTaskActions[task.id] ? "Pausing..." : "Pause"}
                  </Button>

                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleCompleteActiveTask(task.id)}
                    disabled={activeTaskActions[task.id] || isLoading}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {activeTaskActions[task.id] ? "Completing..." : "Complete"}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Session Recovery Widget - Show when there are data issues */}
      {activeTasks.length > 0 && <SessionRecoveryWidget onRecoveryComplete={onTaskUpdate} />}

      {/* Active Task Pause Modal */}
      <Dialog open={showActiveTaskPauseModal} onOpenChange={setShowActiveTaskPauseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pause Active Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedActiveTask && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm">{selectedActiveTask.title}</h4>
                {selectedActiveTask.description && (
                  <p className="text-xs text-muted-foreground mt-1">{selectedActiveTask.description}</p>
                )}
                <div className="text-xs text-muted-foreground mt-2">
                  <span>Task ID: {selectedActiveTask.id}</span>
                  {selectedActiveTask.current_session_id && (
                    <span className="ml-2">Session ID: {selectedActiveTask.current_session_id}</span>
                  )}
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="active-task-pause-reason">Reason for pausing (optional)</Label>
              <Textarea
                id="active-task-pause-reason"
                value={activeTaskPauseReason}
                onChange={(e) => setActiveTaskPauseReason(e.target.value)}
                placeholder="Why are you pausing this task? (e.g., Break, Meeting, Context Switch)"
                className="mt-1"
              />
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                💡 <strong>Tip:</strong> Adding a reason helps you remember why you paused and makes it easier to resume
                later!
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelActiveTaskPause}>
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPauseActiveTask}
                disabled={selectedActiveTaskId ? activeTaskActions[selectedActiveTaskId] : false}
              >
                {selectedActiveTaskId && activeTaskActions[selectedActiveTaskId] ? "Pausing..." : "Pause Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
