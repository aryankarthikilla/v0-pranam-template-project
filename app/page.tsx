"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Database, Layout, Shield } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "@/lib/i18n/hooks"

const homeTranslations = {
  title: {
    en: "Build Faster with Pranam",
    te: "ప్రణామ్‌తో వేగంగా నిర్మించండి",
  },
  subtitle: {
    en: "A modern Next.js starter template with Supabase authentication, responsive design, and everything you need to ship quickly.",
    te: "సుపాబేస్ ప్రమాణీకరణ, రెస్పాన్సివ్ డిజైన్ మరియు త్వరగా షిప్ చేయడానికి అవసరమైన ప్రతిదానితో కూడిన ఆధునిక Next.js స్టార్టర్ టెంప్లేట్.",
  },
  getStarted: {
    en: "Get Started",
    te: "ప్రారంభించండి",
  },
  viewDemo: {
    en: "View Demo",
    te: "డెమో చూడండి",
  },
  featuresTitle: {
    en: "Everything You Need",
    te: "మీకు అవసరమైనవన్నీ",
  },
  featuresSubtitle: {
    en: "Built with modern technologies and best practices for rapid development.",
    te: "వేగవంతమైన అభివృద్ధి కోసం ఆధునిక సాంకేతికతలు మరియు ఉత్తమ పద్ధతులతో నిర్మించబడింది.",
  },
  authReady: {
    en: "Authentication Ready",
    te: "ప్రమాణీకరణ సిద్ధం",
  },
  authDescription: {
    en: "Complete auth flow with Supabase including login, signup, and protected routes.",
    te: "లాగిన్, సైన్అప్ మరియు రక్షిత మార్గాలతో సహా సుపాబేస్‌తో పూర్తి auth ప్రవాహం.",
  },
  responsiveDesign: {
    en: "Responsive Design",
    te: "రెస్పాన్సివ్ డిజైన్",
  },
  responsiveDescription: {
    en: "Mobile-first design with beautiful components using shadcn/ui and Tailwind CSS.",
    te: "shadcn/ui మరియు Tailwind CSS ఉపయోగించి అందమైన కాంపోనెంట్‌లతో మొబైల్-ఫస్ట్ డిజైన్.",
  },
  databaseIntegration: {
    en: "Database Integration",
    te: "డేటాబేస్ ఇంటిగ్రేషన్",
  },
  databaseDescription: {
    en: "Supabase integration with user management and real-time capabilities.",
    te: "వినియోగదారు నిర్వహణ మరియు రియల్-టైమ్ సామర్థ్యాలతో సుపాబేస్ ఇంటిగ్రేషన్.",
  },
  footerText: {
    en: "Built with Next.js, Supabase, and Tailwind CSS",
    te: "Next.js, Supabase మరియు Tailwind CSS తో నిర్మించబడింది",
  },
  login: {
    en: "Login",
    te: "లాగిన్",
  },
}

export default function HomePage() {
  const { t } = useTranslations(homeTranslations)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">प्र</span>
            </div>
            <span className="text-xl font-bold text-gray-900">प्रणाम (Pranam)</span>
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
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">प्र</span>
              </div>
              <span className="font-semibold text-gray-900">प्रणाम (Pranam)</span>
            </div>
            <p className="text-gray-600 text-sm">{t("footerText")}</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
