"use server"

import { createClient } from "@/utils/supabase/server"
import { generateTasksFromText, breakdownTask, suggestPriority } from "@/lib/ai/gemini"
import { revalidatePath } from "next/cache"

export async function createTasksFromAI(input: string) {
  console.log("🚀 Server Action: Creating tasks from AI input:", input)

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("❌ Server Action: User not authenticated")
      throw new Error("Not authenticated")
    }

    console.log("✅ Server Action: User authenticated:", user.id)

    // Generate tasks using AI
    console.log("🤖 Server Action: Calling AI service...")
    const aiTasks = await generateTasksFromText(input)
    console.log("✅ Server Action: AI returned tasks:", aiTasks)

    // Insert tasks into database
    const tasksToInsert = aiTasks.map((task: any) => ({
      title: task.title,
      description: task.description,
      priority: task.priority || "medium",
      status: "pending",
      created_by: user.id,
      updated_by: user.id,
      is_deleted: false,
      level: 1,
    }))

    console.log("💾 Server Action: Inserting tasks into database:", tasksToInsert)

    const { data, error } = await supabase.from("tasks").insert(tasksToInsert).select()

    if (error) {
      console.error("❌ Server Action: Database error:", error)
      throw error
    }

    console.log("✅ Server Action: Tasks inserted successfully:", data)

    revalidatePath("/dashboard/tasks")
    return { success: true, tasks: data }
  } catch (error) {
    console.error("❌ Server Action: Create AI tasks error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create tasks",
      details: error instanceof Error ? error.stack : undefined,
    }
  }
}

export async function breakdownTaskWithAI(taskId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("Not authenticated")
    }

    // Get the original task
    const { data: task, error: fetchError } = await supabase.from("tasks").select("*").eq("id", taskId).single()

    if (fetchError || !task) {
      throw new Error("Task not found")
    }

    // Generate subtasks using AI
    const subtasks = await breakdownTask(task.title, task.description)

    // Insert subtasks into database
    const subtasksToInsert = subtasks.map((subtask: any) => ({
      title: subtask.title,
      description: subtask.description,
      priority: subtask.priority || task.priority,
      status: "pending",
      parent_id: taskId,
      level: (task.level || 1) + 1,
      created_by: user.id,
      updated_by: user.id,
      is_deleted: false,
    }))

    const { data, error } = await supabase.from("tasks").insert(subtasksToInsert).select()

    if (error) throw error

    revalidatePath("/dashboard/tasks")
    return { success: true, subtasks: data }
  } catch (error) {
    console.error("Breakdown task error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to breakdown task" }
  }
}

export async function suggestTaskPriority(taskTitle: string, taskDescription?: string, dueDate?: string) {
  try {
    const priority = await suggestPriority(taskTitle, taskDescription, dueDate)
    return { success: true, priority }
  } catch (error) {
    console.error("Priority suggestion error:", error)
    return { success: false, error: "Failed to suggest priority" }
  }
}
