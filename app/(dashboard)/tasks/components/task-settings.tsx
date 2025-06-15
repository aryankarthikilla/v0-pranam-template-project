"use client"

import { useState, useEffect } from "react"
import { useTaskSettings } from "@/hooks/use-task-settings"
import { updateTaskSettings } from "@/lib/api"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import type { ShowCompletedTasksOption } from "@/types"

interface TaskSettingsProps {
  onSettingsChange?: () => void
}

export function TaskSettings({ onSettingsChange }: TaskSettingsProps) {
  const { settings, isLoading: settingsLoading, error: settingsError } = useTaskSettings()
  const [loading, setLoading] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    if (settings) {
      setShowCompleted(settings.show_completed_tasks === "show")
    }
  }, [settings])

  if (settingsLoading) {
    return <div>Loading settings...</div>
  }

  if (settingsError) {
    return <div>Error loading settings: {settingsError.message}</div>
  }

  const handleSettingsChange = async (value: ShowCompletedTasksOption) => {
    try {
      setLoading(true)
      await updateTaskSettings(value)
      setSettings((prev) => (prev ? { ...prev, show_completed_tasks: value } : null))

      // Trigger refresh in parent component
      if (onSettingsChange) {
        onSettingsChange()
      }
    } catch (error) {
      console.error("Error updating settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleShowCompletedChange = async (checked: boolean) => {
    const value: ShowCompletedTasksOption = checked ? "show" : "hide"
    setShowCompleted(checked)
    await handleSettingsChange(value)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Switch
          id="showCompleted"
          checked={showCompleted}
          onCheckedChange={handleShowCompletedChange}
          disabled={loading}
        />
        <Label htmlFor="showCompleted">Show completed tasks</Label>
      </div>
      {loading && <div>Updating settings...</div>}
    </div>
  )
}
