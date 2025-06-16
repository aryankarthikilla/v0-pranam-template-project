"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTaskSettings, updateTaskSettings } from "../actions/task-settings-actions"

const options = [
  { value: "no", label: "Don't show completed tasks" },
  { value: "1 hour", label: "Last 1 hour" },
  { value: "Today", label: "Today" },
  { value: "1 week", label: "Last week" },
]

export function TaskSettings({ onSettingsChange }: { onSettingsChange?: () => void }) {
  const [value, setValue] = useState("no")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getTaskSettings().then((data) => {
      setValue(data.show_completed_tasks)
      setLoading(false)
    })
  }, [])

  const handleChange = async (newValue: string) => {
    setValue(newValue)
    await updateTaskSettings(newValue)
    onSettingsChange?.()
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
