"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export type ShowCompletedTasksOption =
  | "no"
  | "last_10_min"
  | "last_30_min"
  | "last_1_hour"
  | "last_6_hours"
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "all"

export interface TaskSettings {
  id: string
  user_id: string
  show_completed_tasks: ShowCompletedTasksOption
  created_at: string
  updated_at: string
}

export async function getTaskSettings(): Promise<TaskSettings | null> {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("User not authenticated")
      return null
    }

    const { data, error } = await supabase.from("task_settings").select("*").eq("user_id", user.id).single()

    if (error) {
      // If no settings exist, create default settings
      if (error.code === "PGRST116") {
        return await createDefaultTaskSettings()
      }
      console.error("Error fetching task settings:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error in getTaskSettings:", error)
    return null
  }
}

export async function createDefaultTaskSettings(): Promise<TaskSettings> {
  const supabase = await createClient()

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
      show_completed_tasks: "no",
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Error creating task settings: ${error.message}`)
  }

  return data
}

export async function updateTaskSettings(showCompletedTasks: ShowCompletedTasksOption): Promise<TaskSettings> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  // First try to update existing settings
  const { data: updateData, error: updateError } = await supabase
    .from("task_settings")
    .update({
      show_completed_tasks: showCompletedTasks,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", user.id)
    .select()
    .single()

  if (updateError) {
    // If update fails (no existing record), create new settings
    if (updateError.code === "PGRST116") {
      const { data: insertData, error: insertError } = await supabase
        .from("task_settings")
        .insert({
          user_id: user.id,
          show_completed_tasks: showCompletedTasks,
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(`Error creating task settings: ${insertError.message}`)
      }

      revalidatePath("/dashboard/tasks")
      return insertData
    }
    throw new Error(`Error updating task settings: ${updateError.message}`)
  }

  revalidatePath("/dashboard/tasks")
  return updateData
}

export async function getCompletedTasksFilterDate(option: ShowCompletedTasksOption): Promise<Date | null> {
  const now = new Date()

  switch (option) {
    case "no":
      return null
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
      const dayOfWeek = thisWeek.getDay()
      const diff = thisWeek.getDate() - dayOfWeek
      thisWeek.setDate(diff)
      thisWeek.setHours(0, 0, 0, 0)
      return thisWeek
    case "this_month":
      const thisMonth = new Date()
      thisMonth.setDate(1)
      thisMonth.setHours(0, 0, 0, 0)
      return thisMonth
    case "all":
      return new Date(0) // Beginning of time
    default:
      return null
  }
}
