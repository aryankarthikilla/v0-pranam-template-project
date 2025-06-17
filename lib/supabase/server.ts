import { createServerClient } from "@supabase/ssr"

export function createClient() {
  // For server components, we need to handle cookies differently
  // This version works in both server and client contexts
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        // Return empty array if cookies are not available
        return []
      },
      setAll() {
        // No-op for client-side usage
      },
    },
  })
}

// Server-specific client for use in server components and API routes
export function createServerComponentClient() {
  const { cookies } = require("next/headers")

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookies().getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookies().set(name, value, options))
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  })
}
