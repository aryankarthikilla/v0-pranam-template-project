"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "@/lib/i18n/hooks"
import { TaskSettings } from "../components/task-settings"
import { Settings, CheckSquare } from "lucide-react"

export default function TaskSettingsPage() {
  const { t } = useTranslations("tasks")

  return (
    <div className="flex-1 space-y-6 p-6 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("taskSettingsTitle")}</h1>
          <p className="text-muted-foreground">{t("taskSettingsDescription")}</p>
        </div>
      </div>

      {/* Settings Cards */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Display Settings */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <CheckSquare className="h-5 w-5" />
              {t("displaySettings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TaskSettings onSettingsChange={() => {}} />
          </CardContent>
        </Card>

        {/* Future Settings Placeholder */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Settings className="h-5 w-5" />
              {t("generalSettings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t("moreSettingsComingSoon")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
