import type { Language } from '@/store/settings'

export interface PersonName {
  givenName: string
  middleName: string
  familyName: string
}

const EAST_ASIAN_LANGUAGES: Language[] = ['zh', 'ja', 'ko']

/** Mirrors Apollo's locale-sensitive name order exactly. */
export function formatApolloPersonName(name: PersonName, locale: Language): string {
  const givenName = name.givenName.trim()
  const middleName = name.middleName.trim()
  const familyName = name.familyName.trim()
  if (!givenName && !middleName && !familyName) return ''

  if (EAST_ASIAN_LANGUAGES.includes(locale)) {
    return middleName
      ? [familyName, middleName, givenName].filter(Boolean).join(' ')
      : `${familyName}${givenName}`
  }
  return [givenName, middleName, familyName].filter(Boolean).join(' ')
}

/**
 * Older session responses contain only display_name. Preserve one-part names;
 * spaced names can still follow Apollo when the interface language changes.
 */
export function parseApolloDisplayName(displayName: string, sourceLocale: Language): PersonName | null {
  const parts = displayName.trim().split(/\s+/).filter(Boolean)
  if (parts.length < 2) return null
  if (EAST_ASIAN_LANGUAGES.includes(sourceLocale)) {
    return { familyName: parts[0], middleName: parts.slice(1, -1).join(' '), givenName: parts.at(-1) ?? '' }
  }
  return { givenName: parts[0], middleName: parts.slice(1, -1).join(' '), familyName: parts.at(-1) ?? '' }
}
