"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Check, Globe } from "lucide-react"
import { useI18n } from "@/lib/i18n/context"
import { languages, type Language } from "@/lib/i18n"

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Globe className="h-4 w-4" />
          <span className="sr-only">Switch language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-16">
        {Object.entries(languages).map(([key]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLanguage(key as Language)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="font-medium">{key === "en" ? "EN" : "తె"}</span>
            {language === key && <Check className="h-3 w-3 text-green-600" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
