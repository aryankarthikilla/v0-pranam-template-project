import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    const { taskId } = await request.json()

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔄 Resetting task to pending:", taskId)

    // First, end any active sessions for this task
    const { error: sessionError } = await supabase
      .from("task_sessions")
      .update({
        ended_at: new Date().toISOString(),
      })
      .eq("task_id", taskId)
      .is("ended_at", null)

    if (sessionError) {
      console.error("❌ Error ending sessions:", sessionError)
    } else {
      console.log("✅ Ended any active sessions for task")
    }

    // Reset task to pending
    const { error: taskError } = await supabase
      .from("tasks")
      .update({
        status: "pending",
        current_session_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .eq("user_id", user.id)

    if (taskError) {
      console.error("❌ Error resetting task:", taskError)
      throw taskError
    }

    console.log("✅ Task reset successfully")

    return NextResponse.json({
      success: true,
      message: "Task reset to pending status",
    })
  } catch (error) {
    console.error("💥 Error in reset-task API:", error)
    return NextResponse.json({ error: "Failed to reset task", details: error.message }, { status: 500 })
  }
}
