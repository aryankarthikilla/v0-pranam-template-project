"use client"

import { useState } from "react"
import { createTask, updateTask, deleteTask, toggleTaskStatus, markTaskComplete } from "../actions/task-actions"

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

export function useTaskOperations(onTaskChange?: () => void) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreateTask = async (taskData: any) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Creating task:", taskData.title)

      const newTask = await createTask(taskData)
      console.log("✅ Task created:", newTask.id)

      onTaskChange?.()
      return newTask
    } catch (err) {
      console.error("❌ Error creating task:", err)
      setError(err instanceof Error ? err.message : "Failed to create task")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTask = async (taskId: string, taskData: any) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Updating task:", taskId)

      const updatedTask = await updateTask(taskId, taskData)
      console.log("✅ Task updated:", updatedTask.id)

      onTaskChange?.()
      return updatedTask
    } catch (err) {
      console.error("❌ Error updating task:", err)
      setError(err instanceof Error ? err.message : "Failed to update task")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Deleting task:", taskId)

      await deleteTask(taskId)
      console.log("✅ Task deleted:", taskId)

      onTaskChange?.()
    } catch (err) {
      console.error("❌ Error deleting task:", err)
      setError(err instanceof Error ? err.message : "Failed to delete task")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (taskId: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Toggling task status:", taskId)

      const updatedTask = await toggleTaskStatus(taskId)
      console.log("✅ Task status toggled:", updatedTask.status)

      onTaskChange?.()
      return updatedTask
    } catch (err) {
      console.error("❌ Error toggling task status:", err)
      setError(err instanceof Error ? err.message : "Failed to toggle task status")
      throw err
    } finally {
      setLoading(false)
    }
  }

  const handleMarkComplete = async (taskId: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log("🔄 Marking task complete:", taskId)

      const completedTask = await markTaskComplete(taskId)
      console.log("✅ Task marked complete:", completedTask.id)

      onTaskChange?.()
      return completedTask
    } catch (err) {
      console.error("❌ Error marking task complete:", err)
      setError(err instanceof Error ? err.message : "Failed to mark task complete")
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    createTask: handleCreateTask,
    updateTask: handleUpdateTask,
    deleteTask: handleDeleteTask,
    toggleStatus: handleToggleStatus,
    markComplete: handleMarkComplete,
  }
}
