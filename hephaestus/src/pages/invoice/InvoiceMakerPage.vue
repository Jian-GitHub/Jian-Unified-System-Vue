<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

import ErrorBanner from '@/components/common/ErrorBanner.vue'

import { useInvoiceStore } from '@/store/invoice'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'
import {
  invoiceEmailSubject,
  invoiceEmailText,
  renderInvoicePdf,
} from '@/api/invoice'
import type { InvoiceDraft, InvoiceFormState } from '@/types/invoice'
import { downloadBlob, todayInAucklandIso, dollarsToCents, formatCurrencyAmount } from '@/utils/format'

const { t } = useI18n()
const route = useRoute()
const store = useInvoiceStore()

const today = todayInAucklandIso()

function regenNumber(): string {
  const d = new Date()
  const yy = d.getFullYear().toString().slice(-2)
  const stamp = Math.floor(d.getTime() % 1e6)
    .toString()
    .padStart(6, '0')
  return `${yy}-${stamp}`
}

const form = ref<InvoiceFormState>({
  invoiceNumber: '',
  issueDate: today,
  dueDate: '',
  serviceStart: '',
  serviceEnd: '',
  fromName: '',
  fromAddress: '',
  billTo: '',
  billToCountry: 'New Zealand',
  description: '',
  amountInput: '',
  terms: '',
  phone: '',
})

const error = ref<string | null>(null)
const saving = ref(false)

let activeId: string | null = null
const savedForm = ref('')
const readOnly = computed(() => !!store.activeDraft && store.activeDraft.state !== 'draft')
const confirmDiscard = useUnsavedChanges(computed(() => !readOnly.value && !!savedForm.value && JSON.stringify(form.value) !== savedForm.value))

function loadInitial() {
  const id = route.query.id as string | undefined
  if (id) {
    const draft = store.drafts.find((d) => d.id === id)
    if (draft) {
      applyDraft(draft)
      activeId = draft.id
      return
    }
  }
  const created = store.createDraft()
  applyDraft(created)
  activeId = created.id
}

function applyDraft(d: InvoiceDraft) {
  store.setActive(d.id)
  activeId = d.id
  form.value = {
    invoiceNumber: d.invoiceNumber || '',
    issueDate: d.issueDate || today,
    dueDate: d.dueDate || '',
    serviceStart: d.serviceStart || '',
    serviceEnd: d.serviceEnd || '',
    fromName: d.fromName || '',
    fromAddress: d.fromAddress || '',
    billTo: d.billTo || '',
    billToCountry: d.billToCountry || 'New Zealand',
    description: d.description || '',
    amountInput: d.amountCents > 0 ? (d.amountCents / 100).toFixed(2) : '',
    terms: d.terms || '',
    phone: d.phone || '',
  }
  savedForm.value = JSON.stringify(form.value)
}

watch(() => route.query.id, () => {
  try { loadInitial() } catch (e: any) { error.value = e?.message ?? t('ui.requestFailed') }
}, { immediate: true })

const amountCents = computed(() => Number(dollarsToCents(form.value.amountInput) || 0))
const amountNumber = computed(() => Number.isSafeInteger(amountCents.value) ? amountCents.value / 100 : 0)

const amountError = computed(() => {
  if (amountNumber.value <= 0) return t('invoice.validation.amount')
  return ''
})
const datesError = computed(() => {
  const dates = [form.value.issueDate, form.value.dueDate, form.value.serviceStart, form.value.serviceEnd]
  if (dates.some(value => !/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0, 10) !== value) || form.value.dueDate < form.value.issueDate)
    return t('invoice.validation.dates')
  if (form.value.serviceEnd < form.value.serviceStart) return t('invoice.status.serviceRange')
  return ''
})
const numberError = computed(() => {
  if (!/^\d+([\-.\d]*)?$/.test(form.value.invoiceNumber || '')) return t('invoice.validation.number')
  return ''
})

const canDownload = computed(() => !amountError.value && !datesError.value && !numberError.value)

const formattedAmount = computed(() => formatCurrencyAmount(amountNumber.value))

function formatDate(iso: string, includeYear = true): string {
  if (!iso) return '—'
  const date = new Date(`${iso}T12:00:00Z`)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat('en-NZ', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(date)
}

const servicePeriod = computed(() => {
  const { serviceStart, serviceEnd } = form.value
  if (!serviceStart || !serviceEnd) return '—'
  const sameYear = serviceStart.slice(0, 4) === serviceEnd.slice(0, 4)
  return `${formatDate(serviceStart, !sameYear)} – ${formatDate(serviceEnd)}`
})

function regen() {
  form.value.invoiceNumber = regenNumber()
  ElMessage.success(t('invoice.status.newNumber'))
}

async function newInvoice() {
  if (!await confirmDiscard()) return
  try {
    const created = store.createDraft()
    applyDraft(created)
    ElMessage.success(t('invoice.status.newInvoice'))
  } catch (e: any) { error.value = e?.message ?? t('ui.requestFailed') }
}

function persistDraft(state: 'draft' | 'finalised' = 'draft') {
  if (!activeId) throw new Error(t('invoice.actions.new'))
  if (!Number.isSafeInteger(amountCents.value)) throw new Error(t('invoice.validation.amount'))
  store.updateDraft(activeId, {
    invoiceNumber: form.value.invoiceNumber,
    issueDate: form.value.issueDate,
    dueDate: form.value.dueDate,
    serviceStart: form.value.serviceStart,
    serviceEnd: form.value.serviceEnd,
    fromName: form.value.fromName,
    fromAddress: form.value.fromAddress,
    billTo: form.value.billTo,
    billToCountry: form.value.billToCountry,
    description: form.value.description,
    amountCents: amountCents.value,
    terms: form.value.terms,
    phone: form.value.phone,
    state,
  })
  savedForm.value = JSON.stringify(form.value)
}

function saveDraft() {
  if (readOnly.value || saving.value) return
  saving.value = true
  error.value = null
  try {
    persistDraft('draft')
    ElMessage.success(t('invoice.saved.draftSaved'))
  } catch (e: any) {
    error.value = e?.message ?? t('ui.requestFailed')
  } finally {
    saving.value = false
  }
}

function downloadPdf() {
  if (!canDownload.value) {
    ElMessage.warning(t('invoice.status.amountRequired'))
    return
  }
  // Build an in-memory draft snapshot so the PDF always reflects the form.
  const snapshot: InvoiceDraft = {
    id: activeId || 'preview',
    invoiceNumber: form.value.invoiceNumber,
    issueDate: form.value.issueDate,
    dueDate: form.value.dueDate,
    serviceStart: form.value.serviceStart,
    serviceEnd: form.value.serviceEnd,
    fromName: form.value.fromName,
    fromAddress: form.value.fromAddress,
    billTo: form.value.billTo,
    billToCountry: form.value.billToCountry,
    description: form.value.description,
    amountCents: amountCents.value,
    terms: form.value.terms,
    phone: form.value.phone,
    state: 'draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  error.value = null
  try {
    const blob = renderInvoicePdf(snapshot)
    if (activeId && !readOnly.value) persistDraft('finalised')
    downloadBlob(blob, `invoice-${form.value.invoiceNumber || 'draft'}.pdf`, 'application/pdf')
    ElMessage.success(t('invoice.status.pdfDownloaded'))
  } catch (e: any) { error.value = e?.message ?? t('ui.requestFailed') }
}

async function copyEmail() {
  const snapshot = { ...form.value }
  const subject = invoiceEmailSubject({
    ...snapshot,
    id: activeId || '',
    amountCents: 0,
    state: 'draft',
    createdAt: '',
    updatedAt: '',
  } as InvoiceDraft)
  const body = invoiceEmailText({
    ...snapshot,
    id: activeId || '',
    amountCents: 0,
    state: 'draft',
    createdAt: '',
    updatedAt: '',
  } as InvoiceDraft)
  try {
    await navigator.clipboard.writeText(`${subject}\n\n${body}`)
    ElMessage.success(t('invoice.status.emailCopied'))
  } catch {
    ElMessage.warning('Copy failed.')
  }
}
</script>

<template>
  <div class="invoice-maker-page">
    <main class="invoice-body">
      <aside class="form-pane">
        <header class="form-header">
          <div>
            <p class="eyebrow">{{ t('invoice.title') }}</p>
            <h1>{{ t('invoice.actions.new') }}</h1>
            <p class="form-intro">{{ t('ui.invoiceIntro') }}</p>
          </div>
          <el-button text class="new-action" @click="newInvoice">＋ {{ t('invoice.actions.new') }}</el-button>
        </header>

        <ErrorBanner :message="error || amountError || datesError || numberError" />
        <p v-if="readOnly">{{ t('invoice.readOnly') }}</p>

        <el-form :disabled="readOnly" @submit.prevent>
        <section class="editor-section">
          <div class="section-heading"><span>01</span><h2>{{ t('invoice.form.invoice') }}</h2></div>
          <div class="grid">
            <label class="wide">
              <span>{{ t('invoice.form.invoiceNumber') }}</span>
              <el-input v-model="form.invoiceNumber">
                <template #append>
                  <el-button text @click="regen">{{ t('invoice.form.generateNew') }}</el-button>
                </template>
              </el-input>
            </label>
            <label>
              <span>{{ t('invoice.form.issueDate') }}</span>
              <el-input v-model="form.issueDate" type="date" />
            </label>
            <label>
              <span>{{ t('invoice.form.dueDate') }}</span>
              <el-input v-model="form.dueDate" type="date" />
            </label>
            <label>
              <span>{{ t('invoice.form.serviceStart') }}</span>
              <el-input v-model="form.serviceStart" type="date" />
            </label>
            <label>
              <span>{{ t('invoice.form.serviceEnd') }}</span>
              <el-input v-model="form.serviceEnd" type="date" />
            </label>
          </div>
        </section>

        <section class="editor-section">
          <div class="section-heading"><span>02</span><h2>{{ t('invoice.form.parties') }}</h2></div>
          <div class="grid">
            <label>
              <span>{{ t('invoice.form.fromName') }}</span>
              <el-input v-model="form.fromName" />
            </label>
            <label class="wide">
              <span>{{ t('invoice.form.fromAddress') }}</span>
              <el-input v-model="form.fromAddress" type="textarea" :rows="2" />
            </label>
            <label>
              <span>{{ t('invoice.form.billTo') }}</span>
              <el-input v-model="form.billTo" />
            </label>
            <label>
              <span>{{ t('invoice.form.phone') }}</span>
              <el-input v-model="form.phone" />
            </label>
            <label>
              <span>{{ t('invoice.form.billToCountry') }}</span>
              <el-input v-model="form.billToCountry" />
            </label>
          </div>
        </section>

        <section class="editor-section">
          <div class="section-heading"><span>03</span><h2>{{ t('invoice.form.service') }}</h2></div>
          <div class="grid">
            <label class="wide">
              <span>{{ t('invoice.form.description') }}</span>
              <el-input v-model="form.description" type="textarea" :rows="3" />
            </label>
            <label>
              <span>{{ t('invoice.form.amount') }}</span>
              <el-input v-model="form.amountInput" type="number" :min="0" :step="0.01" />
            </label>
            <label class="wide">
              <span>{{ t('invoice.form.terms') }}</span>
              <el-input v-model="form.terms" type="textarea" :rows="2" />
            </label>
          </div>
        </section>

        </el-form>
      </aside>

      <section class="preview-pane">
        <header class="preview-toolbar">
          <div class="preview-status">
            <span class="status-dot"></span>
            <div><strong>{{ t('invoice.actions.preview') }}</strong><small>A4 · 210 × 297 mm</small></div>
          </div>
          <div class="toolbar-actions">
            <el-button :loading="saving" :disabled="readOnly" @click="saveDraft">{{ t('app.save') }}</el-button>
            <el-button @click="copyEmail">{{ t('invoice.actions.copyEmail') }}</el-button>
            <el-button type="primary" :disabled="!canDownload" @click="downloadPdf">
              {{ t('invoice.actions.download') }}
            </el-button>
          </div>
        </header>

        <div class="paper-stage">
          <article class="invoice-paper" :aria-label="t('invoice.actions.preview')">
            <div class="invoice-top">
              <h2>INVOICE</h2>
              <div class="invoice-id">
                <span>INVOICE NUMBER</span>
                <strong>{{ form.invoiceNumber || '—' }}</strong>
              </div>
            </div>
            <div class="accent-rule"></div>

            <div class="date-row">
              <div><span>ISSUE DATE</span><p>{{ formatDate(form.issueDate) }}</p></div>
              <div><span>DUE DATE</span><p>{{ formatDate(form.dueDate) }}</p></div>
              <div><span>SERVICE PERIOD</span><p>{{ servicePeriod }}</p></div>
            </div>

            <div class="parties-row">
              <div>
                <span class="accent-label">FROM</span>
                <h3>{{ form.fromName || '—' }}</h3>
                <p class="multiline">{{ form.fromAddress || '—' }}</p>
              </div>
              <div>
                <span class="accent-label">BILL TO</span>
                <h3>{{ form.billTo || '—' }}</h3>
                <p>{{ form.billToCountry || '—' }}</p>
              </div>
            </div>

            <div class="line-items">
              <div class="line-heading"><span>DESCRIPTION</span><span>AMOUNT</span></div>
              <div class="line-entry">
                <p>{{ form.description || '—' }}</p>
                <strong>{{ formattedAmount }}</strong>
              </div>
            </div>

            <div class="total-row">
              <span>TOTAL DUE</span>
              <strong>{{ formattedAmount }}</strong>
            </div>

            <div class="terms-block">
              <span>TERMS &amp; CONDITIONS</span>
              <p>{{ form.terms || '—' }}</p>
            </div>

            <footer class="invoice-footer">
              <span>{{ form.fromName || '—' }}</span>
              <span>Invoice {{ form.invoiceNumber || '—' }}</span>
            </footer>
          </article>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.invoice-maker-page {
  min-height: calc(100vh - 73px);
  background: var(--heph-canvas);
}
.invoice-body {
  display: grid;
  grid-template-columns: minmax(300px, 370px) minmax(0, 1fr);
  min-height: calc(100vh - 73px);
}
.form-pane {
  display: flex;
  flex-direction: column;
  padding: 30px 30px 48px;
  background: var(--heph-paper-solid);
  border-right: 1px solid var(--heph-line);
}
.form-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding-bottom: 24px;
}
.form-header h1 {
  margin: 5px 0 0;
  font-size: 1.72rem;
  color: var(--heph-ink);
  letter-spacing: -0.035em;
}
.eyebrow { margin: 0; color: var(--heph-pine-2); font-size: .68rem; font-weight: 700; letter-spacing: .16em; text-transform: uppercase; }
.form-intro { max-width: 270px; margin: 8px 0 0; color: var(--heph-muted); font-size: .78rem; line-height: 1.5; }
.new-action { margin-top: 18px; color: var(--heph-pine-2); font-weight: 650; }
.editor-section {
  padding: 22px 0 24px;
  border-top: 1px solid var(--heph-line);
}
.section-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
.section-heading > span { color: var(--heph-pine-2); font-size: .65rem; font-weight: 750; letter-spacing: .1em; }
.section-heading h2 { color: var(--heph-ink); font-size: .92rem; }
.editor-section :deep(.el-input__wrapper),
.editor-section :deep(.el-textarea__inner) { min-height: 40px; border-radius: 7px !important; }
.editor-section :deep(.el-input-group__append) { padding: 0 10px; }
.editor-section :deep(.el-input-group__append .el-button) { font-size: .72rem; }
.editor-section :deep(textarea.el-textarea__inner) { padding-top: 10px; line-height: 1.45; }
.form-pane :deep(.heph-error) { margin: 0 0 18px; }
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}
.grid label {
  display: flex;
  flex-direction: column;
  gap: 7px;
  font-size: 0.71rem;
  font-weight: 600;
  color: var(--heph-muted);
}
.grid label.wide {
  grid-column: span 2;
}
.preview-pane {
  position: sticky;
  top: 73px;
  align-self: start;
  height: calc(100vh - 73px);
  min-width: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
}
.preview-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 18px;
  min-height: 72px;
  padding: 14px 24px;
  background: var(--heph-paper-solid);
  border-bottom: 1px solid var(--heph-line);
  backdrop-filter: blur(16px);
}
.preview-status { display: flex; align-items: center; gap: 10px; }
.preview-status strong, .preview-status small { display: block; }
.preview-status strong { font-size: .82rem; color: var(--heph-ink); }
.preview-status small { margin-top: 2px; font-size: .66rem; color: var(--heph-muted); }
.status-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--heph-lime); box-shadow: 0 0 0 4px rgba(207,232,107,.22); }
.toolbar-actions { display: flex; gap: 8px; }
.paper-stage {
  overflow: auto;
  padding: 36px clamp(24px, 4vw, 64px) 56px;
  background: var(--heph-canvas-soft);
}
.invoice-paper {
  --invoice-ink: #18222c;
  --invoice-muted: #66717d;
  --invoice-accent: #1a7773;
  --invoice-rule: #d5dbe0;
  position: relative;
  width: min(100%, 794px);
  min-width: 620px;
  aspect-ratio: 210 / 297;
  margin: 0 auto;
  padding: 8.1% 11.4% 6.4%;
  background: #ffffff;
  color: var(--invoice-ink);
  box-shadow: 0 22px 65px rgba(24,34,44,.14), 0 2px 6px rgba(24,34,44,.08);
  font-family: Arial, Helvetica, sans-serif;
}
.invoice-paper span { display: block; color: var(--invoice-muted); font-size: clamp(7px,.7vw,10px); font-weight: 700; letter-spacing: .025em; }
.invoice-top { display: flex; align-items: flex-start; justify-content: space-between; }
.invoice-top h2 { margin: 0; color: var(--invoice-ink); font-size: clamp(29px,3.3vw,45px); line-height: 1; letter-spacing: -.035em; }
.invoice-id { text-align: right; }
.invoice-id strong { display: block; margin-top: 12px; font-size: clamp(10px,1.25vw,16px); }
.accent-rule { height: 2px; margin-top: 7%; background: var(--invoice-accent); }
.date-row { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8%; margin-top: 8.5%; }
.date-row p { margin: 12px 0 0; font-size: clamp(9px,1vw,14px); }
.parties-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14%; margin-top: 18%; }
.invoice-paper .accent-label, .terms-block > span { color: var(--invoice-accent); }
.parties-row h3 { margin: 14px 0 12px; font-size: clamp(11px,1.35vw,18px); }
.parties-row p { margin: 0; color: #71808e; font-size: clamp(8px,.9vw,13px); line-height: 1.55; }
.multiline { white-space: pre-line; }
.line-items { margin-top: 18%; border-top: 1px solid var(--invoice-rule); border-bottom: 1px solid var(--invoice-rule); }
.line-heading, .line-entry { display: flex; align-items: center; justify-content: space-between; gap: 24px; }
.line-heading { min-height: 42px; border-bottom: 1px solid var(--invoice-rule); }
.line-heading span:last-child, .line-entry strong { text-align: right; }
.line-entry { min-height: 92px; }
.line-entry p, .line-entry strong { margin: 0; font-size: clamp(9px,1vw,14px); }
.line-entry p { max-width: 68%; line-height: 1.5; }
.total-row { width: 40%; margin: 8.5% 0 0 auto; padding-bottom: 18px; text-align: right; border-bottom: 2px solid var(--invoice-accent); }
.total-row strong { display: block; margin-top: 12px; font-size: clamp(18px,2.4vw,32px); letter-spacing: -.025em; white-space: nowrap; }
.terms-block { width: 49%; margin-top: 12%; }
.terms-block > span { padding-bottom: 14px; border-bottom: 1px solid var(--invoice-rule); }
.terms-block p { margin: 22px 0 0; font-size: clamp(8px,.9vw,13px); line-height: 1.5; }
.invoice-footer { position: absolute; right: 11.4%; bottom: 4.5%; left: 11.4%; display: flex; justify-content: space-between; padding-top: 15px; border-top: 1px solid var(--invoice-rule); }
.invoice-footer span { color: #71808e; font-size: clamp(7px,.8vw,11px); font-weight: 400; }

@media (max-width: 1180px) {
  .invoice-body { grid-template-columns: 320px minmax(0, 1fr); }
  .form-pane { padding-right: 24px; padding-left: 24px; }
}

@media (max-width: 1080px) {
  .invoice-body {
    grid-template-columns: 1fr;
  }
  .preview-pane {
    position: static;
    height: auto;
  }
  .paper-stage { max-height: none; }
}
@media (max-width: 700px) {
  .form-pane { padding: 24px 18px 36px; }
  .form-header { display: block; }
  .new-action { margin: 12px 0 0; }
  .preview-toolbar { align-items: flex-start; flex-direction: column; padding: 14px 18px; }
  .toolbar-actions { width: 100%; overflow-x: auto; }
  .paper-stage { padding: 22px 14px 40px; }
  .invoice-paper { min-width: 580px; }
}
</style>
