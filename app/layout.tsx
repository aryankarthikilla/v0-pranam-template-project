import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/contexts/theme-context"
import { I18nProvider } from "@/lib/i18n/context"
import { FaviconGenerator } from "@/components/favicon-generator"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "प्रणाम (Pranam) - Core Life System",
  description: "The core life system of apps - Next.js + Supabase starter template",
  icons: {
    icon: "/images/pranam-logo.png",
    apple: "/images/pranam-logo.png",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <FaviconGenerator />
        <I18nProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
