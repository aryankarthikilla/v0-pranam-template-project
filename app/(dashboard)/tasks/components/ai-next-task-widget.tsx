"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, RefreshCw, Sparkles } from "lucide-react"
import { prioritizeMyTasks } from "../actions/ai-task-actions-enhanced"
import {
  startTaskSession,
  pauseTaskSession,
  completeTask,
  skipTask,
  getActiveSessions,
} from "../actions/enhanced-task-actions"
import { toast } from "sonner"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  created_at: string
}

interface AINextTaskWidgetProps {
  tasks: Task[]
}

export function AINextTaskWidget({ tasks }: AINextTaskWidgetProps) {
  const [recommendation, setRecommendation] = useState<Task | null>(null)
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
    if (!recommendation?.id) return

    setIsLoading(true)
    try {
      const result = await startTaskSession(recommendation.id, undefined, "web")
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
    console.log("handlePauseTask called", { currentSessionId, pauseReason, taskId: recommendation?.id })

    // If no session ID, try to find it
    let sessionIdToUse = currentSessionId

    if (!sessionIdToUse && recommendation?.id) {
      console.log("No session ID, trying to find active session for task")
      try {
        const activeSessions = await getActiveSessions()
        const taskSession = activeSessions.find((s) => s.task_id === recommendation.id)
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
    if (!recommendation?.id) return

    setIsLoading(true)
    try {
      const result = await completeTask(recommendation.id, completionNotes, 100)
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
    if (!recommendation?.id) return

    setIsLoading(true)
    try {
      const result = await skipTask(recommendation.id, skipDuration, skipReason)
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

  const pendingTasks = tasks.filter((task) => task.status === "pending")
  const recommendedTask = pendingTasks[0] // Simple recommendation logic

  if (!recommendedTask) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <Brain className="h-5 w-5 text-purple-600" />
            AI Task Recommendation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No pending tasks to recommend.</p>
        </CardContent>
      </Card>
    )
  }

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

      <CardContent className="space-y-4">
        <div>
          <h3 className="font-medium text-foreground">{recommendedTask.title}</h3>
          {recommendedTask.description && (
            <p className="text-sm text-muted-foreground mt-1">{recommendedTask.description}</p>
          )}
        </div>
        <Button className="w-full" onClick={handleStartTask}>
          <Sparkles className="h-4 w-4 mr-2" />
          Start This Task
        </Button>
      </CardContent>
    </Card>
  )
}
