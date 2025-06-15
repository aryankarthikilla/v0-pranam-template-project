"use client"

import { useState } from "react"
import { PageTitle } from "@/components/page-title"
import { useTranslations } from "@/lib/i18n/hooks"
import { TaskSettings } from "../components/task-settings"
import { Card, CardContent } from "@/components/ui/card"
import { Settings, Cog } from "lucide-react"

export default function TaskSettingsPage() {
  const { t } = useTranslations("tasks")
  const [refreshKey, setRefreshKey] = useState(0)

  const handleSettingsChange = () => {
    // Force refresh of any components that depend on task settings
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <PageTitle title={t("taskSettingsTitle")} description={t("taskSettingsDescription")} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Display Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <Settings className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t("displaySettings")}</h2>
          </div>

          <TaskSettings onSettingsChange={handleSettingsChange} />
        </div>

        {/* General Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-foreground">
            <Cog className="h-5 w-5" />
            <h2 className="text-lg font-semibold">{t("generalSettings")}</h2>
          </div>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <p className="text-muted-foreground text-center">{t("moreSettingsComingSoon")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
