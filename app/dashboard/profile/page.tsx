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

export default function ProfilePage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

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
        setMessage("प्रोफ़ाइल सफलतापूर्वक अपडेट की गई! (Profile updated successfully!)")
        // Refresh the page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      }
    } catch (err) {
      setError("एक अप्रत्याशित त्रुटि हुई (An unexpected error occurred)")
    }

    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            डैशबोर्ड पर वापस (Back to Dashboard)
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">प्रोफ़ाइल सेटिंग्स (Profile Settings)</h1>
          <p className="text-muted-foreground">अपनी खाता जानकारी प्रबंधित करें</p>
        </div>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              व्यक्तिगत जानकारी (Personal Information)
            </CardTitle>
            <CardDescription>अपनी व्यक्तिगत जानकारी और प्राथमिकताएं अपडेट करें।</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">ईमेल पता (Email Address)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="pl-10 bg-muted"
                    placeholder="आपका ईमेल पता"
                  />
                </div>
                <p className="text-xs text-muted-foreground">ईमेल इस पृष्ठ से नहीं बदला जा सकता।</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">पूरा नाम (Full Name)</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10"
                    placeholder="अपना पूरा नाम दर्ज करें"
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
                {loading ? "अपडेट हो रहा है..." : "प्रोफ़ाइल अपडेट करें"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              थीम सेटिंग्स (Theme Settings)
            </CardTitle>
            <CardDescription>अपनी पसंदीदा थीम चुनें।</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">रंग थीम (Color Theme)</p>
                <p className="text-xs text-muted-foreground">अपने इंटरफ़ेस के लिए रंग चुनें</p>
              </div>
              <ThemeSwitcher />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>खाता जानकारी (Account Information)</CardTitle>
            <CardDescription>आपकी खाता विवरण और स्थिति।</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">खाता स्थिति (Account Status)</span>
                <span className="text-sm text-green-600 font-medium">सक्रिय (Active)</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-sm font-medium">योजना (Plan)</span>
                <span className="text-sm text-muted-foreground">मुफ़्त (Free)</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm font-medium">सदस्य बने (Member Since)</span>
                <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString("hi-IN")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
