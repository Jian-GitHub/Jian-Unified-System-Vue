// Formatting helpers. All money values coming from the API are decimal-string
// minor units. Keep decimal input and displayed API totals exact; chart values may
// use Number where required by the plotting library.

import { ref } from 'vue'
import type { Currency, Language } from '@/store/settings'

export const displayCurrency = ref<Currency>('NZD')
export const displayLanguage = ref<Language>('en')

export function configureMoneyFormat(currency: Currency, language: Language): void {
  displayCurrency.value = currency
  displayLanguage.value = language
}

const languageLocales: Record<Language, string> = {
  en: 'en-NZ',
  zh: 'zh-CN',
  ja: 'ja-JP',
  ko: 'ko-KR',
}

export function centsToDollars(cents: string | null | undefined): number {
  if (cents === null || cents === undefined || cents === '') return 0
  const n = Number(cents)
  if (!Number.isFinite(n)) return 0
  return n / 100
}

export function dollarsToCents(input: string | number): string {
  const cleaned = String(input ?? '').replace(/[,\s]/g, '')
  if (cleaned === '' || cleaned === '-') return ''
  const match = /^([+-]?)(\d*)(?:\.(\d*))?$/.exec(cleaned)
  if (!match || (!match[2] && !match[3])) return ''
  const fraction = match[3] ?? ''
  let cents = BigInt(match[2] || '0') * 100n + BigInt(fraction.padEnd(2, '0').slice(0, 2))
  if (Number(fraction[2] ?? '0') >= 5) cents += 1n
  return String(match[1] === '-' ? -cents : cents)
}

export function formatNzd(cents: string | number | null | undefined, opts: { signed?: boolean } = {}): string {
  if (typeof cents === 'string' && /^-?\d+$/.test(cents)) {
    const amount = BigInt(cents)
    const absolute = amount < 0n ? -amount : amount
    const whole = new Intl.NumberFormat(languageLocales[displayLanguage.value]).format(absolute / 100n)
    const sign = amount < 0n ? '-' : opts.signed && amount > 0n ? '+' : ''
    const formatted = new Intl.NumberFormat(languageLocales[displayLanguage.value], {
      style: 'currency',
      currency: displayCurrency.value,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).formatToParts(0)
    const currency = formatted.find(part => part.type === 'currency')?.value ?? displayCurrency.value
    return `${sign}${currency}${whole}.${String(absolute % 100n).padStart(2, '0')}`
  }
  const value = typeof cents === 'number' ? cents : centsToDollars(cents)
  const sign = opts.signed && value > 0 ? '+' : ''
  return `${sign}${new Intl.NumberFormat(languageLocales[displayLanguage.value], {
    style: 'currency',
    currency: displayCurrency.value,
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)}`
}

export function formatCurrencyAmount(value: number): string {
  return new Intl.NumberFormat(languageLocales[displayLanguage.value], {
    style: 'currency',
    currency: displayCurrency.value,
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatPercent(rateBps: number): string {
  return `${(rateBps / 100).toFixed(2).replace(/\.?0+$/, '')}%`
}

export function bpsFromPercent(percent: number | string): number {
  const num = Number(percent)
  if (!Number.isFinite(num)) return 2000
  return Math.max(0, Math.min(10000, Math.round(num * 100)))
}

export function minutesToHours(minutes: number): string {
  if (!Number.isFinite(minutes)) return '—'
  return `${(minutes / 60).toFixed(1)}h`
}

/** Average over all work in the reporting period, including unsettled work. */
export function formatHourlyRate(cents: string | null | undefined, totalMinutes: number): string {
  if (cents == null || cents === '' || !Number.isFinite(totalMinutes) || totalMinutes <= 0) return '—'
  const hourlyCents = Math.round(Number(cents) * 60 / totalMinutes)
  if (!Number.isFinite(hourlyCents)) return '—'
  return `${formatNzd(String(hourlyCents))}/h`
}

export function formatDate(iso: string | undefined | null, fallback = '—'): string {
  if (!iso) return fallback
  // The API returns strict YYYY-MM-DD business dates.
  const parts = iso.slice(0, 10).split('-')
  if (parts.length !== 3) return iso
  const date = new Date(Date.UTC(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2])))
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'UTC',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function todayInAucklandIso(): string {
  // Use the date in Pacific/Auckland by reading the local Pacific date components.
  const now = new Date()
  const parts = new Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const y = parts.find((p) => p.type === 'year')?.value ?? '1970'
  const m = parts.find((p) => p.type === 'month')?.value ?? '01'
  const d = parts.find((p) => p.type === 'day')?.value ?? '01'
  return `${y}-${m}-${d}`
}

export function addDays(isoDate: string, days: number): string {
  if (!isoDate) return ''
  const date = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return ''
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function firstOfMonth(isoDate: string): string {
  return `${isoDate.slice(0, 7)}-01`
}

// Build a unique key usable as Idempotency-Key (16-128 printable ASCII).
// We only use the public, no-permission Web Crypto API surface; some embedded
// browsers expose `crypto` but not `randomUUID` or `subtle`, so fall back to
// a time+randomness string that's still well within the 128-char limit.
export function makeIdempotencyKey(): string {
  const c: Crypto | undefined = typeof globalThis !== 'undefined'
    ? (globalThis as { crypto?: Crypto }).crypto
    : undefined
  if (c && typeof c.randomUUID === 'function') {
    return c.randomUUID()
  }
  if (c && typeof c.getRandomValues === 'function') {
    const bytes = new Uint8Array(16)
    c.getRandomValues(bytes)
    // 32 hex chars = 16 random bytes, well inside the printable-ASCII window.
    let out = ''
    for (let i = 0; i < bytes.length; i++) {
      out += bytes[i].toString(16).padStart(2, '0')
    }
    return out
  }
  // Last-resort: time + Math.random is still 16+ printable ASCII chars.
  return `hep${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
}

// CSV / blob download helper. The income export endpoint returns the file body
// directly (string); the invoice PDF pipeline produces a Blob. We accept both.
export function downloadBlob(content: Blob | string, filename: string, mime: string): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 0)
}

export function isPrintableAscii(s: string, min = 16, max = 128): boolean {
  if (s.length < min || s.length > max) return false
  return /^[\x20-\x7E]+$/.test(s)
}
