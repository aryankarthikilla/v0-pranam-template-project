"use client"

import { useEffect } from "react"
import { useI18n } from "@/lib/i18n/context"

export function DynamicMetadata() {
  const { language } = useI18n()

  useEffect(() => {
    // Update document title based on language
    const titles = {
      en: "Pranam - Core Life System",
      te: "ప్రణామ్ - కోర్ లైఫ్ సిస్టమ్",
    }

    const descriptions = {
      en: "The core life system of apps - Next.js + Supabase starter template",
      te: "యాప్‌ల కోర్ లైఫ్ సిస్టమ్ - Next.js + Supabase స్టార్టర్ టెంప్లేట్",
    }

    // Update title
    document.title = titles[language] || titles.en

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute("content", descriptions[language] || descriptions.en)
    }

    // Update html lang attribute
    document.documentElement.lang = language
  }, [language])

  return null
}
