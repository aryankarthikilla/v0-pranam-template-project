"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface TaskSession {
  id: string
  task_id: string
  task_title: string
  task_priority: string
  started_at: string
  duration_minutes: number
  location_context?: string
  is_opportunistic: boolean
}

export interface StaleSession {
  session_id: string
  task_id: string
  task_title: string
  started_at: string
  minutes_inactive: number
}

// Start a task session
export async function startTaskSession(taskId: string, locationContext?: string, deviceContext?: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Create new session
    const { data: session, error: sessionError } = await supabase
      .from("task_sessions")
      .insert({
        task_id: taskId,
        user_id: user.id,
        location_context: locationContext,
        device_context: deviceContext || "web",
        session_type: "work",
        is_active: true,
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    // Update task status and current session
    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        status: "in_progress",
        current_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)

    if (taskError) throw taskError

    // Add context tracking
    if (locationContext) {
      await supabase.from("task_contexts").insert({
        task_id: taskId,
        user_id: user.id,
        context_type: "location",
        context_value: locationContext,
        session_id: session.id,
      })
    }

    revalidatePath("/dashboard/tasks")
    return { success: true, session }
  } catch (error) {
    console.error("Start task session error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to start task" }
  }
}

// Pause a task session
export async function pauseTaskSession(sessionId: string, reason?: string) {
  console.log("pauseTaskSession called with:", { sessionId, reason })
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    console.log("User authenticated:", !!user)
    if (!user) throw new Error("Not authenticated")

    console.log("Updating session:", sessionId)
    // End current session
    const { data: session, error: sessionError } = await supabase
      .from("task_sessions")
      .update({
        ended_at: new Date().toISOString(),
        is_active: false,
        notes: reason ? `Paused: ${reason}` : "Paused",
      })
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (sessionError) {
      console.error("Session update error:", sessionError)
      throw sessionError
    }

    console.log("Session updated successfully:", session)

    // Update task status
    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        status: "paused",
        current_session_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", session.task_id)

    if (taskError) {
      console.error("Task update error:", taskError)
      throw taskError
    }

    console.log("Task updated successfully")

    // Add note if reason provided
    if (reason) {
      console.log("Adding pause note")
      await supabase.from("task_notes").insert({
        task_id: session.task_id,
        user_id: user.id,
        note_text: `Task paused: ${reason}`,
        note_type: "pause_reason",
        session_id: sessionId,
      })
    }

    revalidatePath("/dashboard/tasks")
    console.log("pauseTaskSession completed successfully")
    return { success: true }
  } catch (error) {
    console.error("Pause task session error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to pause task" }
  }
}

// Complete a task
export async function completeTask(taskId: string, completionNotes?: string, completionPercentage = 100) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // End any active sessions for this task
    await supabase
      .from("task_sessions")
      .update({
        ended_at: new Date().toISOString(),
        is_active: false,
        notes: "Task completed",
      })
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .is("ended_at", null)

    // Update task
    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        status: "completed",
        completion_percentage: completionPercentage,
        completed_at: new Date().toISOString(),
        current_session_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)

    if (taskError) throw taskError

    // Add completion note
    if (completionNotes) {
      await supabase.from("task_notes").insert({
        task_id: taskId,
        user_id: user.id,
        note_text: completionNotes,
        note_type: "completion_note",
      })
    }

    revalidatePath("/dashboard/tasks")
    return { success: true }
  } catch (error) {
    console.error("Complete task error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to complete task" }
  }
}

// Skip task (reschedule to future)
export async function skipTask(taskId: string, skipDuration: string, reason?: string) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Calculate future date based on skip duration
    const now = new Date()
    const scheduledFor = new Date(now)

    switch (skipDuration) {
      case "1hour":
        scheduledFor.setHours(now.getHours() + 1)
        break
      case "4hours":
        scheduledFor.setHours(now.getHours() + 4)
        break
      case "tomorrow":
        scheduledFor.setDate(now.getDate() + 1)
        break
      case "3days":
        scheduledFor.setDate(now.getDate() + 3)
        break
      case "1week":
        scheduledFor.setDate(now.getDate() + 7)
        break
      default:
        scheduledFor.setHours(now.getHours() + 1)
    }

    // Create schedule entry
    const { error: scheduleError } = await supabase.from("task_schedules").insert({
      task_id: taskId,
      user_id: user.id,
      scheduled_for: scheduledFor.toISOString(),
      schedule_type: "skip",
      reason: reason || "Task skipped",
    })

    if (scheduleError) throw scheduleError

    // Update task status
    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        status: "scheduled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)

    if (taskError) throw taskError

    // Add note
    await supabase.from("task_notes").insert({
      task_id: taskId,
      user_id: user.id,
      note_text: `Task skipped for ${skipDuration}: ${reason || "No reason provided"}`,
      note_type: "skip_reason",
    })

    revalidatePath("/dashboard/tasks")
    return { success: true, scheduledFor: scheduledFor.toISOString() }
  } catch (error) {
    console.error("Skip task error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to skip task" }
  }
}

// Get active sessions
export async function getActiveSessions(): Promise<TaskSession[]> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase.rpc("get_active_sessions", {
      p_user_id: user.id,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get active sessions error:", error)
    return []
  }
}

// Check for stale sessions (inactive > 30 minutes)
export async function getStaleSessionsCheck(): Promise<StaleSession[]> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return []

    const { data, error } = await supabase.rpc("get_stale_sessions", {
      p_user_id: user.id,
    })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error("Get stale sessions error:", error)
    return []
  }
}

// Update estimated time for task
export async function updateTaskEstimatedTime(taskId: string, estimatedMinutes: number) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase
      .from("tasks")
      .update({
        estimated_minutes: estimatedMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("created_by", user.id)

    if (error) throw error

    revalidatePath("/dashboard/tasks")
    return { success: true }
  } catch (error) {
    console.error("Update estimated time error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update estimated time" }
  }
}

// Add task note
export async function addTaskNote(taskId: string, noteText: string, noteType = "general") {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    const { error } = await supabase.from("task_notes").insert({
      task_id: taskId,
      user_id: user.id,
      note_text: noteText,
      note_type: noteType,
    })

    if (error) throw error

    revalidatePath("/dashboard/tasks")
    return { success: true }
  } catch (error) {
    console.error("Add task note error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to add note" }
  }
}

// Handle stale session resolution
export async function resolveStaleSession(
  sessionId: string,
  action: "continue" | "pause" | "complete",
  reason?: string,
) {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("Not authenticated")

    // Get session details
    const { data: session, error: sessionError } = await supabase
      .from("task_sessions")
      .select("*, tasks(id, title)")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError) throw sessionError

    switch (action) {
      case "continue":
        // Keep session active, just add a note
        if (reason) {
          await addTaskNote(session.task_id, `Session continued: ${reason}`, "context_update")
        }
        break

      case "pause":
        await pauseTaskSession(sessionId, reason)
        break

      case "complete":
        await completeTask(session.task_id, reason)
        break
    }

    return { success: true }
  } catch (error) {
    console.error("Resolve stale session error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to resolve session" }
  }
}
