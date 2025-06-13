"use client"

import { useEffect } from "react"
import { useTranslations } from "@/lib/i18n/hooks"

interface PageTitleProps {
  section: "app" | "auth" | "setup" | "dashboard" | "analytics" | "users" | "profile" | "settings"
  titleKey?: string
  fallbackTitle?: string
}

export function PageTitle({ section, titleKey = "title", fallbackTitle }: PageTitleProps) {
  const { t } = useTranslations(section)

  useEffect(() => {
    const pageTitle = t(titleKey) || fallbackTitle || "Pranam"
    const baseTitle = "Pranam - Core Life System"

    if (pageTitle && pageTitle !== "Pranam") {
      document.title = `${pageTitle} | ${baseTitle}`
    } else {
      document.title = baseTitle
    }
  }, [t, titleKey, fallbackTitle])

  return null
}
