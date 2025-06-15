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

    console.log("=== CALLING STORED PROCEDURE ===")
    console.log("User ID:", user.id)

    // Call the stored procedure
    const { data, error } = await supabase.rpc("get_user_tasks_filtered", {
      p_user_id: user.id,
    })

    if (error) {
      console.error("Stored procedure error:", error)
      throw new Error(`Error calling stored procedure: ${error.message}`)
    }

    console.log(`✅ Stored procedure returned ${data?.length || 0} tasks`)

    // Log task details for debugging
    if (data && data.length > 0) {
      console.log("📋 Returned tasks:")
      data.forEach((task: any, index: number) => {
        const completedInfo = task.status === "completed" ? ` (completed: ${task.completed_at})` : ""
        console.log(`${index + 1}. ${task.title} - ${task.status}${completedInfo}`)
      })
    } else {
      console.log("📋 No tasks returned")
    }

    return data || []
  } catch (error) {
    console.error("❌ Error in getTasks:", error)

    // Fallback: return all tasks
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })

    console.log("🔄 Using fallback, returned", data?.length || 0, "tasks")
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
    console.log("✅ Setting completed_at to:", updateData.completed_at)
  } else if (taskData.status && taskData.status !== "completed") {
    updateData.completed_at = null
    console.log("🔄 Clearing completed_at")
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

  const newStatus = task.status === "completed" ? "pending" : "completed"

  const updateData: any = {
    status: newStatus,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }

  // Handle completed_at
  if (newStatus === "completed") {
    updateData.completed_at = new Date().toISOString()
    console.log("✅ Toggle: Setting completed_at to:", updateData.completed_at)
  } else {
    updateData.completed_at = null
    console.log("🔄 Toggle: Clearing completed_at")
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

  const completedAt = new Date().toISOString()
  console.log("✅ Marking task complete with completed_at:", completedAt)

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
