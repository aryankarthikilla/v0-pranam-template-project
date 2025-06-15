"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getTasks() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    console.log("Calling stored procedure for user:", user.id)

    // Call the stored procedure that handles all filtering logic
    const { data, error } = await supabase.rpc("get_user_filtered_tasks", {
      p_user_id: user.id,
    })

    if (error) {
      console.error("Stored procedure error:", error)
      throw new Error(`Error fetching filtered tasks: ${error.message}`)
    }

    console.log(`Stored procedure returned ${data?.length || 0} tasks`)
    console.log("Tasks by status:", {
      completed: data?.filter((t: any) => t.status === "completed").length || 0,
      pending: data?.filter((t: any) => t.status === "pending").length || 0,
      in_progress: data?.filter((t: any) => t.status === "in_progress").length || 0,
    })

    return data || []
  } catch (error) {
    console.error("Error in getTasks:", error)

    // Fallback: simple query without filtering
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return []

    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })

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

  const updateData = {
    ...taskData,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  // Handle completed_at field
  if (taskData.status === "completed") {
    updateData.completed_at = new Date().toISOString()
  } else if (taskData.status && taskData.status !== "completed") {
    updateData.completed_at = null
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

  // Mark task as deleted
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

  // Get current task
  const { data: task, error: fetchError } = await supabase.from("tasks").select("status").eq("id", taskId).single()

  if (fetchError) {
    throw new Error(`Error fetching task: ${fetchError.message}`)
  }

  // Toggle status
  const newStatus = task.status === "completed" ? "pending" : "completed"

  const updateData: any = {
    status: newStatus,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  // Handle completed_at
  if (newStatus === "completed") {
    updateData.completed_at = new Date().toISOString()
  } else {
    updateData.completed_at = null
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
    .eq("is_deleted", false)
    .neq("status", "completed")
    .limit(50)

  if (error) {
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
      completed_at: new Date().toISOString(),
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
