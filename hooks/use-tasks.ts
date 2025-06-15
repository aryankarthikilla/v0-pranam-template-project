"use client"

import { useState, useEffect, useCallback } from "react"
import { getTasks } from "@/app/(dashboard)/tasks/actions/task-actions"

export interface Task {
  id: string
  title: string
  description?: string
  status: "pending" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  due_date?: string
  created_at: string
  updated_at: string
  user_id: string
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await getTasks()
      setTasks(result)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
  }
}
