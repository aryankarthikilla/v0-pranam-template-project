"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  Database,
  Layout,
  Shield,
  Settings,
  Globe,
  Palette,
  Rocket,
  Paintbrush,
  Sparkles,
} from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"
import { PageTitle } from "@/components/page-title"

export default function HomePage() {
  const { t } = useTranslations("app")

  return (
    <>
      <PageTitle section="app" titleKey="title" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo size="md" showText={false} />
              <span className="text-xl font-bold text-gray-900">Pranam</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Make language switcher more prominent */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-orange-50 rounded-lg border border-orange-200">
                <Globe className="h-4 w-4 text-orange-600" />
                <LanguageSwitcher />
              </div>
              <Link href="/theme-showcase">
                <Button variant="ghost">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("themeShowcase")}
                </Button>
              </Link>
              <Link href="/theme-builder">
                <Button variant="ghost">
                  <Paintbrush className="mr-2 h-4 w-4" />
                  {t("themeBuilder")}
                </Button>
              </Link>
              <Link href="/setup">
                <Button variant="ghost">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("setup")}
                </Button>
              </Link>
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
              <Link href="/theme-showcase">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("themeShowcase")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/theme-builder">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Paintbrush className="mr-2 h-4 w-4" />
                  {t("themeBuilder")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/setup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t("setupGuide")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-orange-200 hover:bg-orange-50">
                  {t("getStarted")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Language Notice Section */}
        <section className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-lg p-6 border border-orange-200">
              <div className="flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-orange-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">{t("multiLanguage")}</h3>
              </div>
              <p className="text-gray-700 mb-4">{t("multiLanguageDescription")}</p>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-orange-200">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-sm font-medium">English</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white rounded-lg border border-orange-200">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-sm font-medium">తెలుగు (Telugu)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t("featuresTitle")}</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">{t("featuresSubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            <Card className="border-orange-100 hover:border-orange-200 transition-colors">
              <CardHeader>
                <Globe className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>{t("multiLanguage")}</CardTitle>
                <CardDescription>{t("multiLanguageDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-orange-100 hover:border-orange-200 transition-colors">
              <CardHeader>
                <Palette className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>{t("themeCustomization")}</CardTitle>
                <CardDescription>{t("themeCustomizationDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-orange-100 hover:border-orange-200 transition-colors">
              <CardHeader>
                <Rocket className="h-10 w-10 text-orange-600 mb-2" />
                <CardTitle>{t("readyToDeploy")}</CardTitle>
                <CardDescription>{t("readyToDeployDescription")}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center space-x-2 mb-4">
                  <Logo size="sm" showText={false} />
                  <span className="font-semibold text-gray-900">Pranam</span>
                </div>
                <p className="text-gray-600 text-sm text-center md:text-left">{t("footerText")}</p>
              </div>

              {/* Language Section */}
              <div className="flex flex-col items-center">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  {t("availableLanguages")}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-lg">🇺🇸</span>
                    <span>English</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <span className="text-lg">🇮🇳</span>
                    <span>తెలుగు (Telugu)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">{t("moreLanguagesComing")}</p>
              </div>

              {/* Quick Links */}
              <div className="flex flex-col items-center md:items-end">
                <h4 className="font-semibold text-gray-900 mb-4">{t("quickStart")}</h4>
                <div className="space-y-2 text-center md:text-right">
                  <div>
                    <Link href="/setup" className="text-sm text-gray-600 hover:text-gray-900">
                      {t("setupGuide")}
                    </Link>
                  </div>
                  <div>
                    <Link href="/theme-showcase" className="text-sm text-gray-600 hover:text-gray-900">
                      {t("themeShowcase")}
                    </Link>
                  </div>
                  <div>
                    <Link href="/theme-builder" className="text-sm text-gray-600 hover:text-gray-900">
                      {t("themeBuilder")}
                    </Link>
                  </div>
                  <div>
                    <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
                      {t("login")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t mt-8 pt-6 flex flex-col md:flex-row items-center justify-between">
              <p className="text-gray-600 text-sm mb-4 md:mb-0">© 2024 Pranam. All rights reserved.</p>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">{t("languageSwitch")}:</span>
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
