"use client"

import { useState, useEffect, useCallback } from "react"
import { getTasks } from "../actions/task-actions"
import { getActiveSessions } from "../actions/enhanced-task-actions"

export function useTaskData() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    overdue: 0,
  })
  const [activeSessions, setActiveSessions] = useState<any[]>([])

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      console.log("Fetching tasks and sessions...")
      const [tasksData, sessionsData] = await Promise.all([getTasks(), getActiveSessions()])

      console.log("Fetched tasks:", tasksData.length)
      console.log("Fetched active sessions:", sessionsData.length)

      setTasks(tasksData)
      setActiveSessions(sessionsData)

      // Calculate stats
      const now = new Date()
      const statsData = {
        total: tasksData.length,
        completed: tasksData.filter((task: any) => task.status === "completed").length,
        pending: tasksData.filter((task: any) => task.status === "pending").length,
        overdue: tasksData.filter(
          (task: any) => task.due_date && new Date(task.due_date) < now && task.status !== "completed",
        ).length,
      }
      setStats(statsData)
    } catch (error) {
      console.error("Error fetching tasks:", error)
      setTasks([])
      setActiveSessions([])
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
    activeSessions,
    refreshTasks: fetchTasks,
  }
}
