"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User, Session } from "@supabase/supabase-js"

// NextAuth.js compatible types
interface NextAuthUser {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

interface NextAuthSession {
  user?: NextAuthUser
  expires?: string
}

interface UseSessionReturn {
  data: NextAuthSession | null
  status: "loading" | "authenticated" | "unauthenticated"
  update: (data?: any) => Promise<NextAuthSession | null>
}

const SessionContext = createContext<UseSessionReturn>({
  data: null,
  status: "loading",
  update: async () => null,
})

export function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session?: any
}) {
  const [user, setUser] = useState<User | null>(null)
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const supabase = createClient()

  useEffect(() => {
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
          setSupabaseSession(session)
          setUser(session?.user ?? null)
          setStatus(session ? "authenticated" : "unauthenticated")
        }
      } catch (error) {
        console.error("Session error:", error)
        setStatus("unauthenticated")
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseSession(session)
      setUser(session?.user ?? null)
      setStatus(session ? "authenticated" : "unauthenticated")
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const nextAuthSession: NextAuthSession | null = user
    ? {
        user: {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
          image: user.user_metadata?.avatar_url || null,
        },
        expires: supabaseSession?.expires_at
          ? new Date(supabaseSession.expires_at * 1000).toISOString()
          : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      }
    : null

  const update = async (): Promise<NextAuthSession | null> => {
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session ? nextAuthSession : null
  }

  return <SessionContext.Provider value={{ data: nextAuthSession, status, update }}>{children}</SessionContext.Provider>
}

export function useSession(): UseSessionReturn {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider")
  }
  return context
}

// Additional NextAuth.js compatibility exports
export const getSession = async () => {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
    ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
          image: session.user.user_metadata?.avatar_url || null,
        },
        expires: new Date(session.expires_at! * 1000).toISOString(),
      }
    : null
}

export const signIn = async (provider?: string, options?: any) => {
  const supabase = createClient()
  if (provider === "google") {
    return supabase.auth.signInWithOAuth({ provider: "google" })
  }
  // Default to email/password
  return supabase.auth.signInWithPassword(options)
}

export const signOut = async () => {
  const supabase = createClient()
  return supabase.auth.signOut()
}
