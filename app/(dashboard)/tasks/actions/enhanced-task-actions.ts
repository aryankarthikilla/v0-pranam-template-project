"use server"

import { createClient } from "@/utils/supabase/server"
import { revalidatePath } from "next/cache"

export interface TaskSession {
  id: string
  task_id: string
  user_id: string
  started_at: string
  ended_at?: string | null
  estimated_minutes?: number
  source?: string
  pause_reason?: string
  task_title: string
  task_priority: string
  location_context?: string
  duration_minutes: number
  tasks?: {
    id: string
    title: string
    description?: string
    status: string
    priority?: string
  }
}

export interface StaleSession {
  session_id: string
  task_id: string
  task_title: string
  started_at: string
  minutes_inactive: number
}

export async function startTaskSession(taskId: string, estimatedMinutes?: number, source = "web") {
  console.log("🚀 startTaskSession called:", { taskId, estimatedMinutes, source })

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return { success: false, error: "Authentication required" }
    }

    console.log("👤 User authenticated:", user.id)

    // Check if task exists and belongs to user
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single()

    if (taskError || !task) {
      console.error("❌ Task not found:", taskError)
      return { success: false, error: "Task not found" }
    }

    console.log("📋 Task found:", task.title)

    // Check for existing active sessions for this task
    const { data: existingSessions, error: sessionCheckError } = await supabase
      .from("task_sessions")
      .select("*")
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .is("ended_at", null)

    if (sessionCheckError) {
      console.error("❌ Error checking existing sessions:", sessionCheckError)
      return { success: false, error: "Failed to check existing sessions" }
    }

    console.log("🔍 Existing active sessions:", existingSessions?.length || 0)

    // If there are existing active sessions, end them first
    if (existingSessions && existingSessions.length > 0) {
      console.log("⏹️ Ending existing active sessions...")
      const { error: endError } = await supabase
        .from("task_sessions")
        .update({
          ended_at: new Date().toISOString(),
          pause_reason: "Auto-paused: New session started",
        })
        .eq("task_id", taskId)
        .eq("user_id", user.id)
        .is("ended_at", null)

      if (endError) {
        console.error("❌ Failed to end existing sessions:", endError)
        return { success: false, error: "Failed to end existing sessions" }
      }
    }

    // Create new session
    const sessionData = {
      task_id: taskId,
      user_id: user.id,
      started_at: new Date().toISOString(),
      estimated_minutes: estimatedMinutes,
      source: source,
    }

    console.log("📝 Creating new session:", sessionData)

    const { data: session, error: sessionError } = await supabase
      .from("task_sessions")
      .insert(sessionData)
      .select()
      .single()

    if (sessionError) {
      console.error("❌ Failed to create session:", sessionError)
      return { success: false, error: "Failed to create session" }
    }

    console.log("✅ Session created:", session.id)

    // Update task status and current_session_id
    const { error: updateError } = await supabase
      .from("tasks")
      .update({
        status: "in_progress",
        current_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", user.id)

    if (updateError) {
      console.error("❌ Failed to update task:", updateError)
      return { success: false, error: "Failed to update task status" }
    }

    console.log("✅ Task updated to in_progress")

    revalidatePath("/tasks")
    return { success: true, session }
  } catch (error) {
    console.error("💥 Exception in startTaskSession:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function pauseTaskSession(sessionId: string, reason?: string) {
  console.log("⏸️ pauseTaskSession called:", { sessionId, reason })

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return { success: false, error: "Authentication required" }
    }

    console.log("👤 User authenticated:", user.id)

    // Get the session to verify it exists and belongs to user
    const { data: session, error: sessionError } = await supabase
      .from("task_sessions")
      .select("*, tasks(*)")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError) {
      console.error("❌ Session query error:", sessionError)
      return { success: false, error: "Session not found or access denied" }
    }

    if (!session) {
      console.error("❌ Session not found")
      return { success: false, error: "Session not found" }
    }

    console.log("📋 Session found:", {
      id: session.id,
      task_id: session.task_id,
      started_at: session.started_at,
      ended_at: session.ended_at,
    })

    // Check if session is already ended
    if (session.ended_at) {
      console.log("⚠️ Session already ended at:", session.ended_at)
      return { success: false, error: "Session is already ended" }
    }

    // Update session with end time and reason
    const updateData = {
      ended_at: new Date().toISOString(),
      pause_reason: reason || "Paused by user",
    }

    console.log("📝 Updating session with:", updateData)

    const { data: updatedSession, error: updateError } = await supabase
      .from("task_sessions")
      .update(updateData)
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Failed to update session:", updateError)
      return { success: false, error: "Failed to pause session: " + updateError.message }
    }

    console.log("✅ Session updated:", updatedSession)

    // Update task status back to pending and clear current_session_id
    const taskUpdateData = {
      status: "pending",
      current_session_id: null,
      updated_at: new Date().toISOString(),
    }

    console.log("📝 Updating task with:", taskUpdateData)

    const { error: taskUpdateError } = await supabase
      .from("tasks")
      .update(taskUpdateData)
      .eq("id", session.task_id)
      .eq("user_id", user.id)

    if (taskUpdateError) {
      console.error("❌ Failed to update task:", taskUpdateError)
      return { success: false, error: "Failed to update task status: " + taskUpdateError.message }
    }

    console.log("✅ Task updated to pending")

    revalidatePath("/tasks")
    return { success: true, session: updatedSession }
  } catch (error) {
    console.error("💥 Exception in pauseTaskSession:", error)
    return { success: false, error: "An unexpected error occurred: " + (error as Error).message }
  }
}

export async function completeTask(taskId: string, notes?: string, completionPercentage = 100) {
  console.log("✅ completeTask called:", { taskId, notes, completionPercentage })

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return { success: false, error: "Authentication required" }
    }

    console.log("👤 User authenticated:", user.id)

    // Get the task to verify it exists and belongs to user
    const { data: task, error: taskError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .eq("user_id", user.id)
      .single()

    if (taskError || !task) {
      console.error("❌ Task not found:", taskError)
      return { success: false, error: "Task not found" }
    }

    console.log("📋 Task found:", task.title)

    // End any active sessions for this task
    const { error: sessionEndError } = await supabase
      .from("task_sessions")
      .update({
        ended_at: new Date().toISOString(),
        pause_reason: "Task completed",
      })
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .is("ended_at", null)

    if (sessionEndError) {
      console.error("❌ Failed to end active sessions:", sessionEndError)
      // Don't return error here, continue with task completion
    }

    // Update task status to completed
    const updateData = {
      status: "completed",
      completed_at: new Date().toISOString(),
      completion_notes: notes,
      completion_percentage: completionPercentage,
      current_session_id: null,
      updated_at: new Date().toISOString(),
    }

    console.log("📝 Updating task with:", updateData)

    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Failed to update task:", updateError)
      return { success: false, error: "Failed to complete task: " + updateError.message }
    }

    console.log("✅ Task completed:", updatedTask.title)

    revalidatePath("/tasks")
    return { success: true, task: updatedTask }
  } catch (error) {
    console.error("💥 Exception in completeTask:", error)
    return { success: false, error: "An unexpected error occurred: " + (error as Error).message }
  }
}

export async function skipTask(taskId: string, duration: string, reason?: string) {
  console.log("⏭️ skipTask called:", { taskId, duration, reason })

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return { success: false, error: "Authentication required" }
    }

    console.log("👤 User authenticated:", user.id)

    // Calculate next available time based on duration
    const now = new Date()
    const nextAvailableAt = new Date(now)

    switch (duration) {
      case "1hour":
        nextAvailableAt.setHours(now.getHours() + 1)
        break
      case "4hours":
        nextAvailableAt.setHours(now.getHours() + 4)
        break
      case "tomorrow":
        nextAvailableAt.setDate(now.getDate() + 1)
        nextAvailableAt.setHours(9, 0, 0, 0) // 9 AM tomorrow
        break
      case "3days":
        nextAvailableAt.setDate(now.getDate() + 3)
        break
      case "1week":
        nextAvailableAt.setDate(now.getDate() + 7)
        break
      default:
        nextAvailableAt.setHours(now.getHours() + 1)
    }

    console.log("📅 Next available at:", nextAvailableAt.toISOString())

    // End any active sessions for this task
    const { error: sessionEndError } = await supabase
      .from("task_sessions")
      .update({
        ended_at: new Date().toISOString(),
        pause_reason: `Skipped: ${reason || "User skipped task"}`,
      })
      .eq("task_id", taskId)
      .eq("user_id", user.id)
      .is("ended_at", null)

    if (sessionEndError) {
      console.error("❌ Failed to end active sessions:", sessionEndError)
      // Don't return error here, continue with task skip
    }

    // Update task with skip information
    const updateData = {
      status: "pending",
      next_available_at: nextAvailableAt.toISOString(),
      skip_reason: reason,
      current_session_id: null,
      updated_at: new Date().toISOString(),
    }

    console.log("📝 Updating task with:", updateData)

    const { data: updatedTask, error: updateError } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Failed to skip task:", updateError)
      return { success: false, error: "Failed to skip task: " + updateError.message }
    }

    console.log("✅ Task skipped:", updatedTask.title)

    revalidatePath("/tasks")
    return { success: true, task: updatedTask }
  } catch (error) {
    console.error("💥 Exception in skipTask:", error)
    return { success: false, error: "An unexpected error occurred: " + (error as Error).message }
  }
}

export async function getActiveSessions() {
  console.log("🔍 getActiveSessions called")

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return []
    }

    console.log("👤 User authenticated:", user.id)

    const { data: sessions, error } = await supabase
      .from("task_sessions")
      .select(`
        *,
        tasks (
          id,
          title,
          description,
          status
        )
      `)
      .eq("user_id", user.id)
      .is("ended_at", null)
      .order("started_at", { ascending: false })

    if (error) {
      console.error("❌ Failed to get active sessions:", error)
      return []
    }

    console.log("📊 Active sessions found:", sessions?.length || 0)
    return sessions || []
  } catch (error) {
    console.error("💥 Exception in getActiveSessions:", error)
    return []
  }
}

export async function addTaskNote(taskId: string, noteText: string, noteType = "general") {
  console.log("📝 addTaskNote called:", { taskId, noteText, noteType })

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return { success: false, error: "Authentication required" }
    }

    console.log("👤 User authenticated:", user.id)

    // Insert the note
    const { data: note, error: noteError } = await supabase
      .from("task_notes")
      .insert({
        task_id: taskId,
        user_id: user.id,
        note_text: noteText,
        note_type: noteType,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (noteError) {
      console.error("❌ Failed to add note:", noteError)
      return { success: false, error: "Failed to add note: " + noteError.message }
    }

    console.log("✅ Note added:", note.id)

    revalidatePath("/tasks")
    return { success: true, note }
  } catch (error) {
    console.error("💥 Exception in addTaskNote:", error)
    return { success: false, error: "An unexpected error occurred: " + (error as Error).message }
  }
}

export async function updateTaskEstimatedTime(taskId: string, estimatedMinutes: number) {
  console.log("⏱️ updateTaskEstimatedTime called:", { taskId, estimatedMinutes })

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return { success: false, error: "Authentication required" }
    }

    console.log("👤 User authenticated:", user.id)

    // Update the task's estimated time
    const { data: task, error: updateError } = await supabase
      .from("tasks")
      .update({
        estimated_minutes: estimatedMinutes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("❌ Failed to update estimated time:", updateError)
      return { success: false, error: "Failed to update estimated time: " + updateError.message }
    }

    console.log("✅ Estimated time updated:", task.title)

    revalidatePath("/tasks")
    return { success: true, task }
  } catch (error) {
    console.error("💥 Exception in updateTaskEstimatedTime:", error)
    return { success: false, error: "An unexpected error occurred: " + (error as Error).message }
  }
}

export async function getStaleSessionsCheck() {
  console.log("🔍 getStaleSessionsCheck called")

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return []
    }

    console.log("👤 User authenticated:", user.id)

    // Get sessions that have been active for more than 30 minutes without updates
    const thirtyMinutesAgo = new Date()
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30)

    const { data: staleSessions, error } = await supabase
      .from("task_sessions")
      .select(`
        *,
        tasks (
          id,
          title,
          description,
          status
        )
      `)
      .eq("user_id", user.id)
      .is("ended_at", null)
      .lt("started_at", thirtyMinutesAgo.toISOString())
      .order("started_at", { ascending: false })

    if (error) {
      console.error("❌ Failed to get stale sessions:", error)
      return []
    }

    console.log("📊 Stale sessions found:", staleSessions?.length || 0)

    // Transform to match the expected interface
    const transformedSessions =
      staleSessions?.map((session) => ({
        session_id: session.id,
        task_id: session.task_id,
        task_title: session.tasks?.title || "Unknown Task",
        started_at: session.started_at,
        minutes_inactive: Math.floor((new Date().getTime() - new Date(session.started_at).getTime()) / (1000 * 60)),
      })) || []

    return transformedSessions
  } catch (error) {
    console.error("💥 Exception in getStaleSessionsCheck:", error)
    return []
  }
}

export async function resolveStaleSession(
  sessionId: string,
  action: "continue" | "pause" | "complete",
  reason?: string,
) {
  console.log("🔧 resolveStaleSession called:", { sessionId, action, reason })

  try {
    const supabase = await createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error("❌ User authentication failed:", userError)
      return { success: false, error: "Authentication required" }
    }

    console.log("👤 User authenticated:", user.id)

    // Get the session details
    const { data: session, error: sessionError } = await supabase
      .from("task_sessions")
      .select("*, tasks(*)")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .single()

    if (sessionError || !session) {
      console.error("❌ Session not found:", sessionError)
      return { success: false, error: "Session not found" }
    }

    console.log("📋 Session found:", session.id)

    switch (action) {
      case "continue":
        // Just add a note if reason provided
        if (reason) {
          await addTaskNote(session.task_id, `Session continued: ${reason}`, "context_update")
        }
        console.log("✅ Session continued")
        break

      case "pause":
        const pauseResult = await pauseTaskSession(sessionId, reason)
        if (!pauseResult.success) {
          return pauseResult
        }
        console.log("✅ Session paused")
        break

      case "complete":
        const completeResult = await completeTask(session.task_id, reason)
        if (!completeResult.success) {
          return completeResult
        }
        console.log("✅ Task completed")
        break

      default:
        return { success: false, error: "Invalid action" }
    }

    revalidatePath("/tasks")
    return { success: true }
  } catch (error) {
    console.error("💥 Exception in resolveStaleSession:", error)
    return { success: false, error: "An unexpected error occurred: " + (error as Error).message }
  }
}
