"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  HelpCircle,
  Palette,
  Settings,
  Eye,
  Download,
  Copy,
  Monitor,
  Smartphone,
  Tablet,
  Code,
  Layers,
  Paintbrush,
  MousePointer,
  Keyboard,
  Share,
  Star,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react"

interface UsageGuideProps {
  children?: React.ReactNode
}

export function UsageGuide({ children }: UsageGuideProps) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <HelpCircle className="h-4 w-4 mr-2" />
            Usage Guide
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
            Theme Builder Usage Guide
          </DialogTitle>
          <DialogDescription>
            Complete step-by-step guide to master the Theme Builder and create stunning custom themes
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[70vh] pr-4">
          <Tabs defaultValue="getting-started" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="getting-started" className="text-xs">
                Getting Started
              </TabsTrigger>
              <TabsTrigger value="colors" className="text-xs">
                Colors
              </TabsTrigger>
              <TabsTrigger value="components" className="text-xs">
                Components
              </TabsTrigger>
              <TabsTrigger value="advanced" className="text-xs">
                Advanced
              </TabsTrigger>
              <TabsTrigger value="preview" className="text-xs">
                Preview
              </TabsTrigger>
              <TabsTrigger value="export" className="text-xs">
                Export
              </TabsTrigger>
            </TabsList>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Welcome to Theme Builder
                  </CardTitle>
                  <CardDescription>Learn the basics and understand the interface</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      What is Theme Builder?
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Theme Builder is a powerful visual tool that lets you create custom themes for your applications.
                      You can customize colors, component styles, typography, and advanced properties to match your
                      brand or design preferences.
                    </p>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <MousePointer className="h-4 w-4 text-blue-500" />
                      Interface Overview
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Badge variant="outline">Left Sidebar</Badge>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Saved Themes - Browse and load existing themes</li>
                          <li>• Quick Actions - Copy code, export files</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline">Main Area</Badge>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Colors Tab - Customize color palette</li>
                          <li>• Components Tab - Style individual components</li>
                          <li>• Advanced Tab - Typography and spacing</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline">Right Panel</Badge>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Live Preview - See changes in real-time</li>
                          <li>• Component Examples - Test your theme</li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Badge variant="outline">Top Bar</Badge>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Preview Mode - Full-screen preview</li>
                          <li>• Reset - Start over with default theme</li>
                          <li>• Save - Store your custom theme</li>
                          <li>• Download - Export theme files</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Keyboard className="h-4 w-4 text-purple-500" />
                      Quick Tips
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <ul className="text-sm space-y-2">
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>All changes are applied in real-time - no need to refresh</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Use the preview panel to see how components look with your theme</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Save your work frequently to avoid losing changes</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>Start with colors, then move to components and advanced settings</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Colors Tab */}
            <TabsContent value="colors" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5 text-pink-500" />
                    Customizing Colors
                  </CardTitle>
                  <CardDescription>Master the color system and create beautiful palettes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 1: Understanding Color Roles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Badge className="bg-blue-100 text-blue-800">Primary Colors</Badge>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            <strong>Background:</strong> Main page background
                          </li>
                          <li>
                            <strong>Foreground:</strong> Primary text color
                          </li>
                          <li>
                            <strong>Primary:</strong> Brand color for buttons, links
                          </li>
                          <li>
                            <strong>Primary Foreground:</strong> Text on primary elements
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-green-100 text-green-800">Secondary Colors</Badge>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            <strong>Secondary:</strong> Alternative accent color
                          </li>
                          <li>
                            <strong>Muted:</strong> Subtle backgrounds
                          </li>
                          <li>
                            <strong>Accent:</strong> Highlights and emphasis
                          </li>
                          <li>
                            <strong>Border:</strong> Lines and dividers
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 2: Using the Color Picker</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <ol className="text-sm space-y-2">
                        <li>
                          <strong>1.</strong> Click on any color button to open the color picker
                        </li>
                        <li>
                          <strong>2.</strong> Use the visual color wheel to select your desired color
                        </li>
                        <li>
                          <strong>3.</strong> Fine-tune using HSL values (Hue, Saturation, Lightness)
                        </li>
                        <li>
                          <strong>4.</strong> Or enter HSL values directly in the format: "220 50% 60%"
                        </li>
                        <li>
                          <strong>5.</strong> See the preview update instantly
                        </li>
                      </ol>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 3: Color Harmony Tips</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-800 mb-2">Monochromatic</h5>
                        <p className="text-xs text-purple-600">
                          Use different shades of the same hue for a cohesive look
                        </p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800 mb-2">Complementary</h5>
                        <p className="text-xs text-blue-600">
                          Use opposite colors on the color wheel for high contrast
                        </p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="font-medium text-green-800 mb-2">Analogous</h5>
                        <p className="text-xs text-green-600">Use adjacent colors for a harmonious palette</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Common Mistakes to Avoid
                    </h4>
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <ul className="text-sm space-y-2">
                        <li>• Don't make background and foreground colors too similar (poor contrast)</li>
                        <li>• Avoid using pure black (#000000) or pure white (#FFFFFF) for text</li>
                        <li>• Test your colors with different content types (text, buttons, cards)</li>
                        <li>• Consider accessibility - ensure sufficient contrast ratios</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Components Tab */}
            <TabsContent value="components" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-blue-500" />
                    Styling Components
                  </CardTitle>
                  <CardDescription>Customize individual component styles and properties</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 1: Select a Component</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <ol className="text-sm space-y-2">
                        <li>
                          <strong>1.</strong> Go to the "Components" tab in the main area
                        </li>
                        <li>
                          <strong>2.</strong> Use the dropdown to select which component to customize
                        </li>
                        <li>
                          <strong>3.</strong> Available components include: Button, Input, Card, Dialog, and 30+ more
                        </li>
                        <li>
                          <strong>4.</strong> Each component has its own set of customizable properties
                        </li>
                      </ol>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 2: Understanding Properties</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Badge className="bg-green-100 text-green-800">Layout Properties</Badge>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            <strong>Padding:</strong> Inner spacing (e.g., "0.5rem 1rem")
                          </li>
                          <li>
                            <strong>Margin:</strong> Outer spacing (e.g., "0.5rem")
                          </li>
                          <li>
                            <strong>Width/Height:</strong> Component dimensions
                          </li>
                          <li>
                            <strong>Border Radius:</strong> Rounded corners
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <Badge className="bg-purple-100 text-purple-800">Visual Properties</Badge>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            <strong>Font Size:</strong> Text size (e.g., "0.875rem")
                          </li>
                          <li>
                            <strong>Font Weight:</strong> Text thickness (400-800)
                          </li>
                          <li>
                            <strong>Box Shadow:</strong> Drop shadow effects
                          </li>
                          <li>
                            <strong>Border Width:</strong> Border thickness
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 3: Common Component Customizations</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <h5 className="font-medium mb-2">Button Styling</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            • <strong>Border Radius:</strong> "0.5rem" for rounded, "0" for square
                          </li>
                          <li>
                            • <strong>Padding:</strong> "0.5rem 1rem" for comfortable spacing
                          </li>
                          <li>
                            • <strong>Font Weight:</strong> "500" for medium, "600" for semibold
                          </li>
                          <li>
                            • <strong>Transition:</strong> "all 0.2s ease" for smooth hover effects
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <h5 className="font-medium mb-2">Input Field Styling</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            • <strong>Border Radius:</strong> "0.375rem" for subtle rounding
                          </li>
                          <li>
                            • <strong>Border Width:</strong> "1px" standard, "2px" for emphasis
                          </li>
                          <li>
                            • <strong>Padding:</strong> "0.5rem 0.75rem" for comfortable typing
                          </li>
                          <li>
                            • <strong>Height:</strong> "2.5rem" for standard size
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <h5 className="font-medium mb-2">Card Styling</h5>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>
                            • <strong>Border Radius:</strong> "0.5rem" for modern look
                          </li>
                          <li>
                            • <strong>Padding:</strong> "1.5rem" for content spacing
                          </li>
                          <li>
                            • <strong>Box Shadow:</strong> "0 1px 3px rgba(0,0,0,0.1)" for depth
                          </li>
                          <li>
                            • <strong>Border Width:</strong> "1px" for subtle definition
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Step 4: CSS Units Guide</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800 mb-2">rem Units</h5>
                        <p className="text-xs text-blue-600">Relative to root font size. Use for consistent scaling.</p>
                        <p className="text-xs text-blue-600 mt-1">Example: "1rem" = 16px</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="font-medium text-green-800 mb-2">px Units</h5>
                        <p className="text-xs text-green-600">Absolute pixels. Use for precise control.</p>
                        <p className="text-xs text-green-600 mt-1">Example: "16px" = 16 pixels</p>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-800 mb-2">% Units</h5>
                        <p className="text-xs text-purple-600">
                          Relative to parent element. Use for responsive design.
                        </p>
                        <p className="text-xs text-purple-600 mt-1">Example: "100%" = full width</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5 text-green-500" />
                    Advanced Settings
                  </CardTitle>
                  <CardDescription>Fine-tune typography, spacing, and advanced properties</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Typography Settings</h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium mb-1">Font Family</h5>
                          <p className="text-sm text-muted-foreground">
                            Set the primary font for your theme. Examples:
                          </p>
                          <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                            <li>
                              • <code>"Inter, system-ui, sans-serif"</code> - Modern sans-serif
                            </li>
                            <li>
                              • <code>"Georgia, serif"</code> - Classic serif
                            </li>
                            <li>
                              • <code>"JetBrains Mono, monospace"</code> - Code font
                            </li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-1">Heading Font Family</h5>
                          <p className="text-sm text-muted-foreground">
                            Separate font for headings (h1, h2, h3, etc.). Leave empty to use the same as body font.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Border Radius System</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-sm text-muted-foreground mb-3">
                        Create a consistent border radius scale for your design system:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Badge variant="outline" className="mb-1">
                            SM
                          </Badge>
                          <p className="text-xs text-muted-foreground">Small elements</p>
                          <p className="text-xs font-mono">0.125rem</p>
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            MD
                          </Badge>
                          <p className="text-xs text-muted-foreground">Default size</p>
                          <p className="text-xs font-mono">0.375rem</p>
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            LG
                          </Badge>
                          <p className="text-xs text-muted-foreground">Cards, modals</p>
                          <p className="text-xs font-mono">0.5rem</p>
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            XL
                          </Badge>
                          <p className="text-xs text-muted-foreground">Large elements</p>
                          <p className="text-xs font-mono">0.75rem</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Spacing System</h4>
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <p className="text-sm text-muted-foreground mb-3">
                        Define consistent spacing values for margins and padding:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div>
                          <Badge variant="outline" className="mb-1">
                            XS
                          </Badge>
                          <p className="text-xs font-mono">0.25rem</p>
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            SM
                          </Badge>
                          <p className="text-xs font-mono">0.5rem</p>
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            MD
                          </Badge>
                          <p className="text-xs font-mono">1rem</p>
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            LG
                          </Badge>
                          <p className="text-xs font-mono">1.5rem</p>
                        </div>
                        <div>
                          <Badge variant="outline" className="mb-1">
                            XL
                          </Badge>
                          <p className="text-xs font-mono">2rem</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-orange-500" />
                      Pro Tips
                    </h4>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <ul className="text-sm space-y-2">
                        <li>• Use a consistent scale (e.g., 0.25rem, 0.5rem, 1rem, 1.5rem, 2rem)</li>
                        <li>• Test your spacing on different screen sizes</li>
                        <li>• Consider using system fonts for better performance</li>
                        <li>• Keep your design system simple - too many options create inconsistency</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-indigo-500" />
                    Preview Your Theme
                  </CardTitle>
                  <CardDescription>Test your theme across different devices and components</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Preview Modes</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h5 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                          <Layers className="h-4 w-4" />
                          Live Preview Panel
                        </h5>
                        <ul className="text-sm text-blue-600 space-y-1">
                          <li>• Located on the right side of the screen</li>
                          <li>• Shows real-time changes as you edit</li>
                          <li>• Displays common UI components</li>
                          <li>• Scaled down to fit in the panel</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Full Preview Mode
                        </h5>
                        <ul className="text-sm text-green-600 space-y-1">
                          <li>• Click "Preview Mode" in the top bar</li>
                          <li>• Full-screen preview of your theme</li>
                          <li>• Test different device sizes</li>
                          <li>• Comprehensive component showcase</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Device Testing</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border">
                      <p className="text-sm text-muted-foreground mb-3">
                        In full preview mode, test your theme on different screen sizes:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2 p-2 bg-white rounded border">
                          <Monitor className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">Desktop</p>
                            <p className="text-xs text-muted-foreground">1200px+ wide</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border">
                          <Tablet className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">Tablet</p>
                            <p className="text-xs text-muted-foreground">768px - 1199px</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-white rounded border">
                          <Smartphone className="h-4 w-4 text-gray-600" />
                          <div>
                            <p className="text-sm font-medium">Mobile</p>
                            <p className="text-xs text-muted-foreground">320px - 767px</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">What to Test</h4>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <ul className="text-sm space-y-2">
                        <li>
                          <strong>Readability:</strong> Ensure text is easy to read on all backgrounds
                        </li>
                        <li>
                          <strong>Contrast:</strong> Check that interactive elements stand out
                        </li>
                        <li>
                          <strong>Consistency:</strong> Verify that similar elements look similar
                        </li>
                        <li>
                          <strong>Accessibility:</strong> Test with different content lengths
                        </li>
                        <li>
                          <strong>Responsiveness:</strong> Check how components adapt to different screen sizes
                        </li>
                      </ul>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Preview Components</h4>
                    <p className="text-sm text-muted-foreground">
                      The preview includes examples of all major UI components:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                      <Badge variant="outline">Buttons</Badge>
                      <Badge variant="outline">Forms</Badge>
                      <Badge variant="outline">Cards</Badge>
                      <Badge variant="outline">Navigation</Badge>
                      <Badge variant="outline">Tables</Badge>
                      <Badge variant="outline">Modals</Badge>
                      <Badge variant="outline">Alerts</Badge>
                      <Badge variant="outline">Progress</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Export Tab */}
            <TabsContent value="export" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-green-500" />
                    Save & Export Your Theme
                  </CardTitle>
                  <CardDescription>Learn how to save, share, and implement your custom theme</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Saving Your Theme</h4>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <ol className="text-sm space-y-2">
                        <li>
                          <strong>1.</strong> Click the "Save Theme" button in the top bar
                        </li>
                        <li>
                          <strong>2.</strong> Enter a descriptive name for your theme
                        </li>
                        <li>
                          <strong>3.</strong> Add an optional description explaining your design choices
                        </li>
                        <li>
                          <strong>4.</strong> Choose whether to make it public (others can use it)
                        </li>
                        <li>
                          <strong>5.</strong> Click "Save Theme" to store it in the database
                        </li>
                      </ol>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Export Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <h5 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                          <Download className="h-4 w-4" />
                          Download Files
                        </h5>
                        <p className="text-sm text-green-600 mb-2">Get complete theme files for your project</p>
                        <ul className="text-xs text-green-600 space-y-1">
                          <li>• tailwind.config.ts</li>
                          <li>• globals.css</li>
                          <li>• theme.json</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                        <h5 className="font-medium text-purple-800 mb-2 flex items-center gap-2">
                          <Copy className="h-4 w-4" />
                          Copy Code
                        </h5>
                        <p className="text-sm text-purple-600 mb-2">Quick copy options for specific files</p>
                        <ul className="text-xs text-purple-600 space-y-1">
                          <li>• Copy JSON</li>
                          <li>• Copy Tailwind Config</li>
                          <li>• Copy CSS</li>
                        </ul>
                      </div>
                      <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                        <h5 className="font-medium text-orange-800 mb-2 flex items-center gap-2">
                          <Share className="h-4 w-4" />
                          Share Theme
                        </h5>
                        <p className="text-sm text-orange-600 mb-2">Make your theme available to others</p>
                        <ul className="text-xs text-orange-600 space-y-1">
                          <li>• Public themes</li>
                          <li>• Theme gallery</li>
                          <li>• Community sharing</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold">Implementation Guide</h4>
                    <div className="space-y-4">
                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <h5 className="font-medium mb-2">For New Projects</h5>
                        <ol className="text-sm text-muted-foreground space-y-1">
                          <li>1. Download the theme files</li>
                          <li>2. Replace your existing tailwind.config.ts</li>
                          <li>3. Update your globals.css file</li>
                          <li>4. Restart your development server</li>
                        </ol>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border">
                        <h5 className="font-medium mb-2">For Existing Projects</h5>
                        <ol className="text-sm text-muted-foreground space-y-1">
                          <li>1. Backup your current theme files</li>
                          <li>2. Copy the CSS variables from globals.css</li>
                          <li>3. Merge the Tailwind config with your existing one</li>
                          <li>4. Test thoroughly before deploying</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Best Practices
                    </h4>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <ul className="text-sm space-y-2">
                        <li>• Always test your theme in a development environment first</li>
                        <li>• Keep a backup of your original theme files</li>
                        <li>• Document any custom modifications you make</li>
                        <li>• Consider creating multiple theme variations for different use cases</li>
                        <li>• Share successful themes with the community</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
