"use client"

import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTranslations } from "@/lib/i18n/hooks"
import {
  getTaskSettings,
  updateTaskSettings,
  getCompletedFilters,
  type ShowCompletedTasksOption,
  type CompletedFilter,
} from "../actions/task-settings-actions"

interface TaskSettingsProps {
  onSettingsChange: () => void
}

export function TaskSettings({ onSettingsChange }: TaskSettingsProps) {
  const { t } = useTranslations("tasks")
  const [showCompletedTasks, setShowCompletedTasks] = useState<ShowCompletedTasksOption>("no")
  const [availableFilters, setAvailableFilters] = useState<CompletedFilter[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettingsAndFilters()
  }, [])

  const loadSettingsAndFilters = async () => {
    try {
      // Load both settings and available filters
      const [settings, filters] = await Promise.all([getTaskSettings(), getCompletedFilters()])

      if (settings) {
        setShowCompletedTasks(settings.show_completed_tasks)
      }

      setAvailableFilters(filters)
      console.log(
        "📋 Available filters:",
        filters.map((f) => f.filter_key),
      )
    } catch (error) {
      console.error("Error loading settings and filters:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (value: ShowCompletedTasksOption) => {
    setSaving(true)
    try {
      console.log("Updating task settings to:", value)
      await updateTaskSettings(value)
      setShowCompletedTasks(value)

      // Trigger refresh in parent component
      onSettingsChange()
    } catch (error) {
      console.error("Error updating task settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const formatFilterLabel = (filter: CompletedFilter): string => {
    if (filter.filter_key === "no") {
      return "Don't show completed tasks"
    }
    return `Show completed tasks from last ${filter.filter_key}`
  }

  if (loading) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Settings className="h-5 w-5" />
          {t("settings.title")}
        </CardTitle>
        <CardDescription className="text-muted-foreground">{t("settings.description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-card-foreground">
            <Settings className="h-4 w-4" />
            <h3 className="font-medium">{t("settings.displaySettings")}</h3>
          </div>

          <div className="space-y-2 pl-6">
            <Label htmlFor="show-completed" className="text-foreground">
              {t("settings.showCompletedTasks")}
            </Label>
            <Select value={showCompletedTasks} onValueChange={handleSettingChange} disabled={saving}>
              <SelectTrigger className="bg-background border-border text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {availableFilters.map((filter) => (
                  <SelectItem key={filter.filter_key} value={filter.filter_key}>
                    {formatFilterLabel(filter)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {saving && <p className="text-sm text-muted-foreground">Updating settings...</p>}

            {/* Show current setting info */}
            <div className="text-xs text-muted-foreground mt-2">
              Current setting: <span className="font-medium">{showCompletedTasks}</span>
              {showCompletedTasks !== "no" && (
                <span className="block mt-1">Completed tasks from the last {showCompletedTasks} will be visible</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
