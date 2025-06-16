"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface TaskSettings {
  id?: string
  user_id: string
  show_completed_tasks: string
  created_at?: string
  updated_at?: string
}

export async function getTaskSettings(): Promise<TaskSettings | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      return null
    }

    const { data, error } = await supabase.from("task_settings").select("*").eq("user_id", user.id).maybeSingle()

    if (error) {
      console.error("Database error:", error)
      // Return default settings if there's an error
      return {
        user_id: user.id,
        show_completed_tasks: "no",
      }
    }

    // Return data or default settings
    return (
      data || {
        user_id: user.id,
        show_completed_tasks: "no",
      }
    )
  } catch (error) {
    console.error("Unexpected error in getTaskSettings:", error)
    return null
  }
}

export async function updateTaskSettings(showCompletedTasks: string): Promise<TaskSettings | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error("Auth error:", authError)
      throw new Error("User not authenticated")
    }

    // Validate the input
    const validOptions = ["no", "5 min", "10 min", "30 min", "1 hour", "6 hours", "Today", "1 week", "1 month"]
    if (!validOptions.includes(showCompletedTasks)) {
      throw new Error("Invalid filter option")
    }

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
      console.error("Database error:", error)
      throw new Error(`Failed to update settings: ${error.message}`)
    }

    // Revalidate pages
    revalidatePath("/dashboard/tasks")
    revalidatePath("/dashboard/tasks/manage")
    revalidatePath("/dashboard/tasks/settings")

    return data
  } catch (error) {
    console.error("Error in updateTaskSettings:", error)
    throw error
  }
}
