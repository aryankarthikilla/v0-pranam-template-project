"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Settings, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface SessionRecoveryWidgetProps {
  onRecoveryComplete?: () => void
}

export function SessionRecoveryWidget({ onRecoveryComplete }: SessionRecoveryWidgetProps) {
  const [isChecking, setIsChecking] = useState(false)
  const [isFixing, setIsFixing] = useState(false)
  const [issues, setIssues] = useState<any[]>([])
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkForIssues = async () => {
    setIsChecking(true)
    try {
      console.log("🔍 Checking for session/task inconsistencies...")

      const response = await fetch("/api/tasks/debug-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to check for issues")
      }

      const data = await response.json()
      console.log("📊 Debug response:", data)

      setIssues(data.issues || [])
      setLastCheck(new Date())

      if (data.issues && data.issues.length > 0) {
        toast.warning(`Found ${data.issues.length} data consistency issues`)
      } else {
        toast.success("No data consistency issues found!")
      }
    } catch (error) {
      console.error("❌ Error checking for issues:", error)
      toast.error("Failed to check for issues")
    } finally {
      setIsChecking(false)
    }
  }

  const fixIssues = async () => {
    setIsFixing(true)
    try {
      console.log("🔧 Fixing session/task inconsistencies...")

      const response = await fetch("/api/tasks/fix-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to fix issues")
      }

      const data = await response.json()
      console.log("✅ Fix response:", data)

      toast.success(`Fixed ${data.fixed} issues successfully!`)

      // Clear issues and refresh
      setIssues([])
      if (onRecoveryComplete) {
        onRecoveryComplete()
      }
    } catch (error) {
      console.error("❌ Error fixing issues:", error)
      toast.error("Failed to fix issues")
    } finally {
      setIsFixing(false)
    }
  }

  const resetSpecificTask = async (taskId: string) => {
    try {
      console.log(`🔄 Resetting task ${taskId} to pending...`)

      const response = await fetch("/api/tasks/reset-task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId }),
      })

      if (!response.ok) {
        throw new Error("Failed to reset task")
      }

      toast.success("Task reset to pending status")

      // Remove this issue from the list
      setIssues(issues.filter((issue) => issue.task_id !== taskId))

      if (onRecoveryComplete) {
        onRecoveryComplete()
      }
    } catch (error) {
      console.error("❌ Error resetting task:", error)
      toast.error("Failed to reset task")
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-yellow-700 dark:text-yellow-300">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Session Recovery
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={checkForIssues}
            disabled={isChecking}
            className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-900/20"
          >
            {isChecking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-yellow-600 dark:text-yellow-400">
          Check for and fix data consistency issues between tasks and sessions.
        </div>

        {lastCheck && (
          <div className="text-xs text-muted-foreground">Last checked: {lastCheck.toLocaleTimeString()}</div>
        )}

        {issues.length > 0 && (
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <p className="font-medium">Found {issues.length} data consistency issues:</p>

                {issues.map((issue, index) => (
                  <div key={index} className="border rounded p-3 bg-white dark:bg-gray-900 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{issue.title || "Unknown Task"}</p>
                        <p className="text-xs text-muted-foreground">{issue.issue_type}</p>
                        {issue.task_id && <p className="text-xs text-muted-foreground">ID: {issue.task_id}</p>}
                      </div>
                      <Badge variant="destructive" className="text-xs">
                        Issue
                      </Badge>
                    </div>

                    {issue.task_id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => resetSpecificTask(issue.task_id)}
                        className="w-full"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Reset to Pending
                      </Button>
                    )}
                  </div>
                ))}

                <Button onClick={fixIssues} disabled={isFixing} className="w-full bg-orange-600 hover:bg-orange-700">
                  {isFixing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Fixing Issues...
                    </>
                  ) : (
                    <>
                      <Settings className="h-4 w-4 mr-2" />
                      Fix All Issues
                    </>
                  )}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {issues.length === 0 && lastCheck && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>All tasks and sessions are properly synchronized!</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button onClick={checkForIssues} disabled={isChecking} variant="outline" className="flex-1">
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Check for Issues
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
