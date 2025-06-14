"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Language } from "./index"
import { defaultLanguage } from "./index"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, translations?: Record<string, string>) => string
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function useI18n() {
  const context = useContext(I18nContext)
  if (context === undefined) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}

interface I18nProviderProps {
  children: React.ReactNode
  initialLanguage?: Language
}

export function I18nProvider({ children, initialLanguage = defaultLanguage }: I18nProviderProps) {
  const [language, setLanguageState] = useState<Language>(initialLanguage)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    // Load language from localStorage only on client side
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("language") as Language
      if (savedLanguage && (savedLanguage === "en" || savedLanguage === "te")) {
        setLanguageState(savedLanguage)
      }
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang)
    }
  }

  // Enhanced translation function that can handle common translations
  const t = (key: string, translations?: Record<string, string>) => {
    // If translations object is provided, use it (for backward compatibility)
    if (translations && typeof translations === "object") {
      return translations[language] || translations[defaultLanguage] || key
    }

    // Handle common translations for theme switcher
    const commonTranslations: Record<string, Record<Language, string>> = {
      chooseTheme: {
        en: "Choose Theme",
        te: "థీమ్ ఎంచుకోండి",
      },
      "themes.light": {
        en: "Light",
        te: "వెలుగు",
      },
      "themes.dark": {
        en: "Dark",
        te: "చీకటి",
      },
      "themes.pink": {
        en: "Pink",
        te: "గులాబీ",
      },
      "themes.purple": {
        en: "Purple",
        te: "ఊదా",
      },
      "themes.blue": {
        en: "Blue",
        te: "నీలం",
      },
      "themes.green": {
        en: "Green",
        te: "ఆకుపచ్చ",
      },
    }

    if (commonTranslations[key]) {
      return commonTranslations[key][language] || commonTranslations[key][defaultLanguage] || key
    }

    return key
  }

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
}
