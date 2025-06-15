"use client"

import { useState, useEffect } from "react"
import { Settings } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useTranslations } from "@/lib/i18n/hooks"
import { getTaskSettings, updateTaskSettings, type ShowCompletedTasksOption } from "../actions/task-settings-actions"

interface TaskSettingsProps {
  onSettingsChange: () => void
}

export function TaskSettings({ onSettingsChange }: TaskSettingsProps) {
  const { t } = useTranslations("tasks")
  const [showCompletedTasks, setShowCompletedTasks] = useState<ShowCompletedTasksOption>("no")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const settings = await getTaskSettings()
      if (settings) {
        setShowCompletedTasks(settings.show_completed_tasks)
      }
    } catch (error) {
      console.error("Error loading task settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (value: ShowCompletedTasksOption) => {
    setSaving(true)
    try {
      await updateTaskSettings(value)
      setShowCompletedTasks(value)
      onSettingsChange()
    } catch (error) {
      console.error("Error updating task settings:", error)
    } finally {
      setSaving(false)
    }
  }

  const completedTasksOptions = [
    { value: "no", label: t("settings.showCompleted.no") },
    { value: "last_10_min", label: t("settings.showCompleted.last10Min") },
    { value: "last_30_min", label: t("settings.showCompleted.last30Min") },
    { value: "last_1_hour", label: t("settings.showCompleted.last1Hour") },
    { value: "last_6_hours", label: t("settings.showCompleted.last6Hours") },
    { value: "today", label: t("settings.showCompleted.today") },
    { value: "yesterday", label: t("settings.showCompleted.yesterday") },
    { value: "this_week", label: t("settings.showCompleted.thisWeek") },
    { value: "this_month", label: t("settings.showCompleted.thisMonth") },
    { value: "all", label: t("settings.showCompleted.all") },
  ]

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
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="show-completed" className="text-foreground">
            {t("settings.showCompletedTasks")}
          </Label>
          <Select value={showCompletedTasks} onValueChange={handleSettingChange} disabled={saving}>
            <SelectTrigger className="bg-background border-border text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {completedTasksOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
