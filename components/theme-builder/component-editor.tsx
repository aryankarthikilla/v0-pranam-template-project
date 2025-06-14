"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ComponentStyles } from "@/lib/theme-builder/types"

interface ComponentEditorProps {
  componentName: string
  styles: ComponentStyles
  onChange: (styles: ComponentStyles) => void
}

const borderRadiusOptions = [
  { value: "0", label: "None" },
  { value: "0.125rem", label: "Small" },
  { value: "0.25rem", label: "Default" },
  { value: "0.375rem", label: "Medium" },
  { value: "0.5rem", label: "Large" },
  { value: "0.75rem", label: "Extra Large" },
  { value: "1rem", label: "2XL" },
  { value: "9999px", label: "Full" },
]

const fontSizeOptions = [
  { value: "0.75rem", label: "Extra Small" },
  { value: "0.875rem", label: "Small" },
  { value: "1rem", label: "Base" },
  { value: "1.125rem", label: "Large" },
  { value: "1.25rem", label: "Extra Large" },
  { value: "1.5rem", label: "2XL" },
]

const fontWeightOptions = [
  { value: "300", label: "Light" },
  { value: "400", label: "Normal" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
  { value: "800", label: "Extra Bold" },
]

const borderWidthOptions = [
  { value: "0", label: "None" },
  { value: "1px", label: "Thin" },
  { value: "2px", label: "Default" },
  { value: "4px", label: "Thick" },
  { value: "8px", label: "Extra Thick" },
]

export function ComponentEditor({ componentName, styles, onChange }: ComponentEditorProps) {
  const updateStyle = (key: keyof ComponentStyles, value: string) => {
    onChange({ ...styles, [key]: value })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4 capitalize">{componentName} Styles</h3>
      </div>

      {/* Border Radius */}
      <div className="space-y-2">
        <Label>Border Radius</Label>
        <Select value={styles.borderRadius || ""} onValueChange={(value) => updateStyle("borderRadius", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select border radius" />
          </SelectTrigger>
          <SelectContent>
            {borderRadiusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Border Width */}
      <div className="space-y-2">
        <Label>Border Width</Label>
        <Select value={styles.borderWidth || ""} onValueChange={(value) => updateStyle("borderWidth", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select border width" />
          </SelectTrigger>
          <SelectContent>
            {borderWidthOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size */}
      <div className="space-y-2">
        <Label>Font Size</Label>
        <Select value={styles.fontSize || ""} onValueChange={(value) => updateStyle("fontSize", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select font size" />
          </SelectTrigger>
          <SelectContent>
            {fontSizeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Weight */}
      <div className="space-y-2">
        <Label>Font Weight</Label>
        <Select value={styles.fontWeight || ""} onValueChange={(value) => updateStyle("fontWeight", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select font weight" />
          </SelectTrigger>
          <SelectContent>
            {fontWeightOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.value})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Padding */}
      <div className="space-y-2">
        <Label>Padding</Label>
        <Input
          value={styles.padding || ""}
          onChange={(e) => updateStyle("padding", e.target.value)}
          placeholder="e.g., 0.5rem 1rem"
        />
      </div>

      {/* Margin */}
      <div className="space-y-2">
        <Label>Margin</Label>
        <Input
          value={styles.margin || ""}
          onChange={(e) => updateStyle("margin", e.target.value)}
          placeholder="e.g., 0.5rem"
        />
      </div>

      {/* Height */}
      <div className="space-y-2">
        <Label>Height</Label>
        <Input
          value={styles.height || ""}
          onChange={(e) => updateStyle("height", e.target.value)}
          placeholder="e.g., 2.5rem"
        />
      </div>

      {/* Width */}
      <div className="space-y-2">
        <Label>Width</Label>
        <Input
          value={styles.width || ""}
          onChange={(e) => updateStyle("width", e.target.value)}
          placeholder="e.g., 100%"
        />
      </div>

      {/* Box Shadow */}
      <div className="space-y-2">
        <Label>Box Shadow</Label>
        <Input
          value={styles.boxShadow || ""}
          onChange={(e) => updateStyle("boxShadow", e.target.value)}
          placeholder="e.g., 0 1px 3px rgba(0,0,0,0.1)"
        />
      </div>

      {/* Transition */}
      <div className="space-y-2">
        <Label>Transition</Label>
        <Input
          value={styles.transition || ""}
          onChange={(e) => updateStyle("transition", e.target.value)}
          placeholder="e.g., all 0.2s ease"
        />
      </div>

      {/* Transform */}
      <div className="space-y-2">
        <Label>Transform</Label>
        <Input
          value={styles.transform || ""}
          onChange={(e) => updateStyle("transform", e.target.value)}
          placeholder="e.g., scale(1.05)"
        />
      </div>

      {/* Opacity */}
      <div className="space-y-2">
        <Label>Opacity</Label>
        <Input
          type="number"
          min="0"
          max="1"
          step="0.1"
          value={styles.opacity || ""}
          onChange={(e) => updateStyle("opacity", e.target.value)}
          placeholder="e.g., 0.8"
        />
      </div>

      {/* Backdrop Blur */}
      <div className="space-y-2">
        <Label>Backdrop Blur</Label>
        <Input
          value={styles.backdropBlur || ""}
          onChange={(e) => updateStyle("backdropBlur", e.target.value)}
          placeholder="e.g., blur(8px)"
        />
      </div>

      {/* Letter Spacing */}
      <div className="space-y-2">
        <Label>Letter Spacing</Label>
        <Input
          value={styles.letterSpacing || ""}
          onChange={(e) => updateStyle("letterSpacing", e.target.value)}
          placeholder="e.g., 0.025em"
        />
      </div>

      {/* Line Height */}
      <div className="space-y-2">
        <Label>Line Height</Label>
        <Input
          value={styles.lineHeight || ""}
          onChange={(e) => updateStyle("lineHeight", e.target.value)}
          placeholder="e.g., 1.5"
        />
      </div>
    </div>
  )
}
