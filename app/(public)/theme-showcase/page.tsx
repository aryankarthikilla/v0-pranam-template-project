"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Search, Download, Copy, Code, Layers, ExternalLink, Palette, Eye, ArrowLeft, Sparkles } from "lucide-react"
import Link from "next/link"
import { showcaseThemes, categories, useCases, colorTags, type ShowcaseTheme } from "@/lib/theme-showcase/data"
import { ThemePreview } from "@/components/theme-builder/theme-preview"
import { generateTailwindConfig, generateGlobalCSS } from "@/lib/theme-builder/utils"
import { useRouter } from "next/navigation"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"

export default function ThemeShowcasePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedUseCase, setSelectedUseCase] = useState("all")
  const [selectedColor, setSelectedColor] = useState("all")
  const [selectedTheme, setSelectedTheme] = useState<ShowcaseTheme | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  const useThemeInBuilder = (theme: ShowcaseTheme) => {
    // Store the selected theme in localStorage to pass to theme builder
    localStorage.setItem("selectedShowcaseTheme", JSON.stringify(theme))
    router.push("/theme-builder")
  }

  const filteredThemes = useMemo(() => {
    return showcaseThemes.filter((theme) => {
      const matchesSearch =
        searchQuery === "" ||
        theme.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        theme.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        theme.useCase.some((useCase) => useCase.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "All" || theme.category === selectedCategory

      const matchesUseCase = selectedUseCase === "all" || theme.useCase.some((useCase) => useCase === selectedUseCase)

      const matchesColor = selectedColor === "all" || theme.tags.some((tag) => tag === selectedColor)

      return matchesSearch && matchesCategory && matchesUseCase && matchesColor
    })
  }, [searchQuery, selectedCategory, selectedUseCase, selectedColor])

  const copyThemeCode = async (theme: ShowcaseTheme, type: "tailwind" | "css" | "json") => {
    let content = ""
    switch (type) {
      case "tailwind":
        content = generateTailwindConfig(theme.themeData)
        break
      case "css":
        content = generateGlobalCSS(theme.themeData)
        break
      case "json":
        content = JSON.stringify(theme.themeData, null, 2)
        break
    }

    try {
      await navigator.clipboard.writeText(content)
      // You could add a toast notification here
    } catch (error) {
      console.error("Failed to copy to clipboard:", error)
    }
  }

  const downloadThemeFiles = (theme: ShowcaseTheme) => {
    const tailwindConfig = generateTailwindConfig(theme.themeData)
    const globalCSS = generateGlobalCSS(theme.themeData)
    const themeJSON = JSON.stringify(theme.themeData, null, 2)

    const files = [
      { name: "tailwind.config.ts", content: tailwindConfig },
      { name: "globals.css", content: globalCSS },
      { name: "theme.json", content: themeJSON },
    ]

    files.forEach((file) => {
      const blob = new Blob([file.content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${theme.name.toLowerCase().replace(/\s+/g, "-")}-${file.name}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5 transition-colors duration-300">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Theme Showcase</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
              <Link href="/theme-builder">
                <Button variant="outline" size="sm" className="border-border hover:bg-muted">
                  <Palette className="h-4 w-4 mr-2" />
                  Theme Builder
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mt-6 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search themes by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border bg-background text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 border-border bg-background">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-background">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
                  <SelectTrigger className="w-48 border-border bg-background">
                    <SelectValue placeholder="Use Case" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-background">
                    <SelectItem value="all">All Use Cases</SelectItem>
                    {useCases.map((useCase) => (
                      <SelectItem key={useCase} value={useCase}>
                        {useCase.charAt(0).toUpperCase() + useCase.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-48 border-border bg-background">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent className="border-border bg-background">
                    <SelectItem value="all">All Colors</SelectItem>
                    {colorTags.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color.charAt(0).toUpperCase() + color.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory !== "All" || selectedUseCase !== "all" || selectedColor !== "all" || searchQuery) && (
              <div className="flex flex-wrap gap-2">
                {searchQuery && (
                  <Badge variant="secondary" className="gap-1 bg-secondary/50 text-secondary-foreground">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "All" && (
                  <Badge variant="secondary" className="gap-1 bg-secondary/50 text-secondary-foreground">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedUseCase !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-secondary/50 text-secondary-foreground">
                    Use Case: {selectedUseCase}
                    <button
                      onClick={() => setSelectedUseCase("all")}
                      className="ml-1 hover:bg-muted rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedColor !== "all" && (
                  <Badge variant="secondary" className="gap-1 bg-secondary/50 text-secondary-foreground">
                    Color: {selectedColor}
                    <button onClick={() => setSelectedColor("all")} className="ml-1 hover:bg-muted rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Results Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {filteredThemes.length} Theme{filteredThemes.length !== 1 ? "s" : ""} Found
          </h2>
          <p className="text-muted-foreground">
            Discover professionally crafted themes inspired by popular websites and design systems
          </p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => (
            <Card
              key={theme.id}
              className="group hover:shadow-lg transition-all duration-200 overflow-hidden border-border/50 bg-card/95 backdrop-blur-sm"
            >
              <div className="aspect-video bg-muted/50 relative overflow-hidden">
                <img
                  src={theme.previewImage || "/placeholder.svg"}
                  alt={`${theme.name} preview`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setSelectedTheme(theme)
                      setPreviewOpen(true)
                    }}
                    className="bg-background/80 border-border hover:bg-muted"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1 text-card-foreground">{theme.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">{theme.description}</CardDescription>
                  </div>
                  {theme.websiteUrl && (
                    <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                      <a href={theme.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-xs border-border">
                    {theme.category}
                  </Badge>
                  {theme.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs bg-secondary/50">
                      {tag}
                    </Badge>
                  ))}
                  {theme.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs bg-secondary/50">
                      +{theme.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Color Palette Preview */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-muted-foreground">Colors:</span>
                  <div className="flex gap-1">
                    {theme.primaryColors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                    onClick={() => useThemeInBuilder(theme)}
                  >
                    <Palette className="h-4 w-4 mr-2" />
                    Use Theme
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadThemeFiles(theme)}
                    className="border-border hover:bg-muted"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyThemeCode(theme, "json")}
                    className="border-border hover:bg-muted"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredThemes.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-muted/50 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No themes found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your search criteria or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
                setSelectedUseCase("all")
                setSelectedColor("all")
              }}
              className="border-border hover:bg-muted"
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </main>

      {/* Theme Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] border-border bg-background">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Palette className="h-5 w-5 text-primary" />
              {selectedTheme?.name}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">{selectedTheme?.description}</DialogDescription>
          </DialogHeader>

          {selectedTheme && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-muted/50">
                <TabsTrigger
                  value="preview"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Preview
                </TabsTrigger>
                <TabsTrigger
                  value="details"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="code"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Code
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-4">
                <ScrollArea className="h-[60vh] border border-border rounded-md">
                  <ThemePreview themeData={selectedTheme.themeData} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Theme Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-foreground">Category:</span>
                        <p className="text-sm text-muted-foreground">{selectedTheme.category}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">Inspiration:</span>
                        <p className="text-sm text-muted-foreground">{selectedTheme.inspiration}</p>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Use Cases</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTheme.useCase.map((useCase) => (
                        <Badge key={useCase} variant="outline" className="border-border">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Color Palette</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedTheme.primaryColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded border border-border" style={{ backgroundColor: color }} />
                          <span className="text-sm font-mono text-foreground">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  <div>
                    <h4 className="font-semibold mb-2 text-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTheme.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-secondary/50">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-4">
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyThemeCode(selectedTheme, "tailwind")}
                      className="border-border hover:bg-muted"
                    >
                      <Code className="h-4 w-4 mr-2" />
                      Copy Tailwind Config
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyThemeCode(selectedTheme, "css")}
                      className="border-border hover:bg-muted"
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Copy CSS
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyThemeCode(selectedTheme, "json")}
                      className="border-border hover:bg-muted"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                  </div>
                  <ScrollArea className="h-96 w-full border border-border rounded-md p-4 bg-muted/20">
                    <pre className="text-sm text-foreground">
                      <code>{JSON.stringify(selectedTheme.themeData, null, 2)}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)} className="border-border hover:bg-muted">
              Close
            </Button>
            {selectedTheme && (
              <Button
                onClick={() => useThemeInBuilder(selectedTheme)}
                className="bg-gradient-to-r from-primary to-primary/80"
              >
                <Palette className="h-4 w-4 mr-2" />
                Use in Theme Builder
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
