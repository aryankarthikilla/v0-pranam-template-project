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

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 32, 32)
    gradient.addColorStop(0, "#1e40af") // Deep blue
    gradient.addColorStop(1, "#0891b2") // Teal

    // Background circle
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(16, 16, 14, 0, 2 * Math.PI)
    ctx.fill()

    // Inner white circle
    ctx.fillStyle = "#ffffff"
    ctx.beginPath()
    ctx.arc(16, 16, 8, 0, 2 * Math.PI)
    ctx.fill()

    // Center colored dot
    ctx.fillStyle = "#0891b2"
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
