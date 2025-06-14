import type { Config } from "tailwindcss"

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
          50: "hsl(var(--primary-50, var(--primary)) / 0.05)",
          100: "hsl(var(--primary-100, var(--primary)) / 0.1)",
          200: "hsl(var(--primary-200, var(--primary)) / 0.2)",
          300: "hsl(var(--primary-300, var(--primary)) / 0.3)",
          400: "hsl(var(--primary-400, var(--primary)) / 0.4)",
          500: "hsl(var(--primary-500, var(--primary)) / 0.5)",
          600: "hsl(var(--primary-600, var(--primary)) / 0.6)",
          700: "hsl(var(--primary-700, var(--primary)) / 0.7)",
          800: "hsl(var(--primary-800, var(--primary)) / 0.8)",
          900: "hsl(var(--primary-900, var(--primary)) / 0.9)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          50: "hsl(var(--secondary-50, var(--secondary)) / 0.05)",
          100: "hsl(var(--secondary-100, var(--secondary)) / 0.1)",
          200: "hsl(var(--secondary-200, var(--secondary)) / 0.2)",
          300: "hsl(var(--secondary-300, var(--secondary)) / 0.3)",
          400: "hsl(var(--secondary-400, var(--secondary)) / 0.4)",
          500: "hsl(var(--secondary-500, var(--secondary)) / 0.5)",
          600: "hsl(var(--secondary-600, var(--secondary)) / 0.6)",
          700: "hsl(var(--secondary-700, var(--secondary)) / 0.7)",
          800: "hsl(var(--secondary-800, var(--secondary)) / 0.8)",
          900: "hsl(var(--secondary-900, var(--secondary)) / 0.9)",
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
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        "pulse-primary": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0.7)" },
          "70%": { boxShadow: "0 0 0 10px hsl(var(--primary) / 0)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "pulse-primary": "pulse-primary 2s infinite",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary) / 0.8))",
        "gradient-secondary": "linear-gradient(135deg, hsl(var(--secondary)), hsl(var(--secondary) / 0.8))",
        "gradient-accent": "linear-gradient(135deg, hsl(var(--accent)), hsl(var(--accent) / 0.8))",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
