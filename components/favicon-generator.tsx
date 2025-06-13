"use client"

import { useEffect } from "react"

export function FaviconGenerator() {
  useEffect(() => {
    // Create a canvas element to generate favicon
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")

    if (!ctx) return

    canvas.width = 32
    canvas.height = 32

    // Create a simple geometric favicon based on the logo concept
    // Background circle
    ctx.fillStyle = "#1e40af" // Deep blue
    ctx.beginPath()
    ctx.arc(16, 16, 14, 0, 2 * Math.PI)
    ctx.fill()

    // Inner circle
    ctx.fillStyle = "#0891b2" // Teal
    ctx.beginPath()
    ctx.arc(16, 16, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Center dot
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(16, 16, 3, 0, 2 * Math.PI)
    ctx.fill()

    // Convert to favicon
    const link = (document.querySelector("link[rel*='icon']") as HTMLLinkElement) || document.createElement("link")
    link.type = "image/x-icon"
    link.rel = "shortcut icon"
    link.href = canvas.toDataURL()
    document.getElementsByTagName("head")[0].appendChild(link)
  }, [])

  return null
}
