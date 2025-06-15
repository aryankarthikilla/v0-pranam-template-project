"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { getTaskSettings, getCompletedTasksFilterDate } from "./task-settings-actions"

export async function getTasks() {
  const supabase = await createClient()
  const settings = await getTaskSettings()

  let query = supabase.from("tasks").select("*").eq("is_deleted", false).order("created_at", { ascending: false })

  // Apply completed tasks filter based on settings
  if (settings?.show_completed_tasks === "no") {
    query = query.neq("status", "completed")
  } else if (settings?.show_completed_tasks !== "all") {
    const filterDate = getCompletedTasksFilterDate(settings?.show_completed_tasks || "no")
    if (filterDate) {
      query = query.or(`status.neq.completed,and(status.eq.completed,updated_at.gte.${filterDate.toISOString()})`)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error("Database error:", error)
    throw new Error(`Error fetching tasks: ${error.message}`)
  }

  return data || []
}

export async function createTask(taskData: any) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      ...taskData,
      created_by: user.id,
      updated_by: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating task: ${error.message}`)
  }

  revalidatePath("/dashboard/tasks")
  return data
}

export async function updateTask(taskId: string, taskData: any) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...taskData,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating task: ${error.message}`)
  }

  revalidatePath("/dashboard/tasks")
  return data
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  console.log("Deleting task with ID:", taskId)

  // First, mark all subtasks as deleted
  const { error: subtaskError } = await supabase
    .from("tasks")
    .update({
      is_deleted: true,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("parent_id", taskId)
    .eq("is_deleted", false)

  if (subtaskError) {
    console.error("Error deleting subtasks:", subtaskError)
  }

  // Then mark the main task as deleted
  const { data, error } = await supabase
    .from("tasks")
    .update({
      is_deleted: true,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("is_deleted", false)
    .select()

  if (error) {
    console.error("Database error:", error)
    throw new Error(`Error deleting task: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error("Task not found or already deleted")
  }

  revalidatePath("/dashboard/tasks")
  return { success: true, deletedTask: data[0] }
}

export async function toggleTaskStatus(taskId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  // First get the current task
  const { data: task, error: fetchError } = await supabase.from("tasks").select("status").eq("id", taskId).single()

  if (fetchError) {
    throw new Error(`Error fetching task: ${fetchError.message}`)
  }

  // Toggle status
  const newStatus = task.status === "completed" ? "pending" : "completed"

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error updating task status: ${error.message}`)
  }

  revalidatePath("/dashboard/tasks")
  return data
}

export async function getRandomTask() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("is_deleted", false) // Only non-deleted tasks
    .neq("status", "completed")
    .limit(50)

  if (error) {
    console.error("Database error:", error)
    throw new Error(`Error fetching random task: ${error.message}`)
  }

  if (!data || data.length === 0) {
    return null
  }

  const randomIndex = Math.floor(Math.random() * data.length)
  return data[randomIndex]
}

export async function markTaskComplete(taskId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: "completed",
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .select()
    .single()

  if (error) {
    throw new Error(`Error marking task complete: ${error.message}`)
  }

  revalidatePath("/dashboard/tasks")
  return data
}
