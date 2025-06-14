"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Download,
  Save,
  Eye,
  EyeOff,
  RotateCcw,
  Copy,
  Code,
  Paintbrush,
  Layers,
  Monitor,
  Smartphone,
  Tablet,
} from "lucide-react"
import { ColorPicker } from "@/components/theme-builder/color-picker"
import { ComponentEditor } from "@/components/theme-builder/component-editor"
import { ThemePreview } from "@/components/theme-builder/theme-preview"
import { createClient } from "@/utils/supabase/client"
import type { ThemeData, ThemeColors, ComponentStyles, Theme } from "@/lib/theme-builder/types"
import {
  getDefaultTheme,
  downloadThemeFiles,
  generateTailwindConfig,
  generateGlobalCSS,
} from "@/lib/theme-builder/utils"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

const componentNames = [
  "button",
  "input",
  "card",
  "dialog",
  "dropdown",
  "tooltip",
  "badge",
  "avatar",
  "checkbox",
  "radio",
  "switch",
  "slider",
  "progress",
  "tabs",
  "accordion",
  "alert",
  "breadcrumb",
  "navigation",
  "sidebar",
  "header",
  "footer",
  "table",
  "form",
  "label",
  "textarea",
  "select",
  "combobox",
  "calendar",
  "datePicker",
  "timePicker",
  "colorPicker",
  "fileUpload",
  "pagination",
  "skeleton",
  "spinner",
  "toast",
  "modal",
  "popover",
  "sheet",
  "drawer",
  "menubar",
  "contextMenu",
  "hoverCard",
  "collapsible",
  "resizable",
  "scrollArea",
  "separator",
  "toolbar",
  "toggle",
  "toggleGroup",
] as const

export default function ThemeBuilderPage() {
  const [currentTheme, setCurrentTheme] = useState<ThemeData>(getDefaultTheme())
  const [previewMode, setPreviewMode] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState<keyof typeof currentTheme.components | null>("button")
  const [selectedColorCategory, setSelectedColorCategory] = useState<keyof ThemeColors | null>("primary")
  const [isDirty, setIsDirty] = useState(false)
  const [savedThemes, setSavedThemes] = useState<Theme[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [themeName, setThemeName] = useState("")
  const [themeDescription, setThemeDescription] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop")

  const supabase = createClient()

  useEffect(() => {
    loadSavedThemes()
  }, [])

  const loadSavedThemes = async () => {
    try {
      const { data, error } = await supabase
        .from("themes")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error
      setSavedThemes(data || [])
    } catch (error) {
      console.error("Error loading themes:", error)
    }
  }

  const updateThemeColor = (colorKey: keyof ThemeColors, value: string) => {
    setCurrentTheme((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }))
    setIsDirty(true)
  }

  const updateComponentStyles = (componentKey: keyof typeof currentTheme.components, styles: ComponentStyles) => {
    setCurrentTheme((prev) => ({
      ...prev,
      components: {
        ...prev.components,
        [componentKey]: styles,
      },
    }))
    setIsDirty(true)
  }

  const resetTheme = () => {
    setCurrentTheme(getDefaultTheme())
    setIsDirty(false)
  }

  const saveTheme = async () => {
    if (!themeName.trim()) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const themeData = {
        name: themeName,
        description: themeDescription,
        author_id: user?.id || null,
        author_name: user?.user_metadata?.full_name || "Anonymous",
        is_public: isPublic,
        theme_data: currentTheme,
      }

      const { error } = await supabase.from("themes").insert([themeData])

      if (error) throw error

      setSaveDialogOpen(false)
      setThemeName("")
      setThemeDescription("")
      setIsDirty(false)
      loadSavedThemes()
    } catch (error) {
      console.error("Error saving theme:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTheme = (theme: Theme) => {
    setCurrentTheme(theme.theme_data)
    setIsDirty(false)
  }

  const downloadTheme = () => {
    downloadThemeFiles(currentTheme, themeName || "custom-theme")
  }

  const copyThemeCode = async (type: "tailwind" | "css" | "json") => {
    let content = ""
    switch (type) {
      case "tailwind":
        content = generateTailwindConfig(currentTheme)
        break
      case "css":
        content = generateGlobalCSS(currentTheme)
        break
      case "json":
        content = JSON.stringify(currentTheme, null, 2)
        break
    }

    try {
      await navigator.clipboard.writeText(content)
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const getPreviewClassName = () => {
    switch (previewDevice) {
      case "mobile":
        return "max-w-sm mx-auto"
      case "tablet":
        return "max-w-2xl mx-auto"
      default:
        return "w-full"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
            <div className="flex items-center space-x-2">
              <Paintbrush className="h-6 w-6 text-purple-600" />
              <h1 className="text-xl font-bold text-gray-900">Theme Builder</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
              {previewMode ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {previewMode ? "Edit Mode" : "Preview Mode"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetTheme}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" disabled={!isDirty}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Theme
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Theme</DialogTitle>
                  <DialogDescription>Save your custom theme to use later or share with others.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="theme-name">Theme Name</Label>
                    <Input
                      id="theme-name"
                      value={themeName}
                      onChange={(e) => setThemeName(e.target.value)}
                      placeholder="My Awesome Theme"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="theme-description">Description (Optional)</Label>
                    <Textarea
                      id="theme-description"
                      value={themeDescription}
                      onChange={(e) => setThemeDescription(e.target.value)}
                      placeholder="Describe your theme..."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="public-theme" checked={isPublic} onCheckedChange={setIsPublic} />
                    <Label htmlFor="public-theme">Make theme public</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={saveTheme} disabled={!themeName.trim() || isLoading}>
                    {isLoading ? "Saving..." : "Save Theme"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button size="sm" onClick={downloadTheme}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {previewMode ? (
          <div className="space-y-6">
            {/* Preview Controls */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Theme Preview</CardTitle>
                    <CardDescription>See how your theme looks across different devices</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={previewDevice === "desktop" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewDevice("desktop")}
                    >
                      <Monitor className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "tablet" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewDevice("tablet")}
                    >
                      <Tablet className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={previewDevice === "mobile" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPreviewDevice("mobile")}
                    >
                      <Smartphone className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Preview */}
            <div className={getPreviewClassName()}>
              <ThemePreview themeData={currentTheme} />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Saved Themes */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Saved Themes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-2">
                      {savedThemes.map((theme) => (
                        <div
                          key={theme.id}
                          className="p-2 rounded border cursor-pointer hover:bg-muted"
                          onClick={() => loadTheme(theme)}
                        >
                          <div className="font-medium text-sm">{theme.name}</div>
                          <div className="text-xs text-muted-foreground">by {theme.author_name}</div>
                          {theme.is_featured && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              Featured
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => copyThemeCode("json")}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy JSON
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => copyThemeCode("tailwind")}
                  >
                    <Code className="h-4 w-4 mr-2" />
                    Copy Tailwind Config
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => copyThemeCode("css")}
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Copy CSS
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="colors" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="components">Components</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Color Palette</CardTitle>
                      <CardDescription>
                        Customize your theme colors. Changes will be reflected in real-time.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(currentTheme.colors).map(([key, value]) => (
                          <ColorPicker
                            key={key}
                            label={key.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                            value={value}
                            onChange={(newValue) => updateThemeColor(key as keyof ThemeColors, newValue)}
                            description={getColorDescription(key)}
                          />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="components" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Component Styles</CardTitle>
                      <CardDescription>
                        Customize individual component styles down to the smallest detail.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Select Component</Label>
                          <Select
                            value={selectedComponent || ""}
                            onValueChange={(value) =>
                              setSelectedComponent(value as keyof typeof currentTheme.components)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a component to customize" />
                            </SelectTrigger>
                            <SelectContent>
                              {componentNames.map((name) => (
                                <SelectItem key={name} value={name}>
                                  {name.charAt(0).toUpperCase() + name.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {selectedComponent && (
                          <ComponentEditor
                            componentName={selectedComponent}
                            styles={currentTheme.components[selectedComponent] || {}}
                            onChange={(styles) => updateComponentStyles(selectedComponent, styles)}
                          />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Advanced Settings</CardTitle>
                      <CardDescription>
                        Fine-tune typography, spacing, and other advanced theme properties.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <h4 className="font-medium">Typography</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Font Family</Label>
                              <Input
                                value={currentTheme.typography?.fontFamily || ""}
                                onChange={(e) =>
                                  setCurrentTheme((prev) => ({
                                    ...prev,
                                    typography: {
                                      ...prev.typography,
                                      fontFamily: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Inter, system-ui, sans-serif"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Heading Font Family</Label>
                              <Input
                                value={currentTheme.typography?.headingFontFamily || ""}
                                onChange={(e) =>
                                  setCurrentTheme((prev) => ({
                                    ...prev,
                                    typography: {
                                      ...prev.typography,
                                      headingFontFamily: e.target.value,
                                    },
                                  }))
                                }
                                placeholder="Inter, system-ui, sans-serif"
                              />
                            </div>
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="font-medium">Border Radius</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {["sm", "md", "lg", "xl"].map((size) => (
                              <div key={size} className="space-y-2">
                                <Label>{size.toUpperCase()}</Label>
                                <Input
                                  value={currentTheme.borderRadius?.[size] || ""}
                                  onChange={(e) =>
                                    setCurrentTheme((prev) => ({
                                      ...prev,
                                      borderRadius: {
                                        ...prev.borderRadius,
                                        [size]: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="0.5rem"
                                />
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                          <h4 className="font-medium">Spacing</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {["xs", "sm", "md", "lg", "xl"].map((size) => (
                              <div key={size} className="space-y-2">
                                <Label>{size.toUpperCase()}</Label>
                                <Input
                                  value={currentTheme.spacing?.[size] || ""}
                                  onChange={(e) =>
                                    setCurrentTheme((prev) => ({
                                      ...prev,
                                      spacing: {
                                        ...prev.spacing,
                                        [size]: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="1rem"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="text-sm">Live Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 scale-75 origin-top">
                    <ThemePreview themeData={currentTheme} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function getColorDescription(colorKey: string): string {
  const descriptions: Record<string, string> = {
    background: "Main background color",
    foreground: "Primary text color",
    card: "Card background color",
    "card-foreground": "Text color on cards",
    popover: "Popover background color",
    "popover-foreground": "Text color in popovers",
    primary: "Primary brand color",
    "primary-foreground": "Text color on primary elements",
    secondary: "Secondary color",
    "secondary-foreground": "Text color on secondary elements",
    muted: "Muted background color",
    "muted-foreground": "Muted text color",
    accent: "Accent color for highlights",
    "accent-foreground": "Text color on accent elements",
    destructive: "Error/danger color",
    "destructive-foreground": "Text color on destructive elements",
    border: "Border color",
    input: "Input border color",
    ring: "Focus ring color",
  }
  return descriptions[colorKey] || ""
}
