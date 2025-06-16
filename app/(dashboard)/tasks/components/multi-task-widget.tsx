"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pause, Clock, MapPin, AlertTriangle, Plus, Timer, CheckCircle } from "lucide-react"
import {
  getActiveSessions,
  getStaleSessionsCheck,
  pauseTaskSession,
  completeTask,
  resolveStaleSession,
  type TaskSession,
  type StaleSession,
} from "../actions/enhanced-task-actions"
import { toast } from "sonner"

export function MultiTaskWidget() {
  const [activeSessions, setActiveSessions] = useState<TaskSession[]>([])
  const [staleSessions, setStaleSessions] = useState<StaleSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [pauseReason, setPauseReason] = useState("")
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [showStaleModal, setShowStaleModal] = useState(false)
  const [staleAction, setStaleAction] = useState<"continue" | "pause" | "complete">("continue")
  const [staleReason, setStaleReason] = useState("")

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const [active, stale] = await Promise.all([getActiveSessions(), getStaleSessionsCheck()])

      setActiveSessions(active)
      setStaleSessions(stale)

      // Show stale session modal if there are stale sessions
      if (stale.length > 0 && !showStaleModal) {
        setShowStaleModal(true)
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
      toast.error("Failed to load active tasks")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSessions()

    // Refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
    }
  }

  const handlePauseTask = async (sessionId: string) => {
    try {
      const result = await pauseTaskSession(sessionId, pauseReason)
      if (result.success) {
        toast.success("Task paused successfully")
        setPauseReason("")
        setSelectedSessionId("")
        loadSessions()
      } else {
        toast.error(result.error || "Failed to pause task")
      }
    } catch (error) {
      toast.error("Failed to pause task")
    }
  }

  const handleCompleteTask = async (taskId: string) => {
    try {
      const result = await completeTask(taskId, "Completed from multi-task widget")
      if (result.success) {
        toast.success("Task completed successfully")
        loadSessions()
      } else {
        toast.error(result.error || "Failed to complete task")
      }
    } catch (error) {
      toast.error("Failed to complete task")
    }
  }

  const handleStaleSessionResolve = async (sessionId: string) => {
    try {
      const result = await resolveStaleSession(sessionId, staleAction, staleReason)
      if (result.success) {
        toast.success("Session resolved successfully")
        setStaleReason("")
        setShowStaleModal(false)
        loadSessions()
      } else {
        toast.error(result.error || "Failed to resolve session")
      }
    } catch (error) {
      toast.error("Failed to resolve session")
    }
  }

  if (activeSessions.length === 0 && staleSessions.length === 0) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-6">
          <Timer className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground text-center text-sm">No active tasks. Start a task to see it here!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-blue-700 dark:text-blue-300">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Active Tasks ({activeSessions.length})
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSessions}
              disabled={isLoading}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/20"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {activeSessions.map((session) => (
            <div
              key={session.id}
              className="p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{session.task_title}</h4>
                    {session.is_opportunistic && (
                      <Badge variant="outline" className="text-xs">
                        <Plus className="h-3 w-3 mr-1" />
                        Opportunistic
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDuration(session.duration_minutes)}
                    </div>
                    {session.location_context && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location_context}
                      </div>
                    )}
                  </div>
                </div>

                <Badge className={getPriorityColor(session.task_priority)}>{session.task_priority}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Started {new Date(session.started_at).toLocaleTimeString()}
                </div>

                <div className="flex items-center gap-1">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" onClick={() => setSelectedSessionId(session.id)}>
                        <Pause className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Pause Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">Why are you pausing "{session.task_title}"?</p>
                        <Textarea
                          placeholder="e.g., Taking a break, switching context, need more info..."
                          value={pauseReason}
                          onChange={(e) => setPauseReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setPauseReason("")}>
                            Cancel
                          </Button>
                          <Button onClick={() => handlePauseTask(session.id)}>Pause Task</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCompleteTask(session.task_id)}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Stale Sessions Modal */}
      <Dialog open={showStaleModal} onOpenChange={setShowStaleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Inactive Tasks Detected
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have tasks that have been inactive for more than 30 minutes. What would you like to do?
            </p>

            {staleSessions.map((session) => (
              <div key={session.session_id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{session.task_title}</h4>
                  <Badge variant="outline">{session.minutes_inactive} min inactive</Badge>
                </div>

                <div className="space-y-3">
                  <Select value={staleAction} onValueChange={(value: any) => setStaleAction(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="continue">Continue working</SelectItem>
                      <SelectItem value="pause">Pause task</SelectItem>
                      <SelectItem value="complete">Mark as complete</SelectItem>
                    </SelectContent>
                  </Select>

                  <Textarea
                    placeholder="Add a note about what happened..."
                    value={staleReason}
                    onChange={(e) => setStaleReason(e.target.value)}
                  />

                  <Button onClick={() => handleStaleSessionResolve(session.session_id)} className="w-full">
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
