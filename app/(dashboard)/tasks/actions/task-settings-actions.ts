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

  await supabase.from("task_settings").upsert({
    user_id: user.id,
    show_completed_tasks: showCompletedTasks,
  })

  revalidatePath("/dashboard/tasks")
  return { show_completed_tasks: showCompletedTasks }
}
