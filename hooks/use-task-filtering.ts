"use client"

import { useState, useEffect, useCallback } from "react"
import { getTasks } from "@/app/(dashboard)/tasks/actions/task-actions"
import { getTaskSettings } from "@/app/(dashboard)/tasks/actions/task-settings-actions"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  due_date?: string
  created_at: string
  updated_at: string
  completed_at?: string
  is_deleted: boolean
}

export function useTaskFiltering() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilter, setCurrentFilter] = useState<string>("no")

  const loadTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      console.log("🔄 Loading tasks with filtering...")

      // Load tasks (the server-side function handles filtering)
      const tasksData = await getTasks()

      // Load current filter setting for display
      const settings = await getTaskSettings()
      if (settings) {
        setCurrentFilter(settings.show_completed_tasks)
      }

      console.log(`✅ Loaded ${tasksData.length} tasks with filter: ${settings?.show_completed_tasks || "no"}`)
      setTasks(tasksData)
    } catch (err) {
      console.error("❌ Error loading tasks:", err)
      setError(err instanceof Error ? err.message : "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshTasks = useCallback(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  // Separate tasks by status for display
  const pendingTasks = tasks.filter((task) => task.status === "pending" || task.status === "in_progress")

  const completedTasks = tasks.filter((task) => task.status === "completed" || task.status === "done")

  return {
    tasks,
    pendingTasks,
    completedTasks,
    loading,
    error,
    currentFilter,
    refreshTasks,
  }
}
