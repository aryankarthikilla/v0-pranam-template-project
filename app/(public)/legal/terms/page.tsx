"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"
import { PageTitle } from "@/components/page-title"

export default function TermsPage() {
  const { t } = useTranslations("legal")

  return (
    <>
      <PageTitle section="legal" titleKey="termsTitle" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 transition-colors duration-300">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
          </div>

          <Card className="border-0 bg-card/80 backdrop-blur-xl shadow-2xl shadow-primary/10">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Logo size="lg" showText={true} />
              </div>
              <CardTitle className="text-3xl text-card-foreground">{t("termsTitle")}</CardTitle>
              <p className="text-muted-foreground">{t("lastUpdated")}: December 2024</p>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-6 text-foreground">
                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("acceptance")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("acceptanceText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("serviceDescription")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("serviceDescriptionText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("userAccounts")}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">{t("userAccountsText")}</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{t("accountResponsibility1")}</li>
                    <li>{t("accountResponsibility2")}</li>
                    <li>{t("accountResponsibility3")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("prohibitedUse")}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">{t("prohibitedUseText")}</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{t("prohibited1")}</li>
                    <li>{t("prohibited2")}</li>
                    <li>{t("prohibited3")}</li>
                    <li>{t("prohibited4")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("intellectualProperty")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("intellectualPropertyText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("termination")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("terminationText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("disclaimer")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("disclaimerText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3 text-foreground">{t("contactUs")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("contactText")}</p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
