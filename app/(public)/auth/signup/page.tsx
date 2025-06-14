"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { createClient } from "@/utils/supabase/client"
import { Eye, EyeOff, ArrowLeft, Mail, User } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"
import { PageTitle } from "@/components/page-title"
import { GoogleIcon } from "@/components/icons/google-icon"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const supabase = createClient()
  const { t } = useTranslations("auth")

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    if (password !== confirmPassword) {
      setError(t("passwordsDoNotMatch"))
      setLoading(false)
      return
    }

    if (!acceptTerms) {
      setError(t("mustAcceptTerms"))
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(t("checkEmailToConfirm"))
    }
    setLoading(false)
  }

  const handleGoogleSignUp = async () => {
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
      <PageTitle section="auth" titleKey="signUpTitle" />
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
              <CardTitle className="text-2xl font-bold text-card-foreground">{t("signUpTitle")}</CardTitle>
              <CardDescription className="text-muted-foreground mt-2">{t("signUpSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Google Sign Up */}
              <Button
                onClick={handleGoogleSignUp}
                disabled={googleLoading}
                variant="outline"
                className="w-full h-12 border-border bg-background hover:bg-accent hover:text-accent-foreground font-medium"
              >
                <GoogleIcon className="mr-3 h-5 w-5" />
                {googleLoading ? t("signingUpWithGoogle") : t("continueWithGoogle")}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="w-full" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-4 text-muted-foreground font-medium">{t("orContinueWith")}</span>
                </div>
              </div>

              {/* Email Sign Up Form */}
              <form onSubmit={handleSignUp} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-foreground font-medium">
                    {t("fullName")}
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={t("enterFullName")}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="pl-10 h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
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
                      placeholder={t("createPassword")}
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
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                    {t("confirmPassword")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirmPassword")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-12 border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:border-transparent pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed">
                    {t("iAgreeToThe")}{" "}
                    <Link
                      href="/legal/terms"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {t("termsOfService")}
                    </Link>{" "}
                    {t("and")}{" "}
                    <Link
                      href="/legal/privacy"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      {t("privacyPolicy")}
                    </Link>
                  </Label>
                </div>

                {error && (
                  <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                    <AlertDescription className="text-destructive">{error}</AlertDescription>
                  </Alert>
                )}

                {message && (
                  <Alert className="border-primary/50 bg-primary/10">
                    <AlertDescription className="text-primary">{message}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? t("creatingAccount") : t("createAccount")}
                </Button>
              </form>

              <div className="text-center text-sm text-muted-foreground">
                {t("alreadyHaveAccount")}{" "}
                <Link href="/auth/login" className="text-primary hover:text-primary/80 transition-colors font-medium">
                  {t("signIn")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
