"use client"

import { useState, useEffect, useCallback } from "react"
import { getTasks } from "../actions/task-actions"

export function useTaskData() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  })

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      console.log("Fetching tasks...")
      const data = await getTasks()
      console.log("Fetched tasks:", data.length)
      setTasks(data)

      // Calculate stats
      const now = new Date()
      const statsData = {
        total: data.length,
        completed: data.filter((task: any) => task.status === "completed").length,
        pending: data.filter((task: any) => task.status === "pending").length,
        overdue: data.filter(
          (task: any) => task.due_date && new Date(task.due_date) < now && task.status !== "completed",
        ).length,
      }
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
      setStats({
        total: 0,
        completed: 0,
        pending: 0,
        overdue: 0,
      })
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
    stats,
    refreshTasks: fetchTasks,
  }
}
