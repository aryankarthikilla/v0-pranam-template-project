import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "प्रणाम (Pranam) - Core Life System",
  description: "The core life system of apps - Next.js + Supabase starter template",
}

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
