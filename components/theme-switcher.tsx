"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Palette, Check } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useI18n } from "@/lib/i18n/context"
import { themes, type ThemeKey } from "@/lib/themes"

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { t } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Palette className="h-4 w-4" />
          <span className="sr-only">Switch theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("chooseTheme")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(themes).map(([key, themeData]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setTheme(key as ThemeKey)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{themeData.icon}</span>
              <span>{t(`themes.${key}`)}</span>
            </div>
            {theme === key && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
