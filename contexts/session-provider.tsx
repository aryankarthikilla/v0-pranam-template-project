"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

// NextAuth.js compatible session type
interface NextAuthSession {
  user?: {
    id?: string
    name?: string | null
    email?: string | null
    image?: string | null
  }
  expires?: string
}

interface SessionContextType {
  data: NextAuthSession | null
  status: "loading" | "authenticated" | "unauthenticated"
  update: (data?: any) => Promise<NextAuthSession | null>
}

const SessionContext = createContext<SessionContextType>({
  data: null,
  status: "loading",
  update: async () => null,
})

export function SessionProvider({
  children,
  session: initialSession,
}: {
  children: React.ReactNode
  session?: any
}) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          setStatus("unauthenticated")
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          setStatus(session ? "authenticated" : "unauthenticated")
        }
      } catch (error) {
        console.error("Session error:", error)
        setStatus("unauthenticated")
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setStatus(session ? "authenticated" : "unauthenticated")
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Convert Supabase session to NextAuth format
  const nextAuthSession: NextAuthSession | null = user
    ? {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          image: user.user_metadata?.avatar_url || null,
        },
        expires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : undefined,
      }
    : null

  const update = async (data?: any): Promise<NextAuthSession | null> => {
    // For NextAuth compatibility - refresh session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session ? nextAuthSession : null
  }

  const contextValue: SessionContextType = {
    data: nextAuthSession,
    status,
    update,
  }

  return <SessionContext.Provider value={contextValue}>{children}</SessionContext.Provider>
}

// NextAuth.js compatible useSession hook
export function useSession() {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}

// Export for NextAuth compatibility
export { SessionProvider as default }
