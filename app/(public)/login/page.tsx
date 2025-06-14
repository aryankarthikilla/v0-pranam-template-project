"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClient } from "@/utils/supabase/client"
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"
import { PageTitle } from "@/components/page-title"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setMessage("")

    const { error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage(t("checkEmail"))
    }
    setLoading(false)
  }

  return (
    <>
      <PageTitle section="auth" titleKey="welcomeTitle" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 flex items-center justify-center p-4 transition-colors duration-300">
        <div className="w-full max-w-md">
          {/* Header with Navigation and Controls */}
          <div className="flex justify-between items-center mb-6">
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
                <Logo size="lg" showText={false} />
              </div>
              <CardTitle className="text-2xl text-card-foreground">{t("welcomeTitle")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("welcomeSubtitle")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                  <TabsTrigger
                    value="signin"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {t("signIn")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    {t("signUp")}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground">
                        {t("email")}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("enterEmail")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-foreground">
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
                          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {error && (
                      <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
                        <AlertDescription className="text-destructive">{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? t("signingIn") : t("signIn")}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-foreground">
                        {t("email")}
                      </Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder={t("enterEmail")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-foreground">
                        {t("password")}
                      </Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder={t("createPassword")}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground hover:text-foreground"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
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
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                      disabled={loading}
                    >
                      {loading ? t("creatingAccount") : t("signUp")}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
