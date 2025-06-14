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
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"
import { PageTitle } from "@/components/page-title"

export default function HomePage() {
  const { t } = useTranslations("app")

  return (
    <>
      <PageTitle section="app" titleKey="title" />
      <div className="min-h-screen hero-gradient">
        {/* Header */}
        <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo size="md" showText={false} />
              <span className="text-xl font-bold text-foreground">Pranam</span>
            </div>
            <div className="flex items-center space-x-4">
              {/* Language and Theme Switchers */}
              <div className="flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-lg border border-border/50 backdrop-blur-sm">
                <Globe className="h-4 w-4 text-primary" />
                <LanguageSwitcher />
                <div className="h-4 w-px bg-border" />
                <ThemeSwitcher />
              </div>
              <Link href="/theme-showcase">
                <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("themeShowcase")}
                </Button>
              </Link>
              <Link href="/theme-builder">
                <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                  <Paintbrush className="mr-2 h-4 w-4" />
                  {t("themeBuilder")}
                </Button>
              </Link>
              <Link href="/setup">
                <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("setup")}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="ghost" className="hover:bg-primary/10 hover:text-primary">
                  {t("login")}
                </Button>
              </Link>
              <Link href="/login">
                <Button className="btn-primary-gradient hover-lift-primary">{t("getStarted")}</Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-gradient-primary mb-6 animate-fade-in">{t("title")}</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">{t("subtitle")}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link href="/theme-showcase">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground hover-lift-primary glow-primary"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t("themeShowcase")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/theme-builder">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 text-secondary-foreground hover-lift-primary"
                >
                  <Paintbrush className="mr-2 h-4 w-4" />
                  {t("themeBuilder")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/setup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 text-accent-foreground hover-lift-primary"
                >
                  <Settings className="mr-2 h-4 w-4" />
                  {t("setupGuide")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary/20 hover:bg-primary/5 hover:border-primary/40 hover-lift-primary"
                >
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
            <div className="card-gradient rounded-lg p-6 border-gradient-primary hover-lift-primary">
              <div className="flex items-center justify-center mb-3">
                <Globe className="h-6 w-6 text-primary mr-2" />
                <h3 className="text-lg font-semibold text-foreground">{t("multiLanguage")}</h3>
              </div>
              <p className="text-muted-foreground mb-4">{t("multiLanguageDescription")}</p>
              <div className="flex items-center justify-center space-x-4">
                <div className="flex items-center space-x-2 px-4 py-2 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm hover-lift-primary">
                  <span className="text-lg">🇺🇸</span>
                  <span className="text-sm font-medium text-foreground">English</span>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-card/50 rounded-lg border border-border/50 backdrop-blur-sm hover-lift-primary">
                  <span className="text-lg">🇮🇳</span>
                  <span className="text-sm font-medium text-foreground">తెలుగు (Telugu)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4 animate-fade-in">{t("featuresTitle")}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto animate-fade-in">{t("featuresSubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-gradient hover:border-primary/50 transition-all duration-300 hover-lift-primary group">
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {t("authReady")}
                </CardTitle>
                <CardDescription>{t("authDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-gradient hover:border-primary/50 transition-all duration-300 hover-lift-primary group">
              <CardHeader>
                <Layout className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {t("responsiveDesign")}
                </CardTitle>
                <CardDescription>{t("responsiveDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-gradient hover:border-primary/50 transition-all duration-300 hover-lift-primary group">
              <CardHeader>
                <Database className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {t("databaseIntegration")}
                </CardTitle>
                <CardDescription>{t("databaseDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-gradient hover:border-primary/50 transition-all duration-300 hover-lift-primary group">
              <CardHeader>
                <Globe className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {t("multiLanguage")}
                </CardTitle>
                <CardDescription>{t("multiLanguageDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-gradient hover:border-primary/50 transition-all duration-300 hover-lift-primary group">
              <CardHeader>
                <Palette className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {t("themeCustomization")}
                </CardTitle>
                <CardDescription>{t("themeCustomizationDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-gradient hover:border-primary/50 transition-all duration-300 hover-lift-primary group">
              <CardHeader>
                <Rocket className="h-10 w-10 text-primary mb-2 group-hover:scale-110 transition-transform duration-300" />
                <CardTitle className="text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {t("readyToDeploy")}
                </CardTitle>
                <CardDescription>{t("readyToDeployDescription")}</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-card/30 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Brand Section */}
              <div className="flex flex-col items-center md:items-start">
                <div className="flex items-center space-x-2 mb-4">
                  <Logo size="sm" showText={false} />
                  <span className="font-semibold text-foreground">Pranam</span>
                </div>
                <p className="text-muted-foreground text-sm text-center md:text-left">{t("footerText")}</p>
              </div>

              {/* Language Section */}
              <div className="flex flex-col items-center">
                <h4 className="font-semibold text-foreground mb-4 flex items-center">
                  <Globe className="h-4 w-4 mr-2 text-primary" />
                  {t("availableLanguages")}
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <span className="text-lg">🇺🇸</span>
                    <span>English</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <span className="text-lg">🇮🇳</span>
                    <span>తెలుగు (Telugu)</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">{t("moreLanguagesComing")}</p>
              </div>

              {/* Quick Links */}
              <div className="flex flex-col items-center md:items-end">
                <h4 className="font-semibold text-foreground mb-4">{t("quickStart")}</h4>
                <div className="space-y-2 text-center md:text-right">
                  <div>
                    <Link
                      href="/setup"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {t("setupGuide")}
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/theme-showcase"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {t("themeShowcase")}
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/theme-builder"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {t("themeBuilder")}
                    </Link>
                  </div>
                  <div>
                    <Link
                      href="/login"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      {t("login")}
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border/50 mt-8 pt-6 flex flex-col md:flex-row items-center justify-between">
              <p className="text-muted-foreground text-sm mb-4 md:mb-0">© 2024 Pranam. All rights reserved.</p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">{t("languageSwitch")}:</span>
                <LanguageSwitcher />
                <div className="h-4 w-px bg-border" />
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
