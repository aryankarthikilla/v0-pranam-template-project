export type Language = "en" | "te"

export const languages: Record<Language, { name: string; nativeName: string; flag: string }> = {
  en: {
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
  },
  te: {
    name: "Telugu",
    nativeName: "తెలుగు",
    flag: "🇮🇳",
  },
}

export const defaultLanguage: Language = "en"

export function getLanguageFromPath(pathname: string): Language {
  const segments = pathname.split("/")
  const langSegment = segments[1]
  return langSegment in languages ? (langSegment as Language) : defaultLanguage
}

export function removeLanguageFromPath(pathname: string): string {
  const segments = pathname.split("/")
  if (segments[1] in languages) {
    return "/" + segments.slice(2).join("/")
  }
  return pathname
}

export function addLanguageToPath(pathname: string, language: Language): string {
  const cleanPath = removeLanguageFromPath(pathname)
  if (language === defaultLanguage) {
    return cleanPath
  }
  return `/${language}${cleanPath}`
}
