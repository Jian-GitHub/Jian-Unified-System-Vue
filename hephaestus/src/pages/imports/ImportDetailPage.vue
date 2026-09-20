<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import EmptyState from '@/components/common/EmptyState.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import SheetPreview from '@/components/income/SheetPreview.vue'

import {
  cancelImport,
  commitImport,
  getBatch,
  listImportRows,
  saveMapping,
} from '@/api/imports'
import type {
  Batch,
  BatchRows,
  ColumnMapping,
  ImportRow,
  MappingRequest,
  RowDecision,
} from '@/types/income'
import { useSettingsStore } from '@/store/settings'
import { useSessionStore } from '@/store/session'
import { formatDate, formatNzd } from '@/utils/format'
import { errorMessage } from '@/utils/errors'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const session = useSessionStore()

const id = computed(() => route.params.id as string)
const batch = ref<Batch | null>(null)
const rows = ref<BatchRows>({ items: [], next_cursor: '' })
const error = ref<string | null>(null)
const loading = ref(false)
const savingMapping = ref(false)
const committing = ref(false)
const cancelling = ref(false)
const terminal = computed(() => batch.value?.deleted || batch.value?.status === 'committed' || batch.value?.status === 'cancelled')
const previewCounts = computed(() => rows.value.items.reduce((counts, row) => {
  if (row.action in counts) counts[row.action as keyof typeof counts]++
  return counts
}, { insert: 0, update: 0, unchanged: 0, exclude: 0 }))

const defaultMapping = (): MappingRequest => ({
  sheet: 'CSV',
  header_row: 1,
  date_format: useSettingsStore().defaultDateFormat,
  duration_format: 'minutes',
  empty_expense_zero: false,
  default_team_size: 1,
  columns: [],
  decisions: [],
})
const mapping = reactive<MappingRequest>(defaultMapping())
const appliedMapping = ref('')
const mappingState = () => JSON.stringify({ ...mapping, decisions: undefined })
const mappingChanged = computed(() => mappingState() !== appliedMapping.value)

const fields = computed(() => [
  { value: 'service_date', label: t('imports.mapping.columns.serviceDate') },
  { value: 'customer', label: t('imports.mapping.columns.customer') },
  { value: 'job_type', label: t('imports.mapping.columns.jobType') },
  { value: 'detail', label: t('imports.mapping.columns.detail') },
  { value: 'note', label: t('imports.mapping.columns.note') },
  { value: 'pricing_category', label: t('imports.mapping.columns.pricingCategory') },
  { value: 'duration', label: t('imports.mapping.columns.durationMinutes') },
  { value: 'team_size', label: t('imports.mapping.columns.teamSize') },
  { value: 'gross', label: t('imports.mapping.columns.gross') },
  { value: 'expense', label: t('imports.mapping.columns.expense') },
  { value: 'payment_status', label: t('ui.paymentStatus') },
  { value: 'source_key', label: t('imports.mapping.columns.sourceKey') },
  { value: '', label: t('imports.mapping.columns.ignore') },
])

const fieldLabel = (val: string) => fields.value.find((f) => f.value === val)?.label ?? val

function aimerPreset() {
  mapping.rule_profile = 'aimerhq-v1'
  mapping.wage_column_confirmed = true
  mapping.empty_expense_zero = true
  mapping.header_row = 1
  mapping.duration_format = 'hours'
  mapping.date_format = mapping.sheet === 'Google Sheets' ? 'dmy' : 'excel'
  mapping.columns = [
    { field: 'service_date', column: 0 }, { field: 'customer', column: 1 },
    { field: 'job_type', column: 2 }, { field: 'detail', column: 3 },
    { field: 'duration', column: 4 }, { field: 'note', column: 5 },
    { field: 'expense', column: 6 }, { field: 'gross', column: 8 },
  ]
}

const decisions = reactive<Record<number, RowDecision>>({})
const savedDecisions = ref('[]')
const pendingDecisionCount = computed(() => JSON.stringify(Object.values(decisions)) === savedDecisions.value ? 0 : Math.max(1, Object.keys(decisions).length))
const commitDisabled = computed(() => !batch.value || terminal.value || loading.value || savingMapping.value || committing.value || cancelling.value)

function setDecision(row: ImportRow, action: string) {
  if (!action) { delete decisions[row.row]; return }
  decisions[row.row] = {
    row: row.row, action: action as RowDecision['action'],
    record_id: row.record_id, expected_version: row.expected_version,
    keep_overrides: row.keep_overrides,
  }
}

async function loadRows(batchId: string): Promise<BatchRows> {
  const result: BatchRows = { items: [], next_cursor: '' }
  let cursor = ''
  do {
    const page = await listImportRows(batchId, { limit: 200, cursor })
    result.items.push(...page.items)
    cursor = page.next_cursor || ''
  } while (cursor)
  return result
}

let loadVersion = 0
async function loadAll() {
  const request = ++loadVersion
  const batchId = id.value
  loading.value = true
  error.value = null
  batch.value = null
  rows.value = { items: [], next_cursor: '' }
  for (const key of Object.keys(decisions)) delete decisions[Number(key)]
  Object.keys(mapping).forEach(key => delete (mapping as any)[key])
  Object.assign(mapping, defaultMapping())
  try {
    const [b, r] = await Promise.all([getBatch(batchId), loadRows(batchId)])
    if (request !== loadVersion || batchId !== id.value) return
    batch.value = b
    rows.value = r
    let restoredMapping = b.mapping
    if (!restoredMapping && typeof route.query.template_id === 'string') {
      const template = await getBatch(route.query.template_id)
      if (request !== loadVersion || batchId !== id.value) return
      if (template.source_id === b.source_id && template.mapping) restoredMapping = { ...template.mapping, decisions: [], sheet: b.sheets?.[0] || template.mapping.sheet }
    }
    if (restoredMapping) Object.assign(mapping, structuredClone(restoredMapping))
    else mapping.sheet = b.sheets?.[0] || 'CSV'
    for (const decision of restoredMapping?.decisions || []) decisions[decision.row] = { ...decision }
    savedDecisions.value = JSON.stringify(Object.values(decisions))
    appliedMapping.value = mappingState()
  } catch (e: any) {
    if (request === loadVersion) error.value = errorMessage(e)
  } finally {
    if (request === loadVersion) loading.value = false
  }
}

async function regenerate() {
  if (commitDisabled.value) return
  savingMapping.value = true
  error.value = null
  try {
    await regeneratePreview()
    ElMessage.success(t('imports.mapping.previewUpdated'))
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? t('ui.mappingFailed')
  } finally {
    savingMapping.value = false
  }
}

async function regeneratePreview(): Promise<Batch> {
  if (!batch.value) throw new Error(t('imports.commit.previewRequired'))
  const columns = mapping.columns.filter(column => column.field)
  if (!columns.some(column => column.field === 'service_date') || !columns.some(column => column.field === 'gross')) {
    throw new Error(t('imports.mapping.requiredColumns'))
  }
  const batchId = id.value
  const payload: MappingRequest = {
    ...mapping,
    columns,
    decisions: Object.values(decisions),
  }
  const submittedMapping = mappingState()
  const submittedDecisions = JSON.stringify(Object.values(decisions))
  const updated = await saveMapping(
    batchId,
    payload,
    batch.value.version || session.etagFor(`/v1/imports/${batchId}`),
  )
  if (batchId !== id.value) return updated
  // The mapping write already advanced the version, even if fetching rows fails.
  batch.value = updated
  const updatedRows = await loadRows(batchId)
  if (batchId !== id.value) return updated
  rows.value = updatedRows
  appliedMapping.value = submittedMapping
  savedDecisions.value = submittedDecisions
  return updated
}

async function commit() {
  if (commitDisabled.value) return
  const batchId = id.value
  committing.value = true
  error.value = null
  try {
    let current = batch.value!
    if (pendingDecisionCount.value > 0 || mappingChanged.value || (current.status === 'uploaded' && mapping.columns.length > 0)) {
      current = await regeneratePreview()
    }
    if (batchId !== id.value) return
    if (current.status !== 'awaiting_review' || !current.selection_hash) {
      error.value = t('imports.commit.previewRequired')
      return
    }
    if (current.error_count > 0) {
      error.value = t('imports.commit.resolveErrors', { count: current.error_count })
      return
    }
    try {
      await ElMessageBox.confirm(t('imports.commit.confirm'), '', { type: 'warning' })
    } catch {
      return
    }
    if (batchId !== id.value) return
    const payload = {
      selection_hash: current.selection_hash,
    }
    const updated = await commitImport(
      batchId,
      payload,
      current.version || session.etagFor(`/v1/imports/${batchId}`),
    )
    if (batchId === id.value) batch.value = updated
    ElMessage.success(t('imports.commit.success'))
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? t('imports.commit.conflict')
  } finally {
    committing.value = false
  }
}

async function cancel() {
  if (commitDisabled.value) return
  const current = batch.value!
  cancelling.value = true
  error.value = null
  try {
    try { await ElMessageBox.confirm(t('imports.cancelConfirm'), t('imports.cancel'), { type: 'warning' }) } catch { return }
    if (id.value !== current.id) return
    const updated = await cancelImport(current.id, current.version || session.etagFor(`/v1/imports/${current.id}`))
    if (id.value === current.id) batch.value = updated
    ElMessage.success(t('imports.cancelled'))
  } catch (e) {
    if (id.value === current.id) error.value = errorMessage(e)
  } finally { cancelling.value = false }
}

function addColumn() {
  mapping.columns.push({ field: '', column: mapping.columns.length })
}

function removeColumn(i: number) {
  mapping.columns.splice(i, 1)
}

function actionLabel(action: string): string {
  switch (action) {
    case 'insert':
    case 'new': return t('imports.preview.actions.include')
    case 'update': return t('imports.preview.actions.update')
    case 'unchanged': return t('imports.preview.actions.unchanged')
    case 'exclude': return t('imports.preview.actions.exclude')
    default: return action
  }
}

const errorsCount = computed(() => rows.value.items.filter((r) => r.errors?.length).length)

onMounted(loadAll)
watch(() => id.value, loadAll)
</script>

<template>
  <div class="import-detail-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ t('imports.list.heading') }}</p>
        <h1>Batch {{ id.slice(0, 12) }}</h1>
        <p v-if="batch" class="subtitle">
          {{ formatDate(batch.created_at?.slice(0, 10)) }} ·
          <span class="heph-pill">{{ t(`imports.status.${batch.status}`) }}</span>
        </p>
      </div>
      <div class="actions">
        <el-button @click="router.push({ name: 'imports' })">{{ t('app.back') }}</el-button>
        <el-button type="danger" @click="cancel" :loading="cancelling" :disabled="commitDisabled">
          {{ t('imports.cancel') }}
        </el-button>
        <el-button
          type="primary"
          @click="commit"
          :loading="committing"
          :disabled="commitDisabled"
        >
          {{ t('imports.commit.submit') }}
        </el-button>
      </div>
    </header>

    <ErrorBanner :message="error" />

    <section v-if="terminal" class="heph-card">
      <p>{{ t('aimer.terminalBatch') }}</p>
      <el-button type="primary" @click="router.push({ name: 'imports-new', query: { source_id: batch?.source_id, template_id: batch?.id } })">{{ t('aimer.syncAgain') }}</el-button>
    </section>

    <SheetPreview v-if="batch?.sheets?.length" :key="batch.id" :batch-id="batch.id" :sheets="batch.sheets" />

    <section v-if="!terminal" class="heph-card" v-loading="loading || savingMapping || committing || cancelling">
      <h2>{{ t('imports.new.step2') }} — {{ t('imports.mapping.regenerate') }}</h2>
      <el-button @click="aimerPreset">{{ t('aimer.preset') }}</el-button>
      <div v-if="mapping.rule_profile === 'aimerhq-v1'">
        <p>{{ t('aimer.columnWarning') }}</p>
        <el-checkbox v-model="mapping.wage_column_confirmed">{{ t('aimer.confirmColumn') }}</el-checkbox>
        <p>{{ t('aimer.rules') }}</p>
      </div>
      <div class="mapping-grid">
        <label>
          <span>{{ t('imports.mapping.sheet') }}</span>
          <el-input v-model="mapping.sheet" />
        </label>
        <label>
          <span>{{ t('imports.mapping.headerRow') }}</span>
          <el-input-number v-model="mapping.header_row" :min="1" :max="50" />
        </label>
        <label>
          <span>{{ t('imports.mapping.dateFormat') }}</span>
          <el-select v-model="mapping.date_format">
            <el-option value="iso" :label="t('imports.mapping.dateIso')" />
            <el-option value="dmy" :label="t('imports.mapping.dateDmy')" />
            <el-option value="mdy" :label="t('imports.mapping.dateMdy')" />
            <el-option value="excel" :label="t('imports.mapping.dateExcel')" />
          </el-select>
        </label>
        <label>
          <span>{{ t('imports.mapping.durationFormat') }}</span>
          <el-select v-model="mapping.duration_format">
            <el-option value="minutes" :label="t('imports.mapping.durationMinutes')" />
            <el-option value="hours" :label="t('imports.mapping.durationHours')" />
            <el-option value="hh:mm" :label="t('imports.mapping.durationHhmm')" />
          </el-select>
        </label>
        <label>
          <span>{{ t('imports.mapping.defaultTeamSize') }}</span>
          <el-input-number v-model="mapping.default_team_size" :min="1" :max="50" />
        </label>
        <label class="checkbox">
          <el-checkbox v-model="mapping.empty_expense_zero" :disabled="mapping.rule_profile === 'aimerhq-v1'">
            {{ t('imports.mapping.emptyExpenseZero') }}
          </el-checkbox>
        </label>
      </div>

      <h3>{{ t('imports.mapping.columns.label') }}</h3>
      <el-table :data="mapping.columns">
        <el-table-column label="#" width="60">
          <template #default="{ $index }">
            <el-input-number v-model="mapping.columns[$index].column" :min="0" :max="200" />
          </template>
        </el-table-column>
        <el-table-column :label="t('imports.mapping.columns.label')">
          <template #default="{ $index }">
            <el-select v-model="mapping.columns[$index].field" style="width: 100%">
              <el-option v-for="f in fields" :key="f.value" :value="f.value" :label="f.label" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column width="80">
          <template #default="{ $index }">
            <el-button size="small" link type="danger" @click="removeColumn($index)">
              {{ t('app.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-button size="small" link type="primary" @click="addColumn" style="margin-top: 8px">
        + {{ t('ui.addColumn') }}
      </el-button>

      <div class="commit-bar">
        <span v-if="pendingDecisionCount" class="pending-decisions">
          {{ t('imports.preview.pendingDecisions', { count: pendingDecisionCount }) }}
        </span>
        <el-button :loading="savingMapping" :disabled="committing || cancelling || loading" type="primary" @click="regenerate">
          {{ t('imports.mapping.regenerate') }}
        </el-button>
      </div>
    </section>

    <section class="heph-card">
      <div class="card-header">
        <h2>{{ t('imports.preview.heading') }}</h2>
        <span>{{ t('aimer.syncCounts', previewCounts) }}</span>
        <span class="heph-pill" :class="{ danger: errorsCount > 0 }">
          {{ errorsCount > 0 ? t('imports.preview.errorCount', { count: errorsCount }) : t('imports.preview.noErrors') }}
        </span>
      </div>
      <EmptyState v-if="rows.items.length === 0" :title="t('dashboard.noSummary')" />
      <el-table v-else :data="rows.items" v-loading="loading">
        <el-table-column :label="t('ui.rows')" prop="row" width="80" />
        <el-table-column :label="t('records.list.columns.date')" prop="data.service_date" width="110" />
        <el-table-column :label="t('records.list.columns.customer')" prop="data.customer" />
        <el-table-column :label="t('records.list.columns.jobType')" prop="data.job_type" width="140" />
        <el-table-column :label="t('records.list.columns.gross')" width="120">
          <template #default="{ row }">
            <span class="heph-money">{{ row.data?.gross_cents == null ? '—' : formatNzd(row.data.gross_cents) }}</span>
            <small v-if="row.data?.wage_basis === 'rule_estimate'">{{ t('aimer.estimate') }}</small>
          </template>
        </el-table-column>
        <el-table-column :label="t('records.list.columns.expense')" width="120">
          <template #default="{ row }">
            <span class="heph-money">{{ row.data?.expense_cents == null ? '—' : formatNzd(row.data.expense_cents) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('app.actions')" width="140">
          <template #default="{ row }">
            <el-select
              :model-value="decisions[row.row]?.action ?? ''"
              @update:model-value="(v) => setDecision(row, v)"
              size="small"
              :disabled="terminal || committing || cancelling || savingMapping || loading"
              :placeholder="t('ui.auto')"
            >
              <el-option :value="''" :label="t('ui.auto')" />
              <el-option value="new" :label="t('imports.preview.actions.include')" />
              <el-option value="update" :label="t('imports.preview.actions.update')" />
              <el-option value="exclude" :label="t('imports.preview.actions.exclude')" />
              <el-option value="unchanged" :label="t('imports.preview.actions.unchanged')" />
            </el-select>
            <div class="auto-action">{{ actionLabel(row.action) }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="t('ui.errors')" width="220">
          <template #default="{ row }">
            <div v-if="row.errors?.length" class="errors">
              <div v-for="err in row.errors" :key="err">• {{ err }}</div>
            </div>
            <span v-else class="ok">{{ t('imports.preview.noErrors') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<style scoped>
.import-detail-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
  flex-wrap: wrap;
}
.page-header h1 {
  margin: 4px 0 6px;
  font-size: 1.6rem;
  color: var(--heph-pine);
}
.page-header .subtitle {
  margin: 0;
  color: var(--heph-muted);
  display: flex;
  gap: 8px;
  align-items: center;
}
.mapping-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 12px 0 18px;
}
.mapping-grid label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--heph-muted);
}
.mapping-grid label.checkbox {
  align-self: end;
}
h3 {
  margin-top: 12px;
  font-size: 0.95rem;
  color: var(--heph-pine);
}
.commit-bar {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.pending-decisions {
  color: var(--heph-muted);
  font-size: 0.78rem;
}
.actions {
  display: flex;
  gap: 8px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.card-header h2 {
  margin: 0;
}
.auto-action {
  font-size: 0.7rem;
  color: var(--heph-muted);
  margin-top: 2px;
}
.errors {
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: var(--heph-coral);
  font-size: 0.78rem;
}
.ok {
  color: var(--heph-success);
  font-size: 0.78rem;
}
@media (max-width: 880px) {
  .mapping-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
