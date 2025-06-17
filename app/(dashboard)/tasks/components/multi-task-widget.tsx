"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Timer, Pause, Square, AlertTriangle, Clock, Play } from 'lucide-react'
import { getActiveSessions, getStaleSessionsCheck, resolveStaleSession } from "../actions/enhanced-task-actions"
import type { TaskSession, StaleSession } from "../actions/enhanced-task-actions"
import { toast } from "sonner"

export function MultiTaskWidget() {
  const [activeSessions, setActiveSessions] = useState<TaskSession[]>([])
  const [staleSessions, setStaleSessions] = useState<StaleSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showStaleModal, setShowStaleModal] = useState(false)
  const [selectedStaleSession, setSelectedStaleSession] = useState<StaleSession | null>(null)
  const [staleResolution, setStaleResolution] = useState<"continue" | "pause" | "complete">("continue")
  const [staleReason, setStaleReason] = useState("")
  const [isRunning, setIsRunning] = useState(false)
  const [activeSession, setActiveSession] = useState<string | null>(null)

  const loadSessions = async () => {
    setIsLoading(true)
    try {
      const [active, stale] = await Promise.all([getActiveSessions(), getStaleSessionsCheck()])

      setActiveSessions(active)
      setStaleSessions(stale)

      // Show stale session modal if we have stale sessions
      if (stale.length > 0 && !showStaleModal) {
        setSelectedStaleSession(stale[0] || null)
        setShowStaleModal(true)
      }
    } catch (error) {
      console.error("Failed to load sessions:", error)
      toast.error("Failed to load active sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleStaleResolution = async () => {
    if (!selectedStaleSession) return

    try {
      const result = await resolveStaleSession(selectedStaleSession.session_id, staleResolution, staleReason)

      if (result.success) {
        toast.success(`Session ${staleResolution}d successfully`)
        setShowStaleModal(false)
        setSelectedStaleSession(null)
        setStaleReason("")
        loadSessions() // Reload sessions
      } else {
        toast.error(result.error || "Failed to resolve session")
      }
    } catch (error) {
      toast.error("Failed to resolve session")
    }
  }

  const handleStart = () => {
    setIsRunning(true)
    setActiveSession("Focus Session")
  }

  const handlePause = () => {
    setIsRunning(false)
  }

  const handleStop = () => {
    setIsRunning(false)
    setActiveSession(null)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

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

  useEffect(() => {
    loadSessions()
    // Refresh every 30 seconds
    const interval = setInterval(loadSessions, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20">
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
              className="text-blue-600 hover:bg-blue-100"
            >
              <Clock className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {activeSessions.map((session, index) => (
            <div
              key={session.id || `session-${index}`}
              className="p-3 bg-white/60 dark:bg-gray-900/60 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{session.task_title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={getPriorityColor(session.task_priority)}>{session.task_priority}</Badge>
                    {session.location_context && (
                      <span className="text-xs text-muted-foreground">📍 {session.location_context}</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    {formatDuration(session.duration_minutes)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Started {new Date(session.started_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 dark:text-green-400">Active</span>
                </div>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                    <Pause className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="outline" className="h-6 px-2 text-xs">
                    <Square className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {staleSessions.length > 0 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
              <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{staleSessions.length} inactive sessions detected</span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Tasks inactive for more than 30 minutes need attention
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {activeSession ? (
        <Card className="border-border bg-card mt-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">Multi-Task Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Active Session</p>
              <p className="font-medium text-foreground">{activeSession}</p>
              <div className="flex gap-2 mt-4">
                <Button
                  variant={isRunning ? "secondary" : "default"}
                  onClick={isRunning ? handlePause : handleStart}
                  className="flex-1"
                >
                  {isRunning ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  {isRunning ? "Pause" : "Resume"}
                </Button>
                <Button variant="outline" onClick={handleStop}>
                  <Square className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center mt-4">
          <p className="text-muted-foreground mb-4">No active session</p>
          <Button onClick={handleStart} className="w-full">
            <Play className="h-4 w-4 mr-2" />
            Start Focus Session
          </Button>
        </div>
      )}

      {/* Stale Session Resolution Modal */}
      <Dialog open={showStaleModal} onOpenChange={setShowStaleModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inactive Task Detected</DialogTitle>
          </DialogHeader>
          {selectedStaleSession && (
            <div className="space-y-4">
              <div className="p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <h4 className="font-medium">{selectedStaleSession.task_title}</h4>
                <p className="text-sm text-muted-foreground">
                  Started {new Date(selectedStaleSession.started_at).toLocaleTimeString()} •{" "}
                  {selectedStaleSession.minutes_inactive} minutes ago
                </p>
              </div>

              <div>
                <p className="text-sm mb-3">What happened with this task?</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="continue"
                      checked={staleResolution === "continue"}
                      onChange={(e) => setStaleResolution(e.target.value as any)}
                    />
                    <span className="text-sm">Continue working on it</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="pause"
                      checked={staleResolution === "pause"}
                      onChange={(e) => setStaleResolution(e.target.value as any)}
                    />
                    <span className="text-sm">Pause for now</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="complete"
                      checked={staleResolution === "complete"}
                      onChange={(e) => setStaleResolution(e.target.value as any)}
                    />
                    <span className="text-sm">Mark as completed</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  value={staleReason}
                  onChange={(e) => setStaleReason(e.target.value)}
                  placeholder="Any additional context..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowStaleModal(false)}>
                  Skip
                </Button>
                <Button onClick={handleStaleResolution}>Update Task</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
