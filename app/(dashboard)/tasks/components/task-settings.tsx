"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTaskSettings, updateTaskSettings, getCompletedFilters } from "../actions/task-settings-actions"

interface FilterOption {
  filter_key: string
  interval_value: string | null
}

export function TaskSettings({ onSettingsChange }: { onSettingsChange?: () => void }) {
  const [value, setValue] = useState("no")
  const [options, setOptions] = useState<FilterOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getTaskSettings(), getCompletedFilters()]).then(([settings, filters]) => {
      setValue(settings.show_completed_tasks)
      setOptions(filters)
      setLoading(false)
    })
  }, [])

  const handleChange = async (newValue: string) => {
    setValue(newValue)
    try {
      await updateTaskSettings(newValue)
      onSettingsChange?.()
    } catch (error) {
      console.error("Failed to update settings:", error)
      // Revert the UI change if update failed
      setValue(value)
    }
  }

  const getOptionLabel = (option: FilterOption) => {
    if (option.filter_key === "no") {
      return "Don't show completed tasks"
    }
    return option.filter_key
  }

  if (loading) return <div>Loading...</div>

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Display Settings</CardTitle>
        <CardDescription>Configure how completed tasks are displayed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label>Show completed tasks</Label>
          <Select value={value} onValueChange={handleChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.filter_key} value={option.filter_key}>
                  {getOptionLabel(option)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
