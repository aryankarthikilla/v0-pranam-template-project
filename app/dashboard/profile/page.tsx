"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { User, Mail, Save, ArrowLeft, Palette } from "lucide-react"
import Link from "next/link"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useTranslations } from "@/lib/i18n/hooks"

const profileTranslations = {
  title: {
    en: "Profile Settings",
    te: "ప్రొఫైల్ సెట్టింగ్‌లు",
  },
  subtitle: {
    en: "Manage your account information",
    te: "మీ ఖాతా సమాచారాన్ని నిర్వహించండి",
  },
  backToDashboard: {
    en: "Back to Dashboard",
    te: "డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్ళండి",
  },
  personalInformation: {
    en: "Personal Information",
    te: "వ్యక్తిగత సమాచారం",
  },
  personalInfoDescription: {
    en: "Update your personal details and preferences.",
    te: "మీ వ్యక్తిగత వివరాలు మరియు ప్రాధాన్యతలను అప్‌డేట్ చేయండి.",
  },
  emailAddress: {
    en: "Email Address",
    te: "ఇమెయిల్ చిరునామా",
  },
  emailCannotChange: {
    en: "Email cannot be changed from this page.",
    te: "ఈ పేజీ నుండి ఇమెయిల్ మార్చలేరు.",
  },
  fullName: {
    en: "Full Name",
    te: "పూర్తి పేరు",
  },
  enterFullName: {
    en: "Enter your full name",
    te: "మీ పూర్తి పేరును నమోదు చేయండి",
  },
  updating: {
    en: "Updating...",
    te: "అప్‌డేట్ అవుతోంది...",
  },
  updateProfile: {
    en: "Update Profile",
    te: "ప్రొఫైల్ అప్‌డేట్ చేయండి",
  },
  profileUpdated: {
    en: "Profile updated successfully!",
    te: "ప్రొఫైల్ విజయవంతంగా అప్‌డేట్ చేయబడింది!",
  },
  unexpectedError: {
    en: "An unexpected error occurred",
    te: "ఊహించని లోపం సంభవించింది",
  },
  themeSettings: {
    en: "Theme Settings",
    te: "థీమ్ సెట్టింగ్‌లు",
  },
  themeDescription: {
    en: "Choose your preferred theme.",
    te: "మీ ఇష్టమైన థీమ్‌ను ఎంచుకోండి.",
  },
  colorTheme: {
    en: "Color Theme",
    te: "రంగు థీమ్",
  },
  chooseColors: {
    en: "Choose colors for your interface",
    te: "మీ ఇంటర్‌ఫేస్ కోసం రంగులను ఎంచుకోండి",
  },
  accountInformation: {
    en: "Account Information",
    te: "ఖాతా సమాచారం",
  },
  accountDetails: {
    en: "Your account details and status.",
    te: "మీ ఖాతా వివరాలు మరియు స్థితి.",
  },
  accountStatus: {
    en: "Account Status",
    te: "ఖాతా స్థితి",
  },
  active: {
    en: "Active",
    te: "చురుకుగా",
  },
  plan: {
    en: "Plan",
    te: "ప్లాన్",
  },
  free: {
    en: "Free",
    te: "ఉచితం",
  },
  memberSince: {
    en: "Member Since",
    te: "సభ్యుడైన తేదీ",
  },
}

export default function ProfilePage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslations(profileTranslations)

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        setEmail(user.email || "")
        setFullName(user.user_metadata?.full_name || "")
      }
    }

    getProfile()
  }, [supabase])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setMessage(t("profileUpdated"))
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (err) {
      setError(t("unexpectedError"))
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("backToDashboard")}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
            <p className="text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>
        <LanguageSwitcher />
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t("personalInformation")}
            </CardTitle>
            <CardDescription>{t("personalInfoDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("emailAddress")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 bg-muted"
                    placeholder="Your email address"
                  />
                </div>
                <p className="text-xs text-muted-foreground">{t("emailCannotChange")}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">{t("fullName")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    placeholder={t("enterFullName")}
                  />
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                <Save className="h-4 w-4 mr-2" />
                {loading ? t("updating") : t("updateProfile")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {t("themeSettings")}
            </CardTitle>
            <CardDescription>{t("themeDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t("colorTheme")}</p>
                <p className="text-xs text-muted-foreground">{t("chooseColors")}</p>
              </div>
              <ThemeSwitcher />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{t("accountInformation")}</CardTitle>
            <CardDescription>{t("accountDetails")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">{t("accountStatus")}</span>
                <span className="text-sm text-green-600 font-medium">{t("active")}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">{t("plan")}</span>
                <span className="text-sm text-muted-foreground">{t("free")}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">{t("memberSince")}</span>
                <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
