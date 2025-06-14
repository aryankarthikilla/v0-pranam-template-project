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
      en: "Language",
      te: "భాష",
    },
    currentLanguage: {
      en: "Current: English",
      te: "ప్రస్తుతం: తెలుగు",
    },
  }

  const currentLanguageData = languages[language]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
          <span className="mr-2">{currentLanguageData.flag}</span>
          <span className="hidden sm:inline">{currentLanguageData.nativeName}</span>
          <Languages className="ml-2 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-center">
          {t("selectLanguage", translations.selectLanguage)}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {Object.entries(languages).map(([key, langData]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLanguage(key as Language)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{langData.flag}</span>
              <div className="flex flex-col">
                <span className="font-medium">{langData.nativeName}</span>
                <span className="text-xs text-muted-foreground">{langData.name}</span>
              </div>
            </div>
            {language === key && <Check className="h-4 w-4 text-green-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
