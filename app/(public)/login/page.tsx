"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function OldLoginPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to new auth structure
    router.replace("/auth/login")
  }, [router])

  return null
}
