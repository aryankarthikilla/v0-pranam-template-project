import { createServerComponentClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerComponentClient()

  // Check if the request is coming from a trusted source (e.g., a cron job with a secret token)
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.FIX_SESSIONS_SECRET_KEY}`) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  try {
    const { data: sessions, error: sessionsError } = await supabase.from("sessions").select("*")

    if (sessionsError) {
      console.error("Error fetching sessions:", sessionsError)
      return new NextResponse("Error fetching sessions", { status: 500 })
    }

    if (!sessions || sessions.length === 0) {
      return new NextResponse("No sessions found to fix", { status: 200 })
    }

    let fixedCount = 0
    for (const session of sessions) {
      if (session.user_id === null) {
        // Attempt to fix the session by setting user_id to a default value or null
        const { error: updateError } = await supabase
          .from("sessions")
          .update({ user_id: "00000000-0000-0000-0000-000000000000" }) // Or null, depending on your schema
          .eq("id", session.id)

        if (updateError) {
          console.error(`Error updating session ${session.id}:`, updateError)
        } else {
          fixedCount++
        }
      }
    }

    return new NextResponse(`Successfully fixed ${fixedCount} sessions.`, { status: 200 })
  } catch (error) {
    console.error("Error in fixSessions route:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
