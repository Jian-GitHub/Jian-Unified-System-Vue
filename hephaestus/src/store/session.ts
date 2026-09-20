// Backend session and resource ETag cache. Credentials are managed by Apollo.

import { defineStore } from 'pinia'
import { fetchSession, logout as apiLogout } from '@/api/session'
import { useSettingsStore, type Language } from '@/store/settings'
import type { SessionInfo } from '@/types/session'
import { formatApolloPersonName, parseApolloDisplayName } from '@/utils/personName'

interface State {
  ownerId: string
  displayName: string
  displayNameLocale: Language
  givenName: string
  middleName: string
  familyName: string
  csrfToken: string
  expiresAt: string
  loaded: boolean
  etags: Record<string, string>
}

export const useSessionStore = defineStore('session', {
  state: (): State => ({
    ownerId: '',
    displayName: '',
    displayNameLocale: 'en',
    givenName: '',
    middleName: '',
    familyName: '',
    csrfToken: '',
    expiresAt: '',
    loaded: false,
    etags: {},
  }),
  getters: {
    isAuthenticated: (s): boolean => !!s.csrfToken && !!s.ownerId && Date.parse(s.expiresAt) > Date.now(),
    localizedDisplayName: (s) => (language: Language): string => {
      const explicit = { givenName: s.givenName, middleName: s.middleName, familyName: s.familyName }
      if (explicit.givenName || explicit.middleName || explicit.familyName) return formatApolloPersonName(explicit, language)
      const parsed = parseApolloDisplayName(s.displayName, s.displayNameLocale)
      return parsed ? formatApolloPersonName(parsed, language) : s.displayName
    },
  },
  actions: {
    async bootstrap(force = false) {
      if (this.loaded && !force) return
      try {
        const info = await fetchSession()
        if (info) this.applySession(info)
        else this.clear()
      } catch (e) {
        this.clear()
        throw e
      } finally {
        this.loaded = true
      }
    },
    applySession(info: SessionInfo) {
      this.ownerId = info.owner_id
      this.displayName = info.display_name
      this.displayNameLocale = info.language ?? useSettingsStore().language
      this.givenName = info.given_name ?? info.name?.given_name ?? info.name?.givenName ?? ''
      this.middleName = info.middle_name ?? info.name?.middle_name ?? info.name?.middleName ?? ''
      this.familyName = info.family_name ?? info.name?.family_name ?? info.name?.familyName ?? ''
      this.csrfToken = info.csrf_token
      this.expiresAt = info.expires_at
      this.loaded = true
    },
    async signOut() {
      await apiLogout()
      this.clear()
    },
    clear() {
      this.ownerId = ''
      this.displayName = ''
      this.displayNameLocale = 'en'
      this.givenName = ''
      this.middleName = ''
      this.familyName = ''
      this.csrfToken = ''
      this.expiresAt = ''
      this.etags = {}
    },
    rememberEtag(url: string, etag: string) {
      if (!url) return
      this.etags[url] = etag
    },
    etagFor(url: string): string | undefined {
      return this.etags[url]
    },
  },
})
