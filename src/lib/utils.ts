import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, locale = 'en', formatStr = 'MMM d, yyyy') {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, formatStr, { locale: locale === 'ar' ? ar : enUS })
}

export function formatTime(date: string | Date, locale = 'en') {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'h:mm a', { locale: locale === 'ar' ? ar : enUS })
}

export function formatDateTime(date: string | Date, locale = 'en') {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'MMM d, yyyy • h:mm a', { locale: locale === 'ar' ? ar : enUS })
}

export function formatRelative(date: string | Date, locale = 'en') {
  const d = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: locale === 'ar' ? ar : enUS })
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getLocaleDateLabel(date: string | Date, locale = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isToday(d)) return locale === 'ar' ? 'اليوم' : 'Today'
  if (isTomorrow(d)) return locale === 'ar' ? 'غداً' : 'Tomorrow'
  return formatDate(d, locale)
}

export function minutesToHours(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}
