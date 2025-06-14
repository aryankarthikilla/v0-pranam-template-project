import type { ThemeData, ThemeColors } from "./types"

export function generateCSSVariables(colors: ThemeColors): string {
  return Object.entries(colors)
    .map(([key, value]) => `  --${key}: ${value};`)
    .join("\n")
}

export function generateTailwindConfig(themeData: ThemeData): string {
  const { colors, spacing, borderRadius, boxShadow, animation, breakpoints } = themeData

  return `import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },${
          colors.success
            ? `
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },`
            : ""
        }${
          colors.warning
            ? `
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },`
            : ""
        }${
          colors.info
            ? `
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },`
            : ""
        }
      },${
        borderRadius
          ? `
      borderRadius: ${JSON.stringify(borderRadius, null, 8).replace(/"/g, "")},`
          : ""
      }${
        spacing
          ? `
      spacing: ${JSON.stringify(spacing, null, 8).replace(/"/g, "")},`
          : ""
      }${
        boxShadow
          ? `
      boxShadow: ${JSON.stringify(boxShadow, null, 8).replace(/"/g, "")},`
          : ""
      }
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },${
          animation
            ? Object.entries(animation)
                .map(
                  ([key, value]) => `
        "${key}": ${JSON.stringify(value, null, 10).replace(/"/g, "")},`,
                )
                .join("")
            : ""
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",${
          animation
            ? Object.entries(animation)
                .map(
                  ([key, value]) => `
        "${key}": "${key} ${value}",`,
                )
                .join("")
            : ""
        }
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config`
}

export function generateGlobalCSS(themeData: ThemeData): string {
  const { colors, typography } = themeData

  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
${generateCSSVariables(colors)}
    --radius: 0.5rem;
    --chart-1: 12 76% 61%;
    --chart-2: 173 58% 39%;
    --chart-3: 197 37% 24%;
    --chart-4: 43 74% 66%;
    --chart-5: 27 87% 67%;
  }

  .dark {
    /* Dark mode variables would go here */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;${
      typography?.fontFamily
        ? `
    font-family: ${typography.fontFamily};`
        : ""
    }
  }${
    typography?.headingFontFamily
      ? `
  h1, h2, h3, h4, h5, h6 {
    font-family: ${typography.headingFontFamily};
  }`
      : ""
  }
}

@layer components {
  /* Custom component styles */
  .btn-custom {
    @apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors;
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2;
    @apply disabled:pointer-events-none disabled:opacity-50;
  }
  
  .input-custom {
    @apply flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm;
    @apply ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium;
    @apply placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2;
    @apply focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50;
  }
  
  .card-custom {
    @apply rounded-lg border bg-card text-card-foreground shadow-sm;
  }
}`
}

export function applyThemeToDocument(themeData: ThemeData): void {
  const root = document.documentElement

  // Apply color variables
  Object.entries(themeData.colors).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value)
  })

  // Apply typography if available
  if (themeData.typography?.fontFamily) {
    document.body.style.fontFamily = themeData.typography.fontFamily
  }
}

export function downloadThemeFiles(themeData: ThemeData, themeName: string): void {
  // Generate files
  const tailwindConfig = generateTailwindConfig(themeData)
  const globalCSS = generateGlobalCSS(themeData)
  const themeJSON = JSON.stringify(themeData, null, 2)

  // Create and download files
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
    a.download = `${themeName}-${file.name}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}

export function getDefaultTheme(): ThemeData {
  return {
    colors: {
      background: "0 0% 100%",
      foreground: "222.2 84% 4.9%",
      card: "0 0% 100%",
      "card-foreground": "222.2 84% 4.9%",
      popover: "0 0% 100%",
      "popover-foreground": "222.2 84% 4.9%",
      primary: "221.2 83.2% 53.3%",
      "primary-foreground": "210 40% 98%",
      secondary: "210 40% 96%",
      "secondary-foreground": "222.2 47.4% 11.2%",
      muted: "210 40% 96%",
      "muted-foreground": "215.4 16.3% 46.9%",
      accent: "210 40% 96%",
      "accent-foreground": "222.2 47.4% 11.2%",
      destructive: "0 84.2% 60.2%",
      "destructive-foreground": "210 40% 98%",
      border: "214.3 31.8% 91.4%",
      input: "214.3 31.8% 91.4%",
      ring: "221.2 83.2% 53.3%",
    },
    components: {
      button: {
        borderRadius: "0.5rem",
        fontSize: "0.875rem",
        fontWeight: "500",
        padding: "0.5rem 1rem",
      },
      input: {
        borderRadius: "0.375rem",
        borderWidth: "1px",
        fontSize: "0.875rem",
        padding: "0.5rem 0.75rem",
      },
      card: {
        borderRadius: "0.5rem",
        borderWidth: "1px",
        padding: "1.5rem",
      },
    },
  }
}
