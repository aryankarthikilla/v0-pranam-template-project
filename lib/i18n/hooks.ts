"use client"

import { useI18n } from "./context"
import { useMemo } from "react"
import { getTranslations, type Section } from "./translations"

export function useTranslations(section: Section) {
  const { language } = useI18n()

  // Get translations synchronously - no loading state needed!
  const translations = useMemo(() => {
    return getTranslations(section, language as "en" | "te")
  }, [section, language])

  const t = (key: string): string => {
    const keys = key.split(".")
    let value: any = translations

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    return typeof value === "string" ? value : key
  }

  // No loading state needed since translations are bundled!
  return { t, loading: false }
}

// Add the missing useTranslation export (singular) as an alias
export const useTranslation = useTranslations

// Export the useI18n hook as well for direct access
export { useI18n } from "./context"
