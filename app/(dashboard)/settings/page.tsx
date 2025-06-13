"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Save, Bell, Shield, Globe, Palette } from "lucide-react"
import { useTranslations } from "@/lib/i18n/hooks"

export default function SettingsPage() {
  const { t } = useTranslations("settings")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="grid gap-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t("generalSettings")}
            </CardTitle>
            <CardDescription>{t("generalDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="app-name">{t("appName")}</Label>
                <Input id="app-name" defaultValue="Pranam" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="app-url">{t("appUrl")}</Label>
                <Input id="app-url" defaultValue="https://pranam.app" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t("description")}</Label>
              <Input id="description" defaultValue="The core life system of apps" />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t("appearance")}
            </CardTitle>
            <CardDescription>{t("appearanceDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("theme")}</Label>
                <p className="text-sm text-muted-foreground">{t("themeDescription")}</p>
              </div>
              <ThemeSwitcher />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("language")}</Label>
                <p className="text-sm text-muted-foreground">{t("languageDescription")}</p>
              </div>
              <LanguageSwitcher />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              {t("notifications")}
            </CardTitle>
            <CardDescription>{t("notificationsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("emailNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("emailNotificationsDescription")}</p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("pushNotifications")}</Label>
                <p className="text-sm text-muted-foreground">{t("pushNotificationsDescription")}</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("marketingEmails")}</Label>
                <p className="text-sm text-muted-foreground">{t("marketingEmailsDescription")}</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              {t("security")}
            </CardTitle>
            <CardDescription>{t("securityDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("twoFactorAuth")}</Label>
                <p className="text-sm text-muted-foreground">{t("twoFactorAuthDescription")}</p>
              </div>
              <Button variant="outline" size="sm">
                {t("enable")}
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>{t("sessionTimeout")}</Label>
                <p className="text-sm text-muted-foreground">{t("sessionTimeoutDescription")}</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            {t("saveChanges")}
          </Button>
        </div>
      </div>
    </div>
  )
}
