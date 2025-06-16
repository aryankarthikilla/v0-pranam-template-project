"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type ShowCompletedTasksOption = string // Now it's dynamic based on completed_filters table

export interface TaskSettings {
  id: string
  user_id: string
  show_completed_tasks: ShowCompletedTasksOption
  created_at: string
  updated_at: string
}

export interface CompletedFilter {
  filter_key: string
  interval_value: string | null
}

export async function getTaskSettings(): Promise<TaskSettings | null> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    console.log("🔍 Getting task settings for user:", user.id)

    const { data, error } = await supabase.from("task_settings").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "not found" error, which is expected for new users
      console.error("Error fetching task settings:", error)
      throw new Error(`Error fetching task settings: ${error.message}`)
    }

    console.log("📋 Current task settings:", data)
    return data || null
  } catch (error) {
    console.error("Error in getTaskSettings:", error)
    return null
  }
}

export async function getCompletedFilters(): Promise<CompletedFilter[]> {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase
      .from("completed_filters")
      .select("filter_key, interval_value")
      .order("interval_value")

    if (error) {
      console.error("Error fetching completed filters:", error)
      throw new Error(`Error fetching completed filters: ${error.message}`)
    }

    // Add the "no" option at the beginning
    const filters: CompletedFilter[] = [{ filter_key: "no", interval_value: null }, ...(data || [])]

    console.log(
      "📋 Available filters:",
      filters.map((f) => f.filter_key),
    )
    return filters
  } catch (error) {
    console.error("Error in getCompletedFilters:", error)
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

export async function updateTaskSettings(showCompletedTasks: ShowCompletedTasksOption): Promise<TaskSettings> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    console.log("🔄 Updating task settings for user:", user.id, "to:", showCompletedTasks)

    // Upsert the settings
    const { data, error } = await supabase
      .from("task_settings")
      .upsert(
        {
          user_id: user.id,
          show_completed_tasks: showCompletedTasks,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Error updating task settings:", error)
      throw new Error(`Error updating task settings: ${error.message}`)
    }

    console.log("✅ Task settings updated successfully:", data)

    // Revalidate the tasks page to refresh the task list
    revalidatePath("/dashboard/tasks")
    revalidatePath("/dashboard/tasks/manage")

    return data
  } catch (error) {
    console.error("Error in updateTaskSettings:", error)
    throw error
  }
}

export async function createDefaultTaskSettings(): Promise<TaskSettings> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase
      .from("task_settings")
      .insert({
        user_id: user.id,
        show_completed_tasks: "no", // Default to hiding completed tasks
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error creating default task settings: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error("Error in createDefaultTaskSettings:", error)
    throw error
  }
}
