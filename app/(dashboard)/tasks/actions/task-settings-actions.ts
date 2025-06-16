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
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

    const { data, error } = await supabase.from("task_settings").select("*").eq("user_id", user.id).single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching task settings:", error)
      throw new Error(`Error fetching task settings: ${error.message}`)
    }

    // Return default settings if none exist
    if (!data) {
      return {
        user_id: user.id,
        show_completed_tasks: "no",
      }
    }

    return data
  } catch (error) {
    console.error("Error in getTaskSettings:", error)
    return null
  }
}

export async function updateTaskSettings(showCompletedTasks: string): Promise<TaskSettings> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User not authenticated")
    }

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

    // Revalidate the tasks page
    revalidatePath("/dashboard/tasks")
    revalidatePath("/dashboard/tasks/manage")

    return data
  } catch (error) {
    console.error("Error in updateTaskSettings:", error)
    throw error
  }
}
