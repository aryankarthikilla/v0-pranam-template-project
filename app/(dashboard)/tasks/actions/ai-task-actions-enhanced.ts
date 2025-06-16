"use server"

import { createClient } from "@/utils/supabase/server"
import { generateTasksFromText, prioritizeExistingTasks, suggestPriority } from "@/lib/ai/gemini-enhanced"
import { revalidatePath } from "next/cache"

export async function createTasksFromAI(input: string) {
  console.log("🚀 Server Action: Creating tasks from AI input:", input)

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Generate tasks using AI with logging
    const aiTasks = await generateTasksFromText(input, user.id)

    // Insert tasks into database with AI priority values
    const tasksToInsert = aiTasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: task.priority || "medium",
      ai_priority_value: task.ai_priority_value || 50,
      status: "pending",
      created_by: user.id,
      updated_by: user.id,
      is_deleted: false,
      level: 1,
    }))

    const { data, error } = await supabase.from("tasks").insert(tasksToInsert).select()

    if (error) throw error

    revalidatePath("/dashboard/tasks")
    return { success: true, tasks: data }
  } catch (error) {
    console.error("❌ Server Action: Create AI tasks error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tasks",
    }
  }
}

export async function prioritizeMyTasks() {
  console.log("🚀 Server Action: Prioritizing existing tasks")

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Get user's pending tasks
    const { data: tasks, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("created_by", user.id)
      .eq("is_deleted", false)
      .in("status", ["pending", "in_progress"])
      .order("created_at", { ascending: false })

    if (fetchError) throw fetchError

    if (!tasks || tasks.length === 0) {
      return { success: false, error: "No tasks found to prioritize" }
    }

    // Get AI prioritization recommendations
    const prioritization = await prioritizeExistingTasks(tasks, user.id)

    // Update tasks with AI priority values
    const updates = prioritization.priority_updates || []
    for (const update of updates) {
      await supabase
        .from("tasks")
        .update({ ai_priority_value: update.ai_priority_value })
        .eq("id", update.task_id)
        .eq("created_by", user.id)
    }

    revalidatePath("/dashboard/tasks")
    return {
      success: true,
      prioritization,
      updated_count: updates.length,
    }
  } catch (error) {
    console.error("❌ Server Action: Prioritize tasks error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to prioritize tasks",
    }
  }
}

export async function suggestTaskPriorityEnhanced(taskTitle: string, taskDescription?: string, dueDate?: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const priorityData = await suggestPriority(taskTitle, taskDescription, dueDate, user.id)
    return { success: true, ...priorityData }
  } catch (error) {
    console.error("Priority suggestion error:", error)
    return { success: false, error: "Failed to suggest priority" }
  }
}

export async function getAILogs(page = 1, limit = 50) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    const offset = (page - 1) * limit

    const {
      data: logs,
      error,
      count,
    } = await supabase
      .from("ai_logs")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return {
      success: true,
      logs: logs || [],
      total: count || 0,
      page,
      limit,
    }
  } catch (error) {
    console.error("Get AI logs error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get AI logs",
    }
  }
}

export async function deleteOldAILogs() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Delete logs older than 30 days for this user
    const { error } = await supabase
      .from("ai_logs")
      .delete()
      .eq("user_id", user.id)
      .lt("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("Delete old AI logs error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete old logs",
    }
  }
}
