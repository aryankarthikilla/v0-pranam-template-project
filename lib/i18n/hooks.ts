"use client"

import { useI18n } from "./context"
import { useState, useEffect } from "react"

export function useTranslations(section: string) {
  const { language } = useI18n()
  const [translations, setTranslations] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTranslations = async () => {
      try {
        // Load translations from specific section directory
        const response = await fetch(`/${section}/i18n/${language}.json`)

        if (!response.ok) {
          throw new Error(`Failed to fetch translations: ${response.status}`)
        }

        const data = await response.json()
        setTranslations(data)
      } catch (error) {
        console.error(`Failed to load ${section} translations:`, error)

        // Fallback to English if current language fails
        if (language !== "en") {
          try {
            const fallbackResponse = await fetch(`/${section}/i18n/en.json`)
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json()
              setTranslations(fallbackData)
            }
          } catch (fallbackError) {
            console.error(`Failed to load fallback ${section} translations:`, fallbackError)
            // Use hardcoded fallback based on section
            setTranslations(getHardcodedFallback(section))
          }
        }
      } finally {
        setLoading(false)
      }
    }

    loadTranslations()
  }, [language, section])

  const t = (key: string): string => {
    const keys = key.split(".")
    let value = translations

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    return typeof value === "string" ? value : key
  }

  return { t, loading }
}

// Hardcoded fallbacks for different sections
function getHardcodedFallback(section: string): Record<string, any> {
  const fallbacks: Record<string, Record<string, any>> = {
    app: {
      title: "Build Faster with Pranam",
      subtitle: "A modern Next.js starter template",
      getStarted: "Get Started",
      login: "Login",
    },
    auth: {
      welcomeTitle: "Welcome to Pranam",
      signIn: "Sign In",
      signUp: "Sign Up",
      email: "Email",
      password: "Password",
    },
    dashboard: {
      title: "Dashboard",
      welcome: "Welcome to your dashboard",
    },
    profile: {
      title: "Profile Settings",
      subtitle: "Manage your account",
    },
    common: {
      loading: "Loading...",
      error: "Error",
      success: "Success",
    },
  }

  return fallbacks[section] || {}
}
