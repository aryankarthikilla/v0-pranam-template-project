"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getTaskSettings, updateTaskSettings } from "../actions/task-settings-actions"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

interface TaskSettingsProps {
  onSettingsChange?: () => void
}

const FILTER_OPTIONS = [
  { value: "no", label: "Don't show completed tasks" },
  { value: "5 min", label: "Last 5 minutes" },
  { value: "10 min", label: "Last 10 minutes" },
  { value: "30 min", label: "Last 30 minutes" },
  { value: "1 hour", label: "Last 1 hour" },
  { value: "6 hours", label: "Last 6 hours" },
  { value: "Today", label: "Today" },
  { value: "1 week", label: "Last week" },
  { value: "1 month", label: "Last month" },
]

export function TaskSettings({ onSettingsChange }: TaskSettingsProps) {
  const [currentValue, setCurrentValue] = useState<string>("no")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const settings = await getTaskSettings()
      if (settings) {
        setCurrentValue(settings.show_completed_tasks || "no")
      }
    } catch (err) {
      console.error("Error fetching settings:", err)
      setError("Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  const handleValueChange = async (value: string) => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      await updateTaskSettings(value)
      setCurrentValue(value)
      setSuccess(true)

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)

      onSettingsChange?.()
    } catch (err) {
      console.error("Failed to update settings:", err)
      setError(err instanceof Error ? err.message : "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  const handleRetry = () => {
    setError(null)
    fetchSettings()
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Display Settings</CardTitle>
        <CardDescription>Configure how completed tasks are displayed in your task list</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Settings updated successfully!</AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <Label htmlFor="show-completed">Show completed tasks</Label>
          <Select value={currentValue} onValueChange={handleValueChange} disabled={saving}>
            <SelectTrigger>
              <SelectValue placeholder="Select when to show completed tasks" />
            </SelectTrigger>
            <SelectContent>
              {FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Choose when to display completed tasks in your task list</p>
        </div>

        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving settings...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
