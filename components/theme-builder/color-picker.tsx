"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Palette } from "lucide-react"

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
  description?: string
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hslValue, setHslValue] = useState(value)

  const handleChange = (newValue: string) => {
    setHslValue(newValue)
    onChange(newValue)
  }

  // Convert HSL to hex for color input
  const hslToHex = (hsl: string) => {
    const [h, s, l] = hsl.split(" ").map((v) => Number.parseFloat(v.replace("%", "")))
    const hue = h / 360
    const saturation = s / 100
    const lightness = l / 100

    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation
    const p = 2 * lightness - q
    const r = hue2rgb(p, q, hue + 1 / 3)
    const g = hue2rgb(p, q, hue)
    const b = hue2rgb(p, q, hue - 1 / 3)

    const toHex = (c: number) => {
      const hex = Math.round(c * 255).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`
  }

  // Convert hex to HSL
  const hexToHsl = (hex: string) => {
    const r = Number.parseInt(hex.slice(1, 3), 16) / 255
    const g = Number.parseInt(hex.slice(3, 5), 16) / 255
    const b = Number.parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
  }

  const previewColor = `hsl(${value})`
  const hexColor = hslToHex(value)

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start text-left font-normal">
            <div className="w-4 h-4 rounded border mr-2" style={{ backgroundColor: previewColor }} />
            <span className="flex-1">{value}</span>
            <Palette className="ml-2 h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-4">
            <div>
              <Label htmlFor="color-input" className="text-sm">
                Color Picker
              </Label>
              <input
                id="color-input"
                type="color"
                value={hexColor}
                onChange={(e) => handleChange(hexToHsl(e.target.value))}
                className="w-full h-10 rounded border cursor-pointer"
              />
            </div>

            <div>
              <Label htmlFor="hsl-input" className="text-sm">
                HSL Value
              </Label>
              <Input
                id="hsl-input"
                value={hslValue}
                onChange={(e) => handleChange(e.target.value)}
                placeholder="0 0% 100%"
                className="font-mono text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label className="text-xs">Hue</Label>
                <Input
                  type="number"
                  min="0"
                  max="360"
                  value={value.split(" ")[0]}
                  onChange={(e) => {
                    const [, s, l] = value.split(" ")
                    handleChange(`${e.target.value} ${s} ${l}`)
                  }}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Saturation</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={value.split(" ")[1].replace("%", "")}
                  onChange={(e) => {
                    const [h, , l] = value.split(" ")
                    handleChange(`${h} ${e.target.value}% ${l}`)
                  }}
                  className="text-xs"
                />
              </div>
              <div>
                <Label className="text-xs">Lightness</Label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={value.split(" ")[2].replace("%", "")}
                  onChange={(e) => {
                    const [h, s] = value.split(" ")
                    handleChange(`${h} ${s} ${e.target.value}%`)
                  }}
                  className="text-xs"
                />
              </div>
            </div>

            <div className="w-full h-12 rounded border" style={{ backgroundColor: previewColor }} />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
