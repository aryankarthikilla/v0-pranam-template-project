import { format, formatDistanceToNow, isValid, parseISO } from "date-fns"

/**
 * Format date to a readable string
 */
export function formatDate(date: Date | string, formatString = "MMM dd, yyyy"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) return "Invalid date"
  return format(dateObj, formatString)
}

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) return "Invalid date"
  return formatDistanceToNow(dateObj, { addSuffix: true })
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) return false
  const today = new Date()
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  )
}

/**
 * Check if date is yesterday
 */
export function isYesterday(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  if (!isValid(dateObj)) return false
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    dateObj.getDate() === yesterday.getDate() &&
    dateObj.getMonth() === yesterday.getMonth() &&
    dateObj.getFullYear() === yesterday.getFullYear()
  )
}

/**
 * Get start of day
 */
export function getStartOfDay(date: Date = new Date()): Date {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  return startOfDay
}

/**
 * Get end of day
 */
export function getEndOfDay(date: Date = new Date()): Date {
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

/**
 * Get age from birth date
 */
export function getAge(birthDate: Date | string): number {
  const birth = typeof birthDate === "string" ? parseISO(birthDate) : birthDate
  if (!isValid(birth)) return 0
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}
