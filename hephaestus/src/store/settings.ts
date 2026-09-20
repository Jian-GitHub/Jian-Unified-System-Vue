// UI preferences. Persisted to localStorage so they survive a reload.

import { defineStore } from 'pinia'

type Theme = 'auto' | 'light' | 'dark'
export type Language = 'en' | 'zh' | 'ja' | 'ko'
export type Currency = 'NZD' | 'AUD' | 'USD' | 'EUR' | 'CNY'

interface State {
  language: Language
  theme: Theme
  currency: Currency
  sidebarCollapsed: boolean
  defaultRatePercent: number
  defaultDateFormat: 'iso' | 'dmy' | 'mdy' | 'excel'
}

const STORAGE_KEY = 'hephaestus.settings.v1'
const LANGUAGES: Language[] = ['en', 'zh', 'ja', 'ko']
const CURRENCIES: Currency[] = ['NZD', 'AUD', 'USD', 'EUR', 'CNY']

function load(): State {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as Partial<State>
    const state = { ...defaultState(), ...parsed }
    if (!LANGUAGES.includes(state.language)) state.language = 'en'
    if (!CURRENCIES.includes(state.currency)) state.currency = 'NZD'
    if (!['auto', 'light', 'dark'].includes(state.theme)) state.theme = 'auto'
    state.sidebarCollapsed = Boolean(state.sidebarCollapsed)
    return state
  } catch {
    return defaultState()
  }
}

function defaultState(): State {
  return {
    language: 'en',
    theme: 'auto',
    currency: 'NZD',
    sidebarCollapsed: false,
    defaultRatePercent: 20,
    defaultDateFormat: 'iso',
  }
}

export const useSettingsStore = defineStore('settings', {
  state: (): State => load(),
  actions: {
    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.$state))
      } catch {
        // ignore
      }
    },
    setLanguage(lang: Language) {
      this.language = lang
      this.persist()
    },
    setTheme(theme: Theme) {
      this.theme = theme
      this.persist()
    },
    setCurrency(currency: Currency) {
      this.currency = currency
      this.persist()
    },
    setSidebarCollapsed(collapsed: boolean) {
      this.sidebarCollapsed = collapsed
      this.persist()
    },
    setDefaultRate(p: number) {
      this.defaultRatePercent = p
      this.persist()
    },
    setDefaultRatePercent(p: number) {
      this.defaultRatePercent = p
      this.persist()
    },
    setDefaultDateFormat(f: State['defaultDateFormat']) {
      this.defaultDateFormat = f
      this.persist()
    },
  },
})
