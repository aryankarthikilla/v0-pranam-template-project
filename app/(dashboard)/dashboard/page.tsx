"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Users, TrendingUp, DollarSign, Activity, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"
import { PageTitle } from "@/components/page-title"

export default function DashboardPage() {
  const { t } = useTranslations("dashboard")

  const stats = [
    {
      title: t("totalUsers"),
      value: "2,350",
      change: "+20.1%",
      trend: "up",
      icon: Users,
    },
    {
      title: t("revenue"),
      value: "$45,231.89",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: t("activeUsers"),
      value: "1,234",
      change: "-2.3%",
      trend: "down",
      icon: Activity,
    },
    {
      title: t("growth"),
      value: "+573",
      change: "+8.2%",
      trend: "up",
      icon: TrendingUp,
    },
  ]

  return (
    <>
      <PageTitle section="dashboard" titleKey="title" />
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("welcome")}</h1>
            <p className="text-muted-foreground">{t("welcomeMessage")}</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">{t("viewReports")}</Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="border-border bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">{stat.value}</div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDownRight className="mr-1 h-3 w-3 text-red-500" />
                    )}
                    <span className={stat.trend === "up" ? "text-green-500" : "text-red-500"}>{stat.change}</span>
                    <span className="ml-1">{t("fromLastMonth")}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t("overview")}</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="space-y-4">
                {[
                  { name: t("january"), value: 400 },
                  { name: t("february"), value: 300 },
                  { name: t("march"), value: 500 },
                  { name: t("april"), value: 280 },
                  { name: t("may"), value: 590 },
                  { name: t("june"), value: 320 },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-16 text-sm text-muted-foreground">{item.name}</div>
                    <Progress value={(item.value / 600) * 100} className="flex-1" />
                    <div className="w-12 text-sm text-card-foreground">{item.value}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-3 border-border bg-card">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t("recentSales")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("recentSalesDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Olivia Martin", email: "olivia.martin@email.com", amount: "+$1,999.00" },
                  { name: "Jackson Lee", email: "jackson.lee@email.com", amount: "+$39.00" },
                  { name: "Isabella Nguyen", email: "isabella.nguyen@email.com", amount: "+$299.00" },
                  { name: "William Kim", email: "will@email.com", amount: "+$99.00" },
                  { name: "Sofia Davis", email: "sofia.davis@email.com", amount: "+$39.00" },
                ].map((sale, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-primary">
                        {sale.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium text-card-foreground">{sale.name}</p>
                      <p className="text-xs text-muted-foreground">{sale.email}</p>
                    </div>
                    <div className="text-sm font-medium text-card-foreground">{sale.amount}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
