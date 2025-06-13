"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, CreditCard, DollarSign, Users } from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"

const dashboardTranslations = {
  title: {
    en: "Dashboard",
    te: "డ్యాష్‌బోర్డ్",
  },
  welcome: {
    en: "Welcome to your Pranam dashboard",
    te: "మీ ప్రణామ్ డ్యాష్‌బోర్డ్‌కు స్వాగతం",
  },
  totalRevenue: {
    en: "Total Revenue",
    te: "మొత్తం ఆదాయం",
  },
  subscriptions: {
    en: "Subscriptions",
    te: "సబ్‌స్క్రిప్షన్‌లు",
  },
  sales: {
    en: "Sales",
    te: "అమ్మకాలు",
  },
  activeNow: {
    en: "Active Now",
    te: "ఇప్పుడు చురుకుగా",
  },
  lastMonth: {
    en: "from last month",
    te: "గత నెల నుండి",
  },
  lastHour: {
    en: "since last hour",
    te: "గత గంట నుండి",
  },
  overview: {
    en: "Overview",
    te: "అవలోకనం",
  },
  recentActivity: {
    en: "Recent Activity",
    te: "ఇటీవలి కార్యకలాపాలు",
  },
  newNotifications: {
    en: "You have 3 new notifications today.",
    te: "ఈరోజు మీకు 3 కొత్త నోటిఫికేషన్‌లు ఉన్నాయి.",
  },
  chartPlaceholder: {
    en: "Chart placeholder - Add your preferred charting library",
    te: "చార్ట్ ప్లేస్‌హోల్డర్ - మీ ఇష్టమైన చార్టింగ్ లైబ్రరీని జోడించండి",
  },
  newUserRegistered: {
    en: "New user registered",
    te: "కొత్త వినియోగదారు నమోదయ్యారు",
  },
  paymentReceived: {
    en: "Payment received",
    te: "చెల్లింపు అందింది",
  },
  serverMaintenance: {
    en: "Server maintenance scheduled",
    te: "సర్వర్ నిర్వహణ షెడ్యూల్ చేయబడింది",
  },
  minutesAgo: {
    en: "minutes ago",
    te: "నిమిషాల క్రితం",
  },
  hourAgo: {
    en: "hour ago",
    te: "గంట క్రితం",
  },
  hoursAgo: {
    en: "hours ago",
    te: "గంటల క్రితం",
  },
}

export default function DashboardPage() {
  const { t } = useTranslations(dashboardTranslations)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("welcome")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% {t("lastMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("subscriptions")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">+180.1% {t("lastMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("sales")}</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">+19% {t("lastMonth")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeNow")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">+201 {t("lastHour")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>{t("overview")}</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              {t("chartPlaceholder")}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
            <CardDescription>{t("newNotifications")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{t("newUserRegistered")}</p>
                  <p className="text-xs text-muted-foreground">2 {t("minutesAgo")}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{t("paymentReceived")}</p>
                  <p className="text-xs text-muted-foreground">1 {t("hourAgo")}</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">{t("serverMaintenance")}</p>
                  <p className="text-xs text-muted-foreground">3 {t("hoursAgo")}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
