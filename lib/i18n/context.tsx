"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Language } from "./index"
import { defaultLanguage } from "./index"

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, translations: Record<string, string>) => string
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

  useEffect(() => {
    // Load language from localStorage
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "te")) {
      setLanguageState(savedLanguage)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("language", lang)
  }

  const t = (key: string, translations: Record<string, string>) => {
    return translations[language] || translations[defaultLanguage] || key
  }

  return <I18nContext.Provider value={{ language, setLanguage, t }}>{children}</I18nContext.Provider>
}
