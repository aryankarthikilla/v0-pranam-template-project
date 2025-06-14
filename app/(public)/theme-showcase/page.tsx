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

export default function ThemeShowcasePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedUseCase, setSelectedUseCase] = useState("all")
  const [selectedColor, setSelectedColor] = useState("all")
  const [selectedTheme, setSelectedTheme] = useState<ShowcaseTheme | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

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

  const useThemeInBuilder = (theme: ShowcaseTheme) => {
    // Store the selected theme in localStorage to pass to theme builder
    localStorage.setItem("selectedShowcaseTheme", JSON.stringify(theme))
    router.push("/theme-builder")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
              <div className="flex items-center space-x-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-bold text-gray-900">Theme Showcase</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/theme-builder">
                <Button variant="outline" size="sm">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search themes by name, description, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUseCase} onValueChange={setSelectedUseCase}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Use Case" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Use Cases</SelectItem>
                    {useCases.map((useCase) => (
                      <SelectItem key={useCase} value={useCase}>
                        {useCase.charAt(0).toUpperCase() + useCase.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Color" />
                  </SelectTrigger>
                  <SelectContent>
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
                  <Badge variant="secondary" className="gap-1">
                    Search: {searchQuery}
                    <button onClick={() => setSearchQuery("")} className="ml-1 hover:bg-gray-200 rounded-full p-0.5">
                      ×
                    </button>
                  </Badge>
                )}
                {selectedCategory !== "All" && (
                  <Badge variant="secondary" className="gap-1">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("All")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedUseCase !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Use Case: {selectedUseCase}
                    <button
                      onClick={() => setSelectedUseCase("all")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
                      ×
                    </button>
                  </Badge>
                )}
                {selectedColor !== "all" && (
                  <Badge variant="secondary" className="gap-1">
                    Color: {selectedColor}
                    <button
                      onClick={() => setSelectedColor("all")}
                      className="ml-1 hover:bg-gray-200 rounded-full p-0.5"
                    >
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {filteredThemes.length} Theme{filteredThemes.length !== 1 ? "s" : ""} Found
          </h2>
          <p className="text-gray-600">
            Discover professionally crafted themes inspired by popular websites and design systems
          </p>
        </div>

        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredThemes.map((theme) => (
            <Card key={theme.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden">
              <div className="aspect-video bg-gray-100 relative overflow-hidden">
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
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-1">{theme.name}</CardTitle>
                    <CardDescription className="text-sm">{theme.description}</CardDescription>
                  </div>
                  {theme.websiteUrl && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={theme.websiteUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {theme.category}
                  </Badge>
                  {theme.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {theme.tags.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{theme.tags.length - 2}
                    </Badge>
                  )}
                </div>

                {/* Color Palette Preview */}
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-xs text-gray-500">Colors:</span>
                  <div className="flex gap-1">
                    {theme.primaryColors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1" onClick={() => useThemeInBuilder(theme)}>
                    <Palette className="h-4 w-4 mr-2" />
                    Use Theme
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadThemeFiles(theme)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => copyThemeCode(theme, "json")}>
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
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No themes found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your search criteria or filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("All")
                setSelectedUseCase("all")
                setSelectedColor("all")
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </main>

      {/* Theme Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {selectedTheme?.name}
            </DialogTitle>
            <DialogDescription>{selectedTheme?.description}</DialogDescription>
          </DialogHeader>

          {selectedTheme && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="code">Code</TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-4">
                <ScrollArea className="h-[60vh]">
                  <ThemePreview themeData={selectedTheme.themeData} />
                </ScrollArea>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Theme Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Category:</span>
                        <p className="text-sm text-muted-foreground">{selectedTheme.category}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Inspiration:</span>
                        <p className="text-sm text-muted-foreground">{selectedTheme.inspiration}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Use Cases</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTheme.useCase.map((useCase) => (
                        <Badge key={useCase} variant="outline">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Color Palette</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {selectedTheme.primaryColors.map((color, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded border border-gray-200" style={{ backgroundColor: color }} />
                          <span className="text-sm font-mono">{color}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-semibold mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedTheme.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
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
                    <Button size="sm" variant="outline" onClick={() => copyThemeCode(selectedTheme, "tailwind")}>
                      <Code className="h-4 w-4 mr-2" />
                      Copy Tailwind Config
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyThemeCode(selectedTheme, "css")}>
                      <Layers className="h-4 w-4 mr-2" />
                      Copy CSS
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyThemeCode(selectedTheme, "json")}>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy JSON
                    </Button>
                  </div>
                  <ScrollArea className="h-96 w-full border rounded-md p-4">
                    <pre className="text-sm">
                      <code>{JSON.stringify(selectedTheme.themeData, null, 2)}</code>
                    </pre>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            {selectedTheme && (
              <Button onClick={() => useThemeInBuilder(selectedTheme)}>
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
