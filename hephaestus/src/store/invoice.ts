import { i18n } from '@/i18n'
const t = (key: string) => i18n.global.t(key)
// Guest drafts remain in memory. Signed-in browser caches are scoped to the verified owner.
// These caches are not a substitute for the future independent Invoice API.

import { defineStore } from 'pinia'
import { useSessionStore } from '@/store/session'
import { useSettingsStore } from '@/store/settings'
import type { InvoiceDraft, InvoiceFormState, IssuerProfile } from '@/types/invoice'
import {
  addDays,
  firstOfMonth,
  todayInAucklandIso,
  dollarsToCents,
} from '@/utils/format'

const STORAGE_KEY = 'hephaestus.invoice.drafts.v1'
const PROFILE_KEY = 'hephaestus.invoice.profile.v1'
const INITIAL_DESIGN_OWNER = '2098006004934381568'

function newId(): string {
  return `inv_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

function blankDraft(now: string): InvoiceDraft {
  return {
    id: newId(),
    invoiceNumber: '',
    issueDate: now,
    dueDate: addDays(now, 15),
    serviceStart: firstOfMonth(now),
    serviceEnd: now,
    fromName: '',
    fromAddress: '',
    billTo: '',
    billToCountry: 'New Zealand',
    description: 'Installation, repair and replacement services',
    amountCents: 0,
    terms: 'Payment is due within 15 days.',
    phone: '',
    state: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

function load(owner: string): { drafts: InvoiceDraft[]; activeId: string | null } {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}.${owner}`)
    if (!raw) return { drafts: [], activeId: null }
    const parsed = JSON.parse(raw)
    return {
      drafts: Array.isArray(parsed.drafts) ? parsed.drafts : [],
      activeId: parsed.activeId ?? null,
    }
  } catch {
    return { drafts: [], activeId: null }
  }
}

function loadProfile(owner: string): IssuerProfile {
  try {
    const raw = localStorage.getItem(`${PROFILE_KEY}.${owner}`)
    if (!raw) return defaultProfile(owner)
    const defaults = defaultProfile(owner)
    const saved = { ...defaults, ...JSON.parse(raw) } as IssuerProfile
    if (owner !== INITIAL_DESIGN_OWNER) return saved
    return {
      fromName: saved.fromName || defaults.fromName,
      fromAddress: saved.fromAddress || defaults.fromAddress,
      phone: saved.phone || defaults.phone,
      defaultBillTo: saved.defaultBillTo || defaults.defaultBillTo,
      defaultBillToCountry: saved.defaultBillToCountry || defaults.defaultBillToCountry,
      defaultDescription: saved.defaultDescription || defaults.defaultDescription,
      defaultTerms: saved.defaultTerms || defaults.defaultTerms,
    }
  } catch {
    return defaultProfile(owner)
  }
}

function defaultProfile(owner = ''): IssuerProfile {
  if (owner === INITIAL_DESIGN_OWNER) {
    return {
      fromName: 'Jian Qi',
      fromAddress: '393 Mount Albert Rd\nMount Roskill\nAuckland 1041\nNew Zealand',
      phone: '+64 021 183 3385',
      defaultBillTo: 'Aimer Pay (NZ) Limited',
      defaultBillToCountry: 'New Zealand',
      defaultDescription: 'Installation, repair and replacement services',
      defaultTerms: 'Payment is due within 15 days.',
    }
  }
  return {
    fromName: '',
    fromAddress: '',
    phone: '',
    defaultBillTo: '',
    defaultBillToCountry: 'New Zealand',
    defaultDescription: 'Installation, repair and replacement services',
    defaultTerms: 'Payment is due within 15 days.',
  }
}

interface State {
  owner: string
  drafts: InvoiceDraft[]
  activeId: string | null
  profile: IssuerProfile
}

export const useInvoiceStore = defineStore('invoice', {
  state: (): State => {
    const owner = useSessionStore().ownerId
    const persisted = owner ? load(owner) : { drafts: [], activeId: null }
    const profile = owner ? loadProfile(owner) : defaultProfile()
    return {
      owner,
      drafts: persisted.drafts,
      activeId: persisted.activeId,
      profile,
    }
  },
  getters: {
    activeDraft(state): InvoiceDraft | null {
      return state.drafts.find((d) => d.id === state.activeId) ?? null
    },
    sortedDrafts(state): InvoiceDraft[] {
      return [...state.drafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    },
  },
  actions: {
    switchOwner(owner: string) {
      if (this.owner === owner) return
      this.owner = owner
      const saved = owner ? load(owner) : { drafts: [], activeId: null }
      this.drafts = saved.drafts
      this.activeId = saved.activeId
      this.profile = owner ? loadProfile(owner) : defaultProfile()
    },
    persist() {
      if (!this.owner || this.owner !== useSessionStore().ownerId) return
      try {
        localStorage.setItem(
          `${STORAGE_KEY}.${this.owner}`,
          JSON.stringify({ drafts: this.drafts, activeId: this.activeId }),
        )
      } catch {
        throw new Error(t('ui.localSaveFailedCheckBrowserStorageAndRetry'))
      }
    },
    persistProfile() {
      if (!this.owner || this.owner !== useSessionStore().ownerId) return
      try {
        localStorage.setItem(`${PROFILE_KEY}.${this.owner}`, JSON.stringify(this.profile))
      } catch {
        throw new Error(t('ui.couldNotSaveIssuerDetailsCheckBrowserStorage'))
      }
    },
    createDraft(form?: Partial<InvoiceFormState>): InvoiceDraft {
      const now = todayInAucklandIso()
      const draft = blankDraft(now)
      if (this.profile.fromName) {
        draft.fromName = this.profile.fromName
        draft.fromAddress = this.profile.fromAddress
        draft.phone = this.profile.phone
        draft.billTo = this.profile.defaultBillTo
        draft.billToCountry = this.profile.defaultBillToCountry
        draft.description = this.profile.defaultDescription
        draft.terms = this.profile.defaultTerms
      }
      Object.assign(draft, formToDraftOverrides(form))
      this.drafts.push(draft)
      const previousActive = this.activeId
      this.activeId = draft.id
      try { this.persist() } catch (e) {
        this.drafts = this.drafts.filter(d => d.id !== draft.id)
        this.activeId = previousActive
        throw e
      }
      return draft
    },
    updateDraft(id: string, patch: Partial<InvoiceDraft>): InvoiceDraft | null {
      const draft = this.drafts.find((d) => d.id === id)
      if (!draft) return null
      if (draft.state !== 'draft') throw new Error(t('ui.finalisedOrVoidInvoicesCannotBeEditedDuplicateAsANewDraft'))
      const previous = { ...draft }
      Object.assign(draft, patch, { updatedAt: new Date().toISOString() })
      try { this.persist() } catch (e) { Object.assign(draft, previous); throw e }
      return draft
    },
    setActive(id: string | null) {
      const previous = this.activeId
      this.activeId = id
      try { this.persist() } catch (e) { this.activeId = previous; throw e }
    },
    duplicate(id: string): InvoiceDraft | null {
      const src = this.drafts.find((d) => d.id === id)
      if (!src) return null
      const copy: InvoiceDraft = {
        ...src,
        id: newId(),
        invoiceNumber: '',
        voidReason: undefined,
        state: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      this.drafts.push(copy)
      const previousActive = this.activeId
      this.activeId = copy.id
      try { this.persist() } catch (e) {
        this.drafts = this.drafts.filter(d => d.id !== copy.id)
        this.activeId = previousActive
        throw e
      }
      return copy
    },
    finalise(id: string) {
      const d = this.drafts.find((x) => x.id === id)
      if (!d || d.state !== 'draft') return
      this.updateDraft(id, { state: 'finalised' })
    },
    void(id: string, reason: string) {
      const d = this.drafts.find((x) => x.id === id)
      if (!d) return
      if (!reason.trim()) throw new Error('A reason is required.')
      const previous = { ...d }
      d.state = 'void'
      d.voidReason = reason
      d.updatedAt = new Date().toISOString()
      try { this.persist() } catch (e) { Object.assign(d, previous); throw e }
    },
    delete(id: string) {
      const draft = this.drafts.find(d => d.id === id)
      if (draft && draft.state !== 'draft') throw new Error('Only drafts can be deleted. Void an issued invoice instead.')
      const previous = this.drafts
      const previousActive = this.activeId
      this.drafts = this.drafts.filter((d) => d.id !== id)
      if (this.activeId === id) this.activeId = null
      try { this.persist() } catch (e) { this.drafts = previous; this.activeId = previousActive; throw e }
    },
    saveProfile(patch: Partial<IssuerProfile>) {
      const previous = { ...this.profile }
      Object.assign(this.profile, patch)
      try { this.persistProfile() } catch (e) { this.profile = previous; throw e }
    },
  },
})

function formToDraftOverrides(form?: Partial<InvoiceFormState>): Partial<InvoiceDraft> {
  if (!form) return {}
  const { amountInput, ...fields } = form
  const patch: Partial<InvoiceDraft> = Object.fromEntries(Object.entries(fields).filter(([,value]) => value !== undefined))
  if (amountInput !== undefined) {
    const cents = Number(dollarsToCents(amountInput) || 0)
    if (!Number.isSafeInteger(cents)) throw new Error('Invoice amount exceeds the supported range.')
    patch.amountCents = cents
  }
  return patch
}
