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
      console.error("User not authenticated in getTaskSettings")
      return null
    }

    console.log("Fetching task settings for user:", user.id)
    const { data, error } = await supabase.from("task_settings").select("*").eq("user_id", user.id).single()

    if (error) {
      console.log("Task settings error:", error)
      // If no settings exist, create default settings
      if (error.code === "PGRST116") {
        console.log("No settings found, creating default settings")
        return await createDefaultTaskSettings()
      }
      console.error("Error fetching task settings:", error)
      return null
    }

    console.log("Found task settings:", data)
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

  console.log("Creating default task settings for user:", user.id)
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

  console.log("Created default task settings:", data)
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

  console.log("Updating task settings for user:", user.id, "to:", showCompletedTasks)

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
    console.log("Update error:", updateError)
    // If update fails (no existing record), create new settings
    if (updateError.code === "PGRST116") {
      console.log("No existing settings, creating new ones")
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

      console.log("Created new task settings:", insertData)
      revalidatePath("/dashboard/tasks")
      return insertData
    }
    throw new Error(`Error updating task settings: ${updateError.message}`)
  }

  console.log("Updated task settings:", updateData)
  revalidatePath("/dashboard/tasks")
  return updateData
}

export async function getCompletedTasksFilterDate(option: ShowCompletedTasksOption): Promise<Date | null> {
  const now = new Date()
  console.log("Calculating filter date for option:", option, "current time:", now.toISOString())

  let filterDate: Date | null = null

  switch (option) {
    case "no":
      filterDate = null
      break
    case "last_10_min":
      filterDate = new Date(now.getTime() - 10 * 60 * 1000)
      break
    case "last_30_min":
      filterDate = new Date(now.getTime() - 30 * 60 * 1000)
      break
    case "last_1_hour":
      filterDate = new Date(now.getTime() - 60 * 60 * 1000)
      break
    case "last_6_hours":
      filterDate = new Date(now.getTime() - 6 * 60 * 60 * 1000)
      break
    case "today":
      filterDate = new Date()
      filterDate.setHours(0, 0, 0, 0)
      break
    case "yesterday":
      filterDate = new Date()
      filterDate.setDate(filterDate.getDate() - 1)
      filterDate.setHours(0, 0, 0, 0)
      break
    case "this_week":
      filterDate = new Date()
      const dayOfWeek = filterDate.getDay()
      const diff = filterDate.getDate() - dayOfWeek
      filterDate.setDate(diff)
      filterDate.setHours(0, 0, 0, 0)
      break
    case "this_month":
      filterDate = new Date()
      filterDate.setDate(1)
      filterDate.setHours(0, 0, 0, 0)
      break
    case "all":
      filterDate = new Date(0) // Beginning of time
      break
    default:
      filterDate = null
  }

  console.log("Calculated filter date:", filterDate?.toISOString() || "null")
  return filterDate
}
