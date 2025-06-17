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

    console.log("🔍 Checking for session/task inconsistencies for user:", user.id)

    // Check for tasks marked as in_progress but with no active sessions
    const { data: orphanedTasks, error: orphanedError } = await supabase.rpc("check_orphaned_tasks", {
      p_user_id: user.id,
    })

    if (orphanedError) {
      console.error("❌ Error checking orphaned tasks:", orphanedError)
      // Fallback to direct query
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("tasks")
        .select(
          `
          id,
          title,
          status,
          current_session_id,
          task_sessions!inner(id, is_active, ended_at)
        `,
        )
        .eq("created_by", user.id)
        .eq("status", "in_progress")

      if (fallbackError) {
        throw fallbackError
      }

      // Process fallback data to find orphaned tasks
      const issues = fallbackData
        ?.filter((task) => {
          const activeSessions = task.task_sessions?.filter((s) => s.is_active && !s.ended_at) || []
          return activeSessions.length === 0
        })
        .map((task) => ({
          task_id: task.id,
          title: task.title,
          issue_type: "Task marked as in_progress but no active sessions",
          current_session_id: task.current_session_id,
        }))

      return NextResponse.json({
        success: true,
        issues: issues || [],
        method: "fallback",
      })
    }

    console.log("📊 Orphaned tasks found:", orphanedTasks?.length || 0)

    return NextResponse.json({
      success: true,
      issues: orphanedTasks || [],
      method: "stored_procedure",
    })
  } catch (error) {
    console.error("💥 Error in debug-sessions API:", error)
    return NextResponse.json({ error: "Failed to check for issues", details: error.message }, { status: 500 })
  }
}
