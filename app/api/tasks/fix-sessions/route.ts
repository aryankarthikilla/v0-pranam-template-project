import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔧 Fix: Starting session/task consistency fix for user:", user.id)

    let fixedCount = 0

    // 1. Fix orphaned tasks (marked active but no session)
    const { data: orphanedTasks, error: orphanedTasksError } = await supabase
      .from("tasks")
      .select("id, title, status, current_session_id")
      .eq("user_id", user.id)
      .in("status", ["in_progress", "active"])

    if (orphanedTasksError) {
      throw orphanedTasksError
    }

    for (const task of orphanedTasks || []) {
      let hasActiveSession = false

      if (task.current_session_id) {
        const { data: session } = await supabase
          .from("task_sessions")
          .select("id, ended_at")
          .eq("id", task.current_session_id)
          .single()

        if (session && !session.ended_at) {
          hasActiveSession = true
        }
      }

      if (!hasActiveSession) {
        // Reset task to pending
        const { error: updateError } = await supabase
          .from("tasks")
          .update({
            status: "pending",
            current_session_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", task.id)

        if (!updateError) {
          console.log(`✅ Fixed orphaned task: ${task.title}`)
          fixedCount++
        } else {
          console.error(`❌ Failed to fix task ${task.id}:`, updateError)
        }
      }
    }

    // 2. Fix orphaned sessions (active sessions but task not active)
    const { data: activeSessions, error: activeSessionsError } = await supabase
      .from("task_sessions")
      .select(`
        id,
        task_id,
        tasks!inner(id, status, user_id)
      `)
      .is("ended_at", null)
      .eq("tasks.user_id", user.id)

    if (activeSessionsError) {
      throw activeSessionsError
    }

    for (const session of activeSessions || []) {
      const task = session.tasks
      if (!task || !["in_progress", "active"].includes(task.status)) {
        // End the orphaned session
        const { error: updateError } = await supabase
          .from("task_sessions")
          .update({
            ended_at: new Date().toISOString(),
            end_reason: "Auto-ended: Task not active",
          })
          .eq("id", session.id)

        if (!updateError) {
          console.log(`✅ Ended orphaned session: ${session.id}`)
          fixedCount++
        } else {
          console.error(`❌ Failed to end session ${session.id}:`, updateError)
        }
      }
    }

    console.log(`🎉 Fixed ${fixedCount} issues total`)

    return NextResponse.json({
      success: true,
      fixed: fixedCount,
      message: `Successfully fixed ${fixedCount} data consistency issues`,
    })
  } catch (error) {
    console.error("💥 Error in fix-sessions API:", error)
    return NextResponse.json({ error: "Failed to fix issues", details: error.message }, { status: 500 })
  }
}
