"use client"

import { useI18n } from "./context"
import { getTranslations, type Section } from "./translations"

export function useTranslations(section: Section) {
  const { language } = useI18n()

  const t = (key: string): string => {
    try {
      const translations = getTranslations(section, language)
      if (!translations || typeof translations !== "object") {
        return key
      }

      const keys = key.split(".")
      let value: any = translations

      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) break
      }

      return typeof value === "string" ? value : key
    } catch (error) {
      console.warn(`Translation error for key "${key}" in section "${section}":`, error)
      return key
    }
  }

  return { t, language }
}
