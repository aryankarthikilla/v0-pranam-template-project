"use client"

import { useState } from "react"

export function useCopyToClipboard(): [boolean, (text: string) => Promise<boolean>] {
  const [isCopied, setIsCopied] = useState(false)

  const copyToClipboard = async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported")
      return false
    }

    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
      return true
    } catch (error) {
      console.warn("Copy failed", error)
      setIsCopied(false)
      return false
    }
  }

  return [isCopied, copyToClipboard]
}
