"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"

interface Task {
  id: string
  title: string
  description?: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  estimated_minutes?: number
  current_session_id?: string
}

interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
  active: number
}

export function useTaskData() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<TaskStats>({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
    active: 0,
  })

  const fetchTasks = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()
      if (userError || !user) {
        throw new Error("User not authenticated")
      }

      // Fetch tasks with optimized query
      const { data: tasksData, error: tasksError } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })

      if (tasksError) {
        throw tasksError
      }

      const fetchedTasks = tasksData || []
      setTasks(fetchedTasks)

      // Calculate stats immediately
      const now = new Date()
      const stats = fetchedTasks.reduce(
        (acc, task) => {
          acc.total++

          if (task.status === "completed") {
            acc.completed++
          } else if (task.status === "in_progress" || task.status === "active") {
            acc.active++
          } else {
            acc.pending++
          }

          // Check if overdue (simplified logic)
          if (task.due_date && new Date(task.due_date) < now && task.status !== "completed") {
            acc.overdue++
          }

          return acc
        },
        {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
          active: 0,
        },
      )

      setStats(stats)
      setError(null)
    } catch (err) {
      console.error("Error fetching tasks:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return {
    tasks,
    loading,
    error,
    stats,
    refetch: fetchTasks,
  }
}
