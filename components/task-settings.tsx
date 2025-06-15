"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useTaskSettings } from "@/hooks/use-task-settings"
import { Loader2 } from "lucide-react"

interface TaskSettingsProps {
  onSettingsChange?: () => void
}

export function TaskSettings({ onSettingsChange }: TaskSettingsProps) {
  const { settings, loading, error, updateTaskSettings } = useTaskSettings()
  const [saving, setSaving] = useState(false)

  const handleShowCompletedChange = async (checked: boolean) => {
    try {
      setSaving(true)
      await updateTaskSettings({ show_completed: checked })
      onSettingsChange?.()
    } catch (err) {
      console.error("Failed to update settings:", err)
    } finally {
      setSaving(false)
    }
  }

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
          <p className="text-destructive">Error loading settings: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Display Settings</CardTitle>
        <CardDescription>Configure how tasks are displayed in your task list</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="show-completed">Show completed tasks</Label>
            <p className="text-sm text-muted-foreground">Display completed tasks in the task list</p>
          </div>
          <Switch
            id="show-completed"
            checked={settings?.show_completed ?? true}
            onCheckedChange={handleShowCompletedChange}
            disabled={saving}
          />
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
