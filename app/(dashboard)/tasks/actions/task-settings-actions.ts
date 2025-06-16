"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getTaskSettings() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { show_completed_tasks: "no" }

  const { data, error } = await supabase
    .from("task_settings")
    .select("show_completed_tasks")
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.log("No existing record found, will create on first update")
  }

  return data || { show_completed_tasks: "no" }
}

export async function getCompletedFilters() {
  const supabase = await createClient()

  const { data } = await supabase.from("completed_filters").select("filter_key, interval_value").order("interval_value")

  return data || []
}

export async function updateTaskSettings(showCompletedTasks: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error("Not authenticated")

  // Try to update first
  const { data: updateData, error: updateError } = await supabase
    .from("task_settings")
    .update({
      show_completed_tasks: showCompletedTasks,
    })
    .eq("user_id", user.id)
    .select()

  if (updateError || !updateData || updateData.length === 0) {
    // Update failed or no rows affected, so insert new record
    console.log("Creating new task_settings record for user:", user.id)

    const { data: insertData, error: insertError } = await supabase
      .from("task_settings")
      .insert({
        user_id: user.id,
        show_completed_tasks: showCompletedTasks,
      })
      .select()

    if (insertError) {
      console.error("Insert error:", insertError)
      throw new Error(`Failed to create settings: ${insertError.message}`)
    }

    revalidatePath("/dashboard/tasks")
    return insertData[0]
  }

  revalidatePath("/dashboard/tasks")
  return updateData[0]
}
