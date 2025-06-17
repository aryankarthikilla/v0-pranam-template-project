"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, CheckCircle, Database, Wrench, Info } from "lucide-react"
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

      // This would call a server action to run the debug queries
      const response = await fetch("/api/tasks/debug-sessions", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to check for issues")
      }

      const data = await response.json()
      console.log("📊 Issues found:", data)

      setIssues(data.issues || [])
      setLastCheck(new Date())

      if (data.issues && data.issues.length > 0) {
        toast.warning(`Found ${data.issues.length} data inconsistency issues`)
      } else {
        toast.success("No data inconsistencies found!")
      }
    } catch (error) {
      console.error("💥 Error checking for issues:", error)
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
      })

      if (!response.ok) {
        throw new Error("Failed to fix issues")
      }

      const data = await response.json()
      console.log("✅ Fix results:", data)

      toast.success(`Fixed ${data.fixed || 0} issues successfully!`)

      // Clear issues and refresh
      setIssues([])
      if (onRecoveryComplete) {
        onRecoveryComplete()
      }

      // Re-check after fixing
      setTimeout(() => {
        checkForIssues()
      }, 1000)
    } catch (error) {
      console.error("💥 Error fixing issues:", error)
      toast.error("Failed to fix issues")
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <Card className="border-yellow-200 bg-yellow-50/50 dark:border-yellow-800 dark:bg-yellow-950/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-yellow-700 dark:text-yellow-300">
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Session Recovery Tool
            {issues.length > 0 && (
              <Badge variant="destructive" className="text-xs">
                {issues.length} issues
              </Badge>
            )}
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
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This tool detects and fixes data inconsistencies between tasks and sessions. Run this if you see tasks
            marked as "active" but can't pause them.
          </AlertDescription>
        </Alert>

        {lastCheck && (
          <div className="text-sm text-muted-foreground">Last checked: {lastCheck.toLocaleTimeString()}</div>
        )}

        {issues.length > 0 && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {issues.length} data inconsistency issues that need to be fixed.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              {issues.map((issue, index) => (
                <div key={index} className="p-3 bg-white dark:bg-gray-900 rounded border text-sm">
                  <div className="font-medium text-red-600 dark:text-red-400">{issue.issue_type || issue.issue}</div>
                  {issue.task_id && (
                    <div className="text-muted-foreground mt-1">Task: {issue.title || issue.task_id}</div>
                  )}
                  {issue.count && <div className="text-muted-foreground mt-1">Affected items: {issue.count}</div>}
                </div>
              ))}
            </div>

            <Button onClick={fixIssues} disabled={isFixing} className="w-full bg-yellow-600 hover:bg-yellow-700">
              {isFixing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Fixing Issues...
                </>
              ) : (
                <>
                  <Wrench className="h-4 w-4 mr-2" />
                  Fix All Issues
                </>
              )}
            </Button>
          </div>
        )}

        {issues.length === 0 && lastCheck && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              No data inconsistencies found. All tasks and sessions are properly synchronized.
            </AlertDescription>
          </Alert>
        )}

        {!lastCheck && (
          <Button onClick={checkForIssues} disabled={isChecking} variant="outline" className="w-full">
            {isChecking ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Checking for Issues...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Check for Data Issues
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
