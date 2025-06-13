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
import { Languages, Check } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { languages, type Language } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n()

  const translations = {
    selectLanguage: {
      en: "Select Language",
      te: "భాష ఎంచుకోండి",
    },
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Languages className="h-4 w-4" />
          <span className="sr-only">{t("selectLanguage", translations.selectLanguage)}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{t("selectLanguage", translations.selectLanguage)}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(languages).map(([key, langData]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLanguage(key as Language)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{langData.flag}</span>
              <span>{langData.nativeName}</span>
            </div>
            {language === key && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
