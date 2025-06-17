import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createAuthenticatedSupabaseClient() {
  const cookieStore = cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie setting errors in server components
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // Handle cookie removal errors in server components
          }
        },
      },
    },
  )

  // Verify authentication
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("Authentication required")
  }

  return { supabase, user }
}

// Example usage in server actions
export async function exampleServerAction() {
  try {
    const { supabase, user } = await createAuthenticatedSupabaseClient()

    // Now you can use supabase with proper auth context
    const { data, error } = await supabase.from("tasks").select("*").eq("created_by", user.id)

    return { data, error }
  } catch (error) {
    console.error("Auth error:", error)
    return { data: null, error: "Authentication failed" }
  }
}
