"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

// Helper function to get filter date based on setting
function getFilterDate(setting: string): Date | null {
  const now = new Date()

  switch (setting) {
    case "no":
      return null // Will hide all completed tasks
    case "last_10_min":
      return new Date(now.getTime() - 10 * 60 * 1000)
    case "last_30_min":
      return new Date(now.getTime() - 30 * 60 * 1000)
    case "last_1_hour":
      return new Date(now.getTime() - 60 * 60 * 1000)
    case "last_6_hours":
      return new Date(now.getTime() - 6 * 60 * 60 * 1000)
    case "today":
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today
    case "yesterday":
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      yesterday.setHours(0, 0, 0, 0)
      return yesterday
    case "this_week":
      const thisWeek = new Date()
      const day = thisWeek.getDay()
      const diff = thisWeek.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
      thisWeek.setDate(diff)
      thisWeek.setHours(0, 0, 0, 0)
      return thisWeek
    case "this_month":
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      return thisMonth
    case "all":
      return new Date("1970-01-01") // Show all
    default:
      return null
  }
}

export async function getTasks() {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    console.log("=== CALLING NEW STORED PROCEDURE ===")
    console.log("User ID:", user.id)

    // Call your new stored procedure
    const { data, error } = await supabase.rpc("get_user_tasks", {
      p_user_id: user.id,
    })

    if (error) {
      console.error("❌ Stored procedure error:", error)
      throw new Error(`Error calling stored procedure: ${error.message}`)
    }

    console.log(`✅ Stored procedure returned ${data?.length || 0} tasks`)

    // Log task details for debugging
    if (data && data.length > 0) {
      console.log("📋 Returned tasks:")
      data.forEach((task: any, index: number) => {
        const completedInfo =
          task.status === "completed" || task.status === "done" ? ` (completed: ${task.completed_at})` : ""
        console.log(`${index + 1}. ${task.title} - ${task.status}${completedInfo}`)
      })
    } else {
      console.log("📋 No tasks returned")
    }

    return data || []
  } catch (error) {
    console.error("❌ Error in getTasks:", error)

    // Fallback: return all non-deleted tasks
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })

    console.log("🔄 Using fallback, returned", data?.length || 0, "tasks")
    return data || []
  }
}

export async function getCompletedFilters() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("completed_filters")
      .select("filter_key, interval_value")
      .order("interval_value")

    if (error) {
      console.error("❌ Error fetching completed filters:", error)
      throw new Error(`Error fetching completed filters: ${error.message}`)
    }

    // Add the "no" option at the beginning
    const filters = [{ filter_key: "no", interval_value: null }, ...(data || [])]

    console.log(
      "📋 Available filters:",
      filters.map((f) => f.filter_key),
    )
    return filters
  } catch (error) {
    console.error("❌ Error in getCompletedFilters:", error)
    // Return default filters if database query fails
    return [
      { filter_key: "no", interval_value: null },
      { filter_key: "5 min", interval_value: "00:05:00" },
      { filter_key: "10 min", interval_value: "00:10:00" },
      { filter_key: "30 min", interval_value: "00:30:00" },
      { filter_key: "1 hour", interval_value: "01:00:00" },
      { filter_key: "6 hours", interval_value: "06:00:00" },
      { filter_key: "Today", interval_value: "1 day" },
      { filter_key: "1 week", interval_value: "7 days" },
      { filter_key: "1 month", interval_value: "30 days" },
    ]
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

  // Handle completed_at field for both 'completed' and 'done' status
  if (taskData.status === "completed" || taskData.status === "done") {
    updateData.completed_at = new Date().toISOString()
    console.log("✅ Setting completed_at to:", updateData.completed_at)
  } else if (taskData.status && taskData.status !== "completed" && taskData.status !== "done") {
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

  // Toggle between completed/done and pending
  const isCompleted = task.status === "completed" || task.status === "done"
  const newStatus = isCompleted ? "pending" : "completed"

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
    .not("status", "in", "(completed,done)")
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
