"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTaskSettings, updateTaskSettings } from "../actions/task-settings-actions"
import { Loader2 } from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"

interface TaskSettingsProps {
  onSettingsChange?: () => void
}

export function TaskSettings({ onSettingsChange }: TaskSettingsProps) {
  const { t } = useTranslations("tasks")
  const [settings, setSettings] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filterOptions = [
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

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getTaskSettings()
      setSettings(result)
    } catch (err) {
      console.error("Error fetching task settings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch settings")
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsChange = async (value: string) => {
    try {
      setSaving(true)
      setError(null)
      const result = await updateTaskSettings(value)
      setSettings(result)
      onSettingsChange?.()
    } catch (err) {
      console.error("Failed to update settings:", err)
      setError(err instanceof Error ? err.message : "Failed to update settings")
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-destructive">Error: {error}</p>
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
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="show-completed">Show completed tasks</Label>
          <Select value={settings?.show_completed_tasks || "no"} onValueChange={handleSettingsChange} disabled={saving}>
            <SelectTrigger>
              <SelectValue placeholder="Select when to show completed tasks" />
            </SelectTrigger>
            <SelectContent>
              {filterOptions.map((option) => (
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
