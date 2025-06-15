"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { getTaskSettings, getCompletedTasksFilterDate } from "./task-settings-actions"

export async function getTasks() {
  const supabase = await createClient()

  try {
    console.log("=== TASK FILTERING DEBUG ===")
    console.log("Getting task settings...")
    const settings = await getTaskSettings()
    console.log("Task settings:", JSON.stringify(settings, null, 2))

    let query = supabase.from("tasks").select("*").eq("is_deleted", false).order("created_at", { ascending: false })

    // Apply completed tasks filter based on settings using completed_at field
    if (settings?.show_completed_tasks === "no") {
      console.log("FILTER: Hiding all completed tasks")
      query = query.neq("status", "completed")
    } else if (settings?.show_completed_tasks && settings.show_completed_tasks !== "all") {
      console.log("FILTER: Applying time-based filter for completed tasks:", settings.show_completed_tasks)
      const filterDate = getCompletedTasksFilterDate(settings.show_completed_tasks)
      console.log("Filter date calculated:", filterDate?.toISOString())
      console.log("Current time:", new Date().toISOString())

      if (filterDate) {
        const filterDateISO = filterDate.toISOString()
        console.log("SQL Filter: Show non-completed OR (completed AND completed_at >= '" + filterDateISO + "')")

        // Show all non-completed tasks OR completed tasks that were completed after the filter date
        query = query.or(`status.neq.completed,and(status.eq.completed,completed_at.gte.${filterDateISO})`)
      }
    } else {
      console.log("FILTER: Showing all tasks including all completed tasks")
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      throw new Error(`Error fetching tasks: ${error.message}`)
    }

    console.log("Raw query results count:", data?.length || 0)
    console.log("Tasks by status:", {
      completed: data?.filter((t) => t.status === "completed").length || 0,
      pending: data?.filter((t) => t.status === "pending").length || 0,
      in_progress: data?.filter((t) => t.status === "in_progress").length || 0,
    })

    // Debug completed tasks
    const completedTasks = data?.filter((t) => t.status === "completed") || []
    console.log("Completed tasks details:")
    completedTasks.forEach((task, index) => {
      console.log(`${index + 1}. ${task.title}:`)
      console.log(`   - completed_at: ${task.completed_at}`)
      console.log(`   - created_at: ${task.created_at}`)
      console.log(`   - updated_at: ${task.updated_at}`)
    })

    console.log("=== END DEBUG ===")
    return data || []
  } catch (error) {
    console.error("Error in getTasks:", error)
    // If there's an error with settings, just return all non-deleted tasks
    const { data, error: fallbackError } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })

    if (fallbackError) {
      console.error("Fallback query error:", fallbackError)
      throw new Error(`Error fetching tasks: ${fallbackError.message}`)
    }

    console.log("Using fallback query, tasks count:", data?.length || 0)
    return data || []
  }
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

  // Prepare the update data
  const updateData = {
    ...taskData,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  // If status is being set to completed, set completed_at
  if (taskData.status === "completed") {
    updateData.completed_at = new Date().toISOString()
    console.log("Setting completed_at to:", updateData.completed_at)
  }
  // If status is being changed from completed to something else, clear completed_at
  else if (taskData.status && taskData.status !== "completed") {
    updateData.completed_at = null
    console.log("Clearing completed_at")
  }

  const { data, error } = await supabase.from("tasks").update(updateData).eq("id", taskId).select().single()

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

  // Prepare update data
  const updateData: any = {
    status: newStatus,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  // Set or clear completed_at based on new status
  if (newStatus === "completed") {
    updateData.completed_at = new Date().toISOString()
    console.log("Toggle: Setting completed_at to:", updateData.completed_at)
  } else {
    updateData.completed_at = null
    console.log("Toggle: Clearing completed_at")
  }

  const { data, error } = await supabase.from("tasks").update(updateData).eq("id", taskId).select().single()

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

  const completedAt = new Date().toISOString()
  console.log("Marking task complete with completed_at:", completedAt)

  const { data, error } = await supabase
    .from("tasks")
    .update({
      status: "completed",
      completed_at: completedAt,
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
