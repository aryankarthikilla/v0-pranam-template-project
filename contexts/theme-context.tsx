"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { themes, type ThemeKey } from "@/lib/themes"

interface ThemeContextType {
  theme: ThemeKey
  setTheme: (theme: ThemeKey) => void
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

interface ThemeProviderProps {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeKey>("light")
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Load theme from user profile or localStorage
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          // Try to get theme from user profile
          const { data: profile } = await supabase.from("profiles").select("theme").eq("id", user.id).single()

          if (profile?.theme) {
            setThemeState(profile.theme as ThemeKey)
            applyTheme(profile.theme as ThemeKey)
          } else {
            // Fallback to localStorage
            const savedTheme = localStorage.getItem("theme") as ThemeKey
            if (savedTheme && themes[savedTheme]) {
              setThemeState(savedTheme)
              applyTheme(savedTheme)
            }
          }
        } else {
          // Not logged in, use localStorage
          const savedTheme = localStorage.getItem("theme") as ThemeKey
          if (savedTheme && themes[savedTheme]) {
            setThemeState(savedTheme)
            applyTheme(savedTheme)
          }
        }
      } catch (error) {
        console.error("Error loading theme:", error)
        // Fallback to localStorage
        const savedTheme = localStorage.getItem("theme") as ThemeKey
        if (savedTheme && themes[savedTheme]) {
          setThemeState(savedTheme)
          applyTheme(savedTheme)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [supabase])

  const applyTheme = (newTheme: ThemeKey) => {
    const root = document.documentElement
    const themeColors = themes[newTheme].colors

    // Apply CSS custom properties
    Object.entries(themeColors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Handle dark mode class
    if (newTheme === "dark") {
      root.classList.add("dark")
    } else {
      root.classList.remove("dark")
    }
  }

  const setTheme = async (newTheme: ThemeKey) => {
    setThemeState(newTheme)
    applyTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        // Update theme in user profile
        await supabase.from("profiles").upsert({
          id: user.id,
          theme: newTheme,
          updated_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error saving theme:", error)
    }
  }

  return <ThemeContext.Provider value={{ theme, setTheme, isLoading }}>{children}</ThemeContext.Provider>
}
