"use client"

import { useState, useEffect } from "react"
import {
  getTaskSettings,
  updateTaskSettings as updateSettings,
} from "@/app/(dashboard)/tasks/actions/task-settings-actions"

export interface TaskSettings {
  id?: string
  user_id: string
  show_completed: boolean
  created_at?: string
  updated_at?: string
}

export function useTaskSettings() {
  const [settings, setSettings] = useState<TaskSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const updateTaskSettings = async (newSettings: Partial<TaskSettings>) => {
    try {
      setError(null)
      const result = await updateSettings(newSettings)
      setSettings(result)
      return result
    } catch (err) {
      console.error("Error updating task settings:", err)
      setError(err instanceof Error ? err.message : "Failed to update settings")
      throw err
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    updateTaskSettings,
    refetch: fetchSettings,
  }
}
