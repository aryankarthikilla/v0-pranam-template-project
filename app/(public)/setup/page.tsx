"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Copy,
  Check,
  Database,
  Key,
  AlertTriangle,
  ExternalLink,
  Play,
  Download,
  Settings,
  TestTube,
} from "lucide-react"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useTranslations } from "@/lib/i18n/hooks"
import { Logo } from "@/components/logo"
import { PageTitle } from "@/components/page-title"

const envExample = `# Update these with your Supabase project details
# You can find these in your Supabase project settings under API
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`

export default function SetupPage() {
  const [copied, setCopied] = useState(false)
  const { t } = useTranslations("setup")

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(envExample)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <>
      <PageTitle section="setup" titleKey="title" />
      <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 transition-colors duration-300">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo size="md" showText={false} />
              <span className="text-xl font-bold text-foreground">Pranam</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Link href="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t("title")}</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("subtitle")}</p>
          </div>

          {/* Environment Variables Section */}
          <Card className="mb-8 border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Key className="h-5 w-5 text-primary" />
                {t("envVariables")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t("envDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supabase Setup */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">{t("supabaseSetup")}</h3>
                  <Badge variant="destructive">{t("requiredVariables")}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{t("supabaseDescription")}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">{t("supabaseUrl")}</h4>
                    <p className="text-sm text-muted-foreground">{t("supabaseUrlDescription")}</p>
                    <code className="block p-2 bg-muted/50 border border-border rounded text-sm text-foreground">
                      NEXT_PUBLIC_SUPABASE_URL
                    </code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-foreground">{t("supabaseAnonKey")}</h4>
                    <p className="text-sm text-muted-foreground">{t("supabaseAnonKeyDescription")}</p>
                    <code className="block p-2 bg-muted/50 border border-border rounded text-sm text-foreground">
                      NEXT_PUBLIC_SUPABASE_ANON_KEY
                    </code>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h4 className="font-medium mb-2 text-foreground">{t("howToFind")}</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                    <li>{t("step1")}</li>
                    <li>{t("step2")}</li>
                    <li>{t("step3")}</li>
                    <li>{t("step4")}</li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment File Setup */}
          <Card className="mb-8 border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Settings className="h-5 w-5 text-primary" />
                {t("envFileSetup")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t("envFileDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-muted/50 border border-border text-foreground p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{envExample}</code>
                </pre>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-background/80 border-border hover:bg-muted"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      {t("copyExample")}
                    </>
                  )}
                </Button>
              </div>

              <Alert className="mt-4 border-destructive/50 bg-destructive/10">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive">
                  <strong>{t("warning")}:</strong> {t("warningDescription")}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8 border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Play className="h-5 w-5 text-primary" />
                {t("nextSteps")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t("nextStepsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <Download className="h-4 w-4 text-primary mb-1" />
                    <p className="text-sm text-foreground">{t("installDeps")}</p>
                    <code className="text-xs bg-muted/50 border border-border px-2 py-1 rounded text-foreground">
                      npm install
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <Play className="h-4 w-4 text-primary mb-1" />
                    <p className="text-sm text-foreground">{t("runDev")}</p>
                    <code className="text-xs bg-muted/50 border border-border px-2 py-1 rounded text-foreground">
                      npm run dev
                    </code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <Database className="h-4 w-4 text-primary mb-1" />
                    <p className="text-sm text-foreground">{t("setupDatabase")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <TestTube className="h-4 w-4 text-primary mb-1" />
                    <p className="text-sm text-foreground">{t("testAuth")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="mb-8 border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <AlertTriangle className="h-5 w-5 text-primary" />
                {t("troubleshooting")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t("troubleshootingDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-destructive mb-1">{t("issue1")}</h4>
                <p className="text-sm text-muted-foreground">{t("solution1")}</p>
              </div>
              <Separator className="bg-border" />
              <div>
                <h4 className="font-medium text-destructive mb-1">{t("issue2")}</h4>
                <p className="text-sm text-muted-foreground">{t("solution2")}</p>
              </div>
              <Separator className="bg-border" />
              <div>
                <h4 className="font-medium text-destructive mb-1">{t("issue3")}</h4>
                <p className="text-sm text-muted-foreground">{t("solution3")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Production Deployment */}
          <Card className="mb-8 border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <ExternalLink className="h-5 w-5 text-primary" />
                {t("production")}
              </CardTitle>
              <CardDescription className="text-muted-foreground">{t("productionDescription")}</CardDescription>
            </CardHeader>
          </Card>

          {/* Help Resources */}
          <Card className="border-border/50 bg-card/95 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-card-foreground">{t("needHelp")}</CardTitle>
              <CardDescription className="text-muted-foreground">{t("helpDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" asChild className="border-border hover:bg-muted">
                  <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("supabaseDocs")}
                  </a>
                </Button>
                <Button variant="outline" asChild className="border-border hover:bg-muted">
                  <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("nextjsDocs")}
                  </a>
                </Button>
                <Button variant="outline" asChild className="border-border hover:bg-muted">
                  <a href="https://github.com/your-repo/issues" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("createIssue")}
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
