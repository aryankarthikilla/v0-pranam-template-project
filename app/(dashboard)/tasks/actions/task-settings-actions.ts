"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export async function getTaskSettings() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { show_completed_tasks: "no" }

  const { data } = await supabase.from("task_settings").select("show_completed_tasks").eq("user_id", user.id).single()

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

  // First, check if a record exists for this user
  const { data: existingRecord } = await supabase.from("task_settings").select("id").eq("user_id", user.id).single()

  if (existingRecord) {
    // Record exists - UPDATE
    const { data } = await supabase
      .from("task_settings")
      .update({
        show_completed_tasks: showCompletedTasks,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .select()
      .single()

    revalidatePath("/dashboard/tasks")
    return data
  } else {
    // No record exists - CREATE
    const { data } = await supabase
      .from("task_settings")
      .insert({
        user_id: user.id,
        show_completed_tasks: showCompletedTasks,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    revalidatePath("/dashboard/tasks")
    return data
  }
}
