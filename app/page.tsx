"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Database, Layout, Shield } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"

export default function HomePage() {
  const { t, loading } = useTranslations("app")

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <div className="text-center">
          <Logo size="lg" showText={false} />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Logo size="md" showText={false} />
            <span className="text-xl font-bold text-gray-900">Pranam</span>
          </div>
          <div className="flex items-center space-x-4">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost">{t("login")}</Button>
            </Link>
            <Link href="/login">
              <Button>{t("getStarted")}</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">{t("title")}</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">{t("subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {t("getStarted")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto border-orange-200 hover:bg-orange-50">
              {t("viewDemo")}
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("featuresTitle")}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{t("featuresSubtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader>
              <Shield className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>{t("authReady")}</CardTitle>
              <CardDescription>{t("authDescription")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader>
              <Layout className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>{t("responsiveDesign")}</CardTitle>
              <CardDescription>{t("responsiveDescription")}</CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-orange-100 hover:border-orange-200 transition-colors">
            <CardHeader>
              <Database className="h-10 w-10 text-orange-600 mb-2" />
              <CardTitle>{t("databaseIntegration")}</CardTitle>
              <CardDescription>{t("databaseDescription")}</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Logo size="sm" showText={false} />
              <span className="font-semibold text-gray-900">Pranam</span>
            </div>
            <p className="text-gray-600 text-sm">{t("footerText")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
