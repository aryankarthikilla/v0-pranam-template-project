"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Zap,
  Clock,
  Pause,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Brain,
  Play,
  SkipForward,
  Sparkles,
  Plus,
} from "lucide-react"
import { pauseTaskSession, completeTask, startTaskSession, skipTask } from "../actions/enhanced-task-actions"
import { prioritizeMyTasks } from "../actions/ai-task-actions-enhanced"
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
  const [aiRecommendation, setAiRecommendation] = useState<any>(null)
  const [showPauseModal, setShowPauseModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showSkipModal, setShowSkipModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [pauseReason, setPauseReason] = useState("")
  const [completionNotes, setCompletionNotes] = useState("")
  const [skipDuration, setSkipDuration] = useState("1hour")
  const [skipReason, setSkipReason] = useState("")
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Filter tasks by status
  const activeTasks = tasks.filter((task) => task.status === "in_progress" || task.status === "active")
  const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "todo")
  const completedTasks = tasks.filter((task) => task.status === "completed")
  const totalTasks = tasks.length

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

  const getAIRecommendation = async () => {
    if (pendingTasks.length === 0) {
      toast.info("No pending tasks available for AI recommendation")
      return
    }

    setIsLoading(true)
    try {
      const result = await prioritizeMyTasks()

      if (result.success && result.prioritization?.recommended_next_task) {
        const taskId = result.prioritization.recommended_next_task.task_id
        const taskDetails = pendingTasks.find((t) => t.id === taskId)

        if (taskDetails) {
          setAiRecommendation({
            ...result.prioritization.recommended_next_task,
            task_details: taskDetails,
          })
          setLastUpdated(new Date())
        } else {
          // Fallback to first pending task
          const firstPendingTask = pendingTasks[0]
          if (firstPendingTask) {
            setAiRecommendation({
              task_id: firstPendingTask.id,
              reason: "This is your next pending task. Consider starting it when you're ready.",
              task_details: firstPendingTask,
            })
            setLastUpdated(new Date())
          }
        }
      } else {
        toast.error("No AI recommendations available")
      }
    } catch (error) {
      console.error("Failed to get AI recommendation:", error)
      toast.error("Failed to get AI recommendation")
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-load AI recommendation on mount if there are pending tasks and no active tasks
  useEffect(() => {
    if (pendingTasks.length > 0 && activeTasks.length === 0 && !aiRecommendation) {
      getAIRecommendation()
    }
  }, [pendingTasks.length, activeTasks.length])

  const handleStartRecommendedTask = async () => {
    if (!aiRecommendation?.task_details?.id) return

    setIsLoading(true)
    try {
      const result = await startTaskSession(aiRecommendation.task_details.id, undefined, "web")
      if (result.success) {
        toast.success("Task started successfully!")
        setAiRecommendation(null)
        window.location.reload()
      } else {
        toast.error(result.error || "Failed to start task")
      }
    } catch (error) {
      toast.error("Failed to start task")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkipRecommendedTask = async () => {
    if (!aiRecommendation?.task_details?.id) return

    setIsLoading(true)
    try {
      const result = await skipTask(aiRecommendation.task_details.id, skipDuration, skipReason)
      if (result.success) {
        toast.success(`Task skipped and rescheduled!`)
        setSkipReason("")
        setShowSkipModal(false)
        setTimeout(() => {
          getAIRecommendation()
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

  const skipDurationOptions = [
    { value: "1hour", label: "1 Hour", icon: "⏰" },
    { value: "4hours", label: "4 Hours", icon: "🕐" },
    { value: "tomorrow", label: "Tomorrow", icon: "📅" },
    { value: "3days", label: "3 Days", icon: "📆" },
    { value: "1week", label: "1 Week", icon: "🗓️" },
  ]

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

  // SCENARIO 2: All tasks are completed
  if (completedTasks.length === totalTasks) {
    return (
      <Card className="border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
          <h3 className="font-semibold text-lg mb-2 text-green-700 dark:text-green-300">All Tasks Completed!</h3>
          <p className="text-green-600 dark:text-green-400 text-center mb-4">
            Great job! You've completed all {totalTasks} tasks. Time to create new ones or take a break!
          </p>
          <Button
            variant="outline"
            className="border-green-300 text-green-700 hover:bg-green-50 dark:border-green-700 dark:text-green-300"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Tasks
          </Button>
        </CardContent>
      </Card>
    )
  }

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
                {activeTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {pendingTasks.length} pending
                  </Badge>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={getAIRecommendation}
                disabled={isLoading}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-100 dark:hover:bg-purple-900/20"
              >
                {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent>
            {aiRecommendation ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/60 dark:bg-gray-900/60 rounded-lg border border-purple-200 dark:border-purple-800">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex-1">
                      {aiRecommendation.task_details?.title || "Task"}
                    </h4>
                    {aiRecommendation.task_details?.priority && (
                      <Badge className={getPriorityColor(aiRecommendation.task_details.priority)}>
                        {aiRecommendation.task_details.priority}
                      </Badge>
                    )}
                  </div>

                  {aiRecommendation.task_details?.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {aiRecommendation.task_details.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 mb-3">
                    <Brain className="h-3 w-3" />
                    <span className="font-medium">AI Reasoning:</span>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-purple-50 dark:bg-purple-950/30 p-3 rounded border-l-4 border-purple-400">
                    {aiRecommendation.reason}
                  </p>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {lastUpdated && <span>Updated {lastUpdated.toLocaleTimeString()}</span>}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleStartRecommendedTask}
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
                              <Button onClick={handleSkipRecommendedTask} disabled={isLoading}>
                                Skip Task
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <Button
                  onClick={getAIRecommendation}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
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
          </CardContent>
        </Card>
      )}
    </div>
  )
}
