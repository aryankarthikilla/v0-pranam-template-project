"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, DollarSign } from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"

const analyticsTranslations = {
  title: {
    en: "Analytics",
    te: "విశ్లేషణలు",
  },
  subtitle: {
    en: "Track your application performance and user engagement",
    te: "మీ అప్లికేషన్ పనితీరు మరియు వినియోగదారు నిమగ్నతను ట్రాక్ చేయండి",
  },
  pageViews: {
    en: "Page Views",
    te: "పేజీ వీక్షణలు",
  },
  uniqueVisitors: {
    en: "Unique Visitors",
    te: "ప్రత్యేక సందర్శకులు",
  },
  conversionRate: {
    en: "Conversion Rate",
    te: "మార్పిడి రేటు",
  },
  revenue: {
    en: "Revenue",
    te: "ఆదాయం",
  },
  lastMonth: {
    en: "from last month",
    te: "గత నెల నుండి",
  },
  trafficOverview: {
    en: "Traffic Overview",
    te: "ట్రాఫిక్ అవలోకనం",
  },
  trafficDescription: {
    en: "Daily page views for the last 30 days",
    te: "గత 30 రోజులకు రోజువారీ పేజీ వీక్షణలు",
  },
  userEngagement: {
    en: "User Engagement",
    te: "వినియోగదారు నిమగ్నత",
  },
  engagementDescription: {
    en: "Session duration and bounce rate",
    te: "సెషన్ వ్యవధి మరియు బౌన్స్ రేటు",
  },
  chartPlaceholder: {
    en: "Chart placeholder - Add your preferred charting library",
    te: "చార్ట్ ప్లేస్‌హోల్డర్ - మీ ఇష్టమైన చార్టింగ్ లైబ్రరీని జోడించండి",
  },
}

export default function AnalyticsPage() {
  const { t } = useTranslations(analyticsTranslations)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("pageViews")}</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45,231</div>
            <p className="text-xs text-muted-foreground">+20.1% {t("lastMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("uniqueVisitors")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+180.1% {t("lastMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("conversionRate")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.5%</div>
            <p className="text-xs text-muted-foreground">+19% {t("lastMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("revenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹1,23,456</div>
            <p className="text-xs text-muted-foreground">+25% {t("lastMonth")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("trafficOverview")}</CardTitle>
            <CardDescription>{t("trafficDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {t("chartPlaceholder")}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("userEngagement")}</CardTitle>
            <CardDescription>{t("engagementDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center text-muted-foreground">
              {t("chartPlaceholder")}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
