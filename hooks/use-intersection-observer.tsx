"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface UseIntersectionObserverProps {
  threshold?: number
  root?: Element | null
  rootMargin?: string
}

export function useIntersectionObserver({
  threshold = 0,
  root = null,
  rootMargin = "0%",
}: UseIntersectionObserverProps = {}): [React.RefObject<HTMLDivElement>, boolean] {
  const [entry, setEntry] = useState<IntersectionObserverEntry>()
  const [isIntersecting, setIsIntersecting] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  const frozen = entry?.isIntersecting && !isIntersecting

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry)
    setIsIntersecting(entry.isIntersecting)
  }

  useEffect(() => {
    const node = elementRef?.current
    const hasIOSupport = !!window.IntersectionObserver

    if (!hasIOSupport || frozen || !node) return

    const observerParams = { threshold, root, rootMargin }
    const observer = new IntersectionObserver(updateEntry, observerParams)

    observer.observe(node)

    return () => observer.disconnect()
  }, [elementRef, threshold, root, rootMargin, frozen])

  return [elementRef, isIntersecting]
}
