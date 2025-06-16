"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Settings } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useTranslations } from "@/lib/i18n/hooks"
import { getTaskSettings, updateTaskSettings } from "../actions/task-settings-actions"

interface TaskSettingsProps {
  onSettingsChange?: () => void
}

export function TaskSettings({ onSettingsChange }: TaskSettingsProps) {
  const { t } = useTranslations("tasks")
  const [isOpen, setIsOpen] = useState(false)
  const [currentSetting, setCurrentSetting] = useState<string>("no")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadCurrentSettings()
  }, [])

  const loadCurrentSettings = async () => {
    try {
      const settings = await getTaskSettings()
      setCurrentSetting(settings.show_completed || "no")
    } catch (error) {
      console.error("Error loading task settings:", error)
    }
  }

  const handleSettingChange = async (value: string) => {
    setLoading(true)
    try {
      await updateTaskSettings({ show_completed: value })
      setCurrentSetting(value)
      onSettingsChange?.()
    } catch (error) {
      console.error("Error updating task settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getSettingDescription = (setting: string) => {
    switch (setting) {
      case "no":
        return t("settings.showCompleted.no")
      case "last_10_min":
        return t("settings.showCompleted.last10Min")
      case "last_30_min":
        return t("settings.showCompleted.last30Min")
      case "last_1_hour":
        return t("settings.showCompleted.last1Hour")
      case "last_6_hours":
        return t("settings.showCompleted.last6Hours")
      case "today":
        return t("settings.showCompleted.today")
      case "yesterday":
        return t("settings.showCompleted.yesterday")
      case "this_week":
        return t("settings.showCompleted.thisWeek")
      case "this_month":
        return t("settings.showCompleted.thisMonth")
      case "all":
        return t("settings.showCompleted.all")
      default:
        return "Completed tasks are hidden"
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border bg-card">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-base font-medium text-card-foreground">{t("settings.title")}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">{getSettingDescription(currentSetting)}</span>
                {isOpen ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-card-foreground">{t("settings.showCompletedTasks")}</label>
                <Select value={currentSetting} onValueChange={handleSettingChange} disabled={loading}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">{t("settings.showCompleted.no")}</SelectItem>
                    <SelectItem value="last_10_min">{t("settings.showCompleted.last10Min")}</SelectItem>
                    <SelectItem value="last_30_min">{t("settings.showCompleted.last30Min")}</SelectItem>
                    <SelectItem value="last_1_hour">{t("settings.showCompleted.last1Hour")}</SelectItem>
                    <SelectItem value="last_6_hours">{t("settings.showCompleted.last6Hours")}</SelectItem>
                    <SelectItem value="today">{t("settings.showCompleted.today")}</SelectItem>
                    <SelectItem value="yesterday">{t("settings.showCompleted.yesterday")}</SelectItem>
                    <SelectItem value="this_week">{t("settings.showCompleted.thisWeek")}</SelectItem>
                    <SelectItem value="this_month">{t("settings.showCompleted.thisMonth")}</SelectItem>
                    <SelectItem value="all">{t("settings.showCompleted.all")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <p className="text-xs text-muted-foreground">{t("settings.description")}</p>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}
