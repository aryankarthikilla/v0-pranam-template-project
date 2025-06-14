"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { createClient } from "@/utils/supabase/client"
import { Eye, EyeOff, ArrowLeft, Mail } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"
import { PageTitle } from "@/components/page-title"
import { GoogleIcon } from "@/components/icons/google-icon"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const { t } = useTranslations("auth")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard")
    }
    setLoading(false)
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError("")

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })

    if (error) {
      setError(error.message)
      setGoogleLoading(false)
    }
  }

  return (
    <>
      <PageTitle section="auth" titleKey="signInTitle" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Header with Navigation and Controls */}
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
            <CardHeader className="text-center pb-8">
              <div className="mx-auto mb-6">
                <Logo size="lg" showText={false} />
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">{t("signInTitle")}</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">{t("signInSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                variant="outline"
                className="w-full h-12 border-border bg-background hover:bg-accent hover:text-accent-foreground font-medium"
              >
                <GoogleIcon className="mr-3 h-5 w-5" />
                {googleLoading ? t("signingInWithGoogle") : t("continueWithGoogle")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-medium">{t("orContinueWith")}</span>
                </div>
              </div>

              {/* Email Sign In Form */}
              <form onSubmit={handleSignIn} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground font-medium">
                    {t("email")}
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={t("enterEmail")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-10 h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground font-medium">
                    {t("password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("enterPassword")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                  >
                    {t("forgotPassword")}
                  </Link>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertDescription className="text-destructive">{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? t("signingIn") : t("signIn")}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                {t("dontHaveAccount")}{" "}
                <Link href="/auth/signup" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  {t("signUp")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
