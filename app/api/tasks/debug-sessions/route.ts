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

    console.log("🔍 Debug: Checking for session/task inconsistencies for user:", user.id)

    // Find orphaned tasks (marked active but no session)
    const { data: orphanedTasks, error: orphanedTasksError } = await supabase
      .from("tasks")
      .select(`
        id,
        title,
        status,
        current_session_id,
        updated_at
      `)
      .eq("user_id", user.id)
      .in("status", ["in_progress", "active"])

    if (orphanedTasksError) {
      console.error("❌ Error fetching orphaned tasks:", orphanedTasksError)
      throw orphanedTasksError
    }

    console.log("📋 Tasks marked as active:", orphanedTasks)

    // Check which of these tasks actually have active sessions
    const issues: any[] = []

    for (const task of orphanedTasks || []) {
      let hasActiveSession = false

      if (task.current_session_id) {
        // Check if the session exists and is active
        const { data: session, error: sessionError } = await supabase
          .from("task_sessions")
          .select("id, ended_at")
          .eq("id", task.current_session_id)
          .single()

        if (!sessionError && session && !session.ended_at) {
          hasActiveSession = true
        }
      }

      if (!hasActiveSession) {
        issues.push({
          issue_type: "ORPHANED TASK - No Active Session",
          task_id: task.id,
          title: task.title,
          status: task.status,
          current_session_id: task.current_session_id,
          updated_at: task.updated_at,
        })
      }
    }

    // Find orphaned sessions (active sessions but task not active)
    const { data: activeSessions, error: activeSessionsError } = await supabase
      .from("task_sessions")
      .select(`
        id,
        task_id,
        started_at,
        tasks!inner(id, title, status, user_id)
      `)
      .is("ended_at", null)
      .eq("tasks.user_id", user.id)

    if (activeSessionsError) {
      console.error("❌ Error fetching active sessions:", activeSessionsError)
      throw activeSessionsError
    }

    console.log("📊 Active sessions found:", activeSessions)

    for (const session of activeSessions || []) {
      const task = session.tasks
      if (!task || !["in_progress", "active"].includes(task.status)) {
        issues.push({
          issue_type: "ORPHANED SESSION - Task Not Active",
          session_id: session.id,
          task_id: session.task_id,
          title: task?.title || "Unknown Task",
          task_status: task?.status || "Unknown",
          started_at: session.started_at,
        })
      }
    }

    console.log("🎯 Total issues found:", issues.length)
    console.log("📝 Issues details:", issues)

    return NextResponse.json({
      success: true,
      issues,
      summary: {
        orphaned_tasks: issues.filter((i) => i.issue_type.includes("ORPHANED TASK")).length,
        orphaned_sessions: issues.filter((i) => i.issue_type.includes("ORPHANED SESSION")).length,
        total: issues.length,
      },
    })
  } catch (error) {
    console.error("💥 Error in debug-sessions API:", error)
    return NextResponse.json({ error: "Failed to check for issues", details: error.message }, { status: 500 })
  }
}
