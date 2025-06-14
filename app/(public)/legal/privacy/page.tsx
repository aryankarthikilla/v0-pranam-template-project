"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"
import { PageTitle } from "@/components/page-title"

export default function PrivacyPage() {
  const { t } = useTranslations("legal")

  return (
    <>
      <PageTitle section="legal" titleKey="privacyTitle" />
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

          <Card className="border-border/50 bg-card/95 backdrop-blur-sm shadow-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                <Logo size="lg" showText={true} />
              </div>
              <CardTitle className="text-3xl text-card-foreground">{t("privacyTitle")}</CardTitle>
              <p className="text-muted-foreground">{t("lastUpdated")}: December 2024</p>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-6 text-foreground">
                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("informationCollection")}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">{t("informationCollectionText")}</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{t("personalInfo1")}</li>
                    <li>{t("personalInfo2")}</li>
                    <li>{t("personalInfo3")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("informationUse")}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">{t("informationUseText")}</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{t("useCase1")}</li>
                    <li>{t("useCase2")}</li>
                    <li>{t("useCase3")}</li>
                    <li>{t("useCase4")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("informationSharing")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("informationSharingText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("dataSecurity")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("dataSecurityText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("cookies")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("cookiesText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("thirdPartyServices")}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">{t("thirdPartyServicesText")}</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{t("thirdParty1")}</li>
                    <li>{t("thirdParty2")}</li>
                    <li>{t("thirdParty3")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("userRights")}</h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">{t("userRightsText")}</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>{t("right1")}</li>
                    <li>{t("right2")}</li>
                    <li>{t("right3")}</li>
                    <li>{t("right4")}</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("policyChanges")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("policyChangesText")}</p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">{t("contactUs")}</h2>
                  <p className="text-muted-foreground leading-relaxed">{t("privacyContactText")}</p>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
