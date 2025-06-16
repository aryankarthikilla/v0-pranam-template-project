"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getTaskSettings() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect("/login")
    }

    const { data, error } = await supabase
      .from("task_settings")
      .select("show_completed_tasks")
      .eq("user_id", user.id)
      .maybeSingle()

    if (error) {
      console.log("No existing record found")
    }

    return data || { show_completed_tasks: "no" }
  } catch (error) {
    console.error("Error in getTaskSettings:", error)
    return { show_completed_tasks: "no" }
  }
}

export async function getCompletedFilters() {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from("completed_filters")
      .select("filter_key, interval_value")
      .order("interval_value")

    if (error) {
      console.error("Error fetching filters:", error)
      // Return default options if database fails
      return [
        { filter_key: "no", interval_value: null },
        { filter_key: "5 min", interval_value: "00:05:00" },
        { filter_key: "1 hour", interval_value: "01:00:00" },
        { filter_key: "Today", interval_value: "1 day" },
      ]
    }

    return data || []
  } catch (error) {
    console.error("Error in getCompletedFilters:", error)
    return [
      { filter_key: "no", interval_value: null },
      { filter_key: "5 min", interval_value: "00:05:00" },
      { filter_key: "1 hour", interval_value: "01:00:00" },
      { filter_key: "Today", interval_value: "1 day" },
    ]
  }
}

export async function updateTaskSettings(showCompletedTasks: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      redirect("/login")
    }

    // Simple upsert approach
    const { data, error } = await supabase
      .from("task_settings")
      .upsert(
        {
          user_id: user.id,
          show_completed_tasks: showCompletedTasks,
        },
        {
          onConflict: "user_id",
        },
      )
      .select()
      .single()

    if (error) {
      console.error("Database error:", error)
      throw new Error("Failed to update settings")
    }

    revalidatePath("/dashboard/tasks")
    return data
  } catch (error) {
    console.error("Error in updateTaskSettings:", error)
    throw error
  }
}
