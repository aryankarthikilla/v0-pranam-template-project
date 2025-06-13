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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="border-b bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Logo size="md" showText={false} />
              <span className="text-xl font-bold text-gray-900">Pranam</span>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <Link href="/login">
                <Button variant="ghost">Login</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("backToHome")}
            </Link>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t("title")}</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
          </div>

          {/* Environment Variables Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                {t("envVariables")}
              </CardTitle>
              <CardDescription>{t("envDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Supabase Setup */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Database className="h-5 w-5 text-green-600" />
                  <h3 className="text-lg font-semibold">{t("supabaseSetup")}</h3>
                  <Badge variant="destructive">{t("requiredVariables")}</Badge>
                </div>
                <p className="text-muted-foreground mb-4">{t("supabaseDescription")}</p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">{t("supabaseUrl")}</h4>
                    <p className="text-sm text-muted-foreground">{t("supabaseUrlDescription")}</p>
                    <code className="block p-2 bg-muted rounded text-sm">NEXT_PUBLIC_SUPABASE_URL</code>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">{t("supabaseAnonKey")}</h4>
                    <p className="text-sm text-muted-foreground">{t("supabaseAnonKeyDescription")}</p>
                    <code className="block p-2 bg-muted rounded text-sm">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">{t("howToFind")}</h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm">
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                {t("envFileSetup")}
              </CardTitle>
              <CardDescription>{t("envFileDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                  <code>{envExample}</code>
                </pre>
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="absolute top-2 right-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
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

              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{t("warning")}:</strong> {t("warningDescription")}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                {t("nextSteps")}
              </CardTitle>
              <CardDescription>{t("nextStepsDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    1
                  </div>
                  <div>
                    <Download className="h-4 w-4 text-blue-600 mb-1" />
                    <p className="text-sm">{t("installDeps")}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">npm install</code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    2
                  </div>
                  <div>
                    <Play className="h-4 w-4 text-blue-600 mb-1" />
                    <p className="text-sm">{t("runDev")}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded">npm run dev</code>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    3
                  </div>
                  <div>
                    <Database className="h-4 w-4 text-blue-600 mb-1" />
                    <p className="text-sm">{t("setupDatabase")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                    4
                  </div>
                  <div>
                    <TestTube className="h-4 w-4 text-blue-600 mb-1" />
                    <p className="text-sm">{t("testAuth")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Troubleshooting */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {t("troubleshooting")}
              </CardTitle>
              <CardDescription>{t("troubleshootingDescription")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium text-red-600 mb-1">{t("issue1")}</h4>
                <p className="text-sm text-muted-foreground">{t("solution1")}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-red-600 mb-1">{t("issue2")}</h4>
                <p className="text-sm text-muted-foreground">{t("solution2")}</p>
              </div>
              <Separator />
              <div>
                <h4 className="font-medium text-red-600 mb-1">{t("issue3")}</h4>
                <p className="text-sm text-muted-foreground">{t("solution3")}</p>
              </div>
            </CardContent>
          </Card>

          {/* Production Deployment */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5" />
                {t("production")}
              </CardTitle>
              <CardDescription>{t("productionDescription")}</CardDescription>
            </CardHeader>
          </Card>

          {/* Help Resources */}
          <Card>
            <CardHeader>
              <CardTitle>{t("needHelp")}</CardTitle>
              <CardDescription>{t("helpDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" asChild>
                  <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("supabaseDocs")}
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {t("nextjsDocs")}
                  </a>
                </Button>
                <Button variant="outline" asChild>
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
