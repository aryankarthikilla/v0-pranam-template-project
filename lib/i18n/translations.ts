// Import all translations from their respective page folders
import appEn from "@/app/(public)/i18n/en.json"
import appTe from "@/app/(public)/i18n/te.json"
import authEn from "@/app/(public)/auth/i18n/en.json"
import authTe from "@/app/(public)/auth/i18n/te.json"
import setupEn from "@/app/(public)/setup/i18n/en.json"
import setupTe from "@/app/(public)/setup/i18n/te.json"
import dashboardEn from "@/app/(dashboard)/dashboard/i18n/en.json"
import dashboardTe from "@/app/(dashboard)/dashboard/i18n/te.json"
import analyticsEn from "@/app/(dashboard)/analytics/i18n/en.json"
import analyticsTe from "@/app/(dashboard)/analytics/i18n/te.json"
import usersEn from "@/app/(dashboard)/users/i18n/en.json"
import usersTe from "@/app/(dashboard)/users/i18n/te.json"
import profileEn from "@/app/(dashboard)/profile/i18n/en.json"
import profileTe from "@/app/(dashboard)/profile/i18n/te.json"
import settingsEn from "@/app/(dashboard)/settings/i18n/en.json"
import settingsTe from "@/app/(dashboard)/settings/i18n/te.json"
import commonEn from "@/lib/i18n/common/en.json"
import commonTe from "@/lib/i18n/common/te.json"

// Type definitions
export type Language = "en" | "te"
export type Section = "app" | "auth" | "setup" | "dashboard" | "analytics" | "users" | "profile" | "settings" | "common"

// Organized translations object
export const translations: Record<Section, Record<Language, Record<string, any>>> = {
  app: {
    en: appEn || {},
    te: appTe || {},
  },
  auth: {
    en: authEn || {},
    te: authTe || {},
  },
  setup: {
    en: setupEn || {},
    te: setupTe || {},
  },
  dashboard: {
    en: dashboardEn || {},
    te: dashboardTe || {},
  },
  analytics: {
    en: analyticsEn || {},
    te: analyticsTe || {},
  },
  users: {
    en: usersEn || {},
    te: usersTe || {},
  },
  profile: {
    en: profileEn || {},
    te: profileTe || {},
  },
  settings: {
    en: settingsEn || {},
    te: settingsTe || {},
  },
  common: {
    en: commonEn || {},
    te: commonTe || {},
  },
}

// Helper function to get translations
export function getTranslations(section: Section, language: Language): Record<string, any> {
  try {
    return translations[section]?.[language] || translations[section]?.["en"] || {}
  } catch (error) {
    console.warn(`Error getting translations for section "${section}" and language "${language}":`, error)
    return {}
  }
}

// Helper function to get a specific translation
export function getTranslation(section: Section, language: Language, key: string): string {
  try {
    const sectionTranslations = getTranslations(section, language)
    const keys = key.split(".")
    let value: any = sectionTranslations

    for (const k of keys) {
      value = value?.[k]
      if (value === undefined) break
    }

    return typeof value === "string" ? value : key
  } catch (error) {
    console.warn(`Error getting translation for key "${key}":`, error)
    return key
  }
}
