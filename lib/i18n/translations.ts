// Import all translations from their respective page folders
import appEn from "@/app/(public)/i18n/en.json"
import appTe from "@/app/(public)/i18n/te.json"
import authEn from "@/app/(public)/login/i18n/en.json"
import authTe from "@/app/(public)/login/i18n/te.json"
import dashboardEn from "@/app/dashboard/i18n/en.json"
import dashboardTe from "@/app/dashboard/i18n/te.json"
import profileEn from "@/app/dashboard/profile/i18n/en.json"
import profileTe from "@/app/dashboard/profile/i18n/te.json"
import commonEn from "@/lib/i18n/common/en.json"
import commonTe from "@/lib/i18n/common/te.json"

// Type definitions
export type Language = "en" | "te"
export type Section = "app" | "auth" | "dashboard" | "profile" | "common"

// Organized translations object
export const translations: Record<Section, Record<Language, Record<string, string>>> = {
  app: {
    en: appEn,
    te: appTe,
  },
  auth: {
    en: authEn,
    te: authTe,
  },
  dashboard: {
    en: dashboardEn,
    te: dashboardTe,
  },
  profile: {
    en: profileEn,
    te: profileTe,
  },
  common: {
    en: commonEn,
    te: commonTe,
  },
}

// Helper function to get translations
export function getTranslations(section: Section, language: Language): Record<string, string> {
  return translations[section]?.[language] || translations[section]?.["en"] || {}
}

// Helper function to get a specific translation
export function getTranslation(section: Section, language: Language, key: string): string {
  const sectionTranslations = getTranslations(section, language)
  const keys = key.split(".")
  let value: any = sectionTranslations

  for (const k of keys) {
    value = value?.[k]
    if (value === undefined) break
  }

  return typeof value === "string" ? value : key
}
