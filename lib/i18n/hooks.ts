"use client"

import { useI18n } from "./context"

export function useTranslations(translations: Record<string, Record<string, string>>) {
  const { language } = useI18n()

  const t = (key: string): string => {
    return translations[key]?.[language] || translations[key]?.["en"] || key
  }

  return { t }
}
