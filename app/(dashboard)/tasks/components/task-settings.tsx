"use client"

import { useState, useEffect } from "react"
import { Settings, ChevronDown, ChevronUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
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
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    loadSettingsAndFilters()
  }, [])

  const loadSettingsAndFilters = async () => {
    try {
      console.log("🔄 Loading task settings and filters...")
      // Load both settings and available filters
      const [settings, filters] = await Promise.all([getTaskSettings(), getCompletedFilters()])

      if (settings) {
        setShowCompletedTasks(settings.show_completed_tasks)
        console.log("✅ Current setting:", settings.show_completed_tasks)
      }

      setAvailableFilters(filters)
      console.log(
        "✅ Available filters:",
        filters.map((f) => f.filter_key),
      )
    } catch (error) {
      console.error("❌ Error loading settings and filters:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (value: ShowCompletedTasksOption) => {
    setSaving(true)
    try {
      console.log("🔄 Updating task settings to:", value)
      await updateTaskSettings(value)
      setShowCompletedTasks(value)

      // Trigger refresh in parent component
      onSettingsChange()
      console.log("✅ Settings updated successfully")
    } catch (error) {
      console.error("❌ Error updating task settings:", error)
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

  const getCurrentFilterDescription = (): string => {
    const currentFilter = availableFilters.find((f) => f.filter_key === showCompletedTasks)
    if (!currentFilter) return "Unknown setting"

    if (currentFilter.filter_key === "no") {
      return "Completed tasks are hidden"
    }
    return `Showing completed tasks from the last ${currentFilter.filter_key}`
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
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border bg-card">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-card-foreground" />
                <div>
                  <CardTitle className="text-card-foreground">{t("settings.title")}</CardTitle>
                  <CardDescription className="text-muted-foreground">{getCurrentFilterDescription()}</CardDescription>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="show-completed" className="text-foreground font-medium">
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
                {saving && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <div className="animate-spin h-3 w-3 border border-current border-t-transparent rounded-full"></div>
                    Updating settings...
                  </p>
                )}
              </div>

              {/* Additional info */}
              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded-md">
                <p>
                  <strong>Current setting:</strong> {showCompletedTasks}
                </p>
                {showCompletedTasks !== "no" && (
                  <p>
                    Completed tasks from the last <strong>{showCompletedTasks}</strong> will be visible in your task
                    list.
                  </p>
                )}
                {showCompletedTasks === "no" && <p>All completed tasks are hidden from your task list.</p>}
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
