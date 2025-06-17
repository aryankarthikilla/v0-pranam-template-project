import { createServerComponentClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = createServerComponentClient()

  try {
    const { data, error } = await supabase.from("tasks").update({ completed: false }).eq("completed", true)

    if (error) {
      console.error("Error resetting tasks:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Tasks reset successfully" }, { status: 200 })
  } catch (error) {
    console.error("Unexpected error resetting tasks:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
