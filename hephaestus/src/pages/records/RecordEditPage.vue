<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import ErrorBanner from '@/components/common/ErrorBanner.vue'

import {
  archiveRecord,
  clearOverride,
  createRecord,
  emptyRecordData,
  getRecord,
  listRevisions,
  restoreRecord,
  updateRecord,
} from '@/api/income'
import type { Change, Record, RecordData, Revision, RevisionList } from '@/types/income'
import { formatDate, formatNzd } from '@/utils/format'
import { errorMessage } from '@/utils/errors'
import { useUnsavedChanges } from '@/composables/useUnsavedChanges'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const mode = computed<'create' | 'edit'>(() => {
  const value = route.meta.mode as string | undefined
  return value === 'create' ? 'create' : 'edit'
})
const editingId = computed(() => (mode.value === 'edit' ? (route.params.id as string) : ''))

const data = ref<RecordData>(emptyRecordData())
const original = ref<Record | null>(null)
const overrides = ref<Change[]>([])
const error = ref<string | null>(null)
const saving = ref(false)
const loading = ref(false)
const dirty = ref(false)
const reason = ref('')
const revisions = ref<RevisionList>({ items: [] })
useUnsavedChanges(dirty)

let loadVersion = 0
async function load() {
  const current = ++loadVersion
  const recordId = editingId.value
  original.value = null
  data.value = emptyRecordData()
  overrides.value = []
  revisions.value = { items: [] }
  dirty.value = false
  reason.value = ''
  error.value = null
  loading.value = !!recordId
  if (!recordId) return
  try {
    const [rec, history] = await Promise.all([getRecord(recordId), listRevisions(recordId)])
    if (current !== loadVersion) return
    original.value = rec
    data.value = { ...rec.data }
    overrides.value = [...(rec.overrides ?? [])]
    revisions.value = history
  } catch (e: any) {
    if (current === loadVersion) error.value = e?.response?.data?.message ?? e?.message ?? t('ui.loadRecordFailed')
  } finally {
    if (current === loadVersion) loading.value = false
  }
}

watch(editingId, load, { immediate: true })

const isOverridden = (field: string) => overrides.value.some((c) => c.field === field && !c.clear)
const overriddenValue = (field: string): string => {
  const o = overrides.value.find((c) => c.field === field)
  return o?.value ?? ''
}

function markDirty() {
  dirty.value = true
}

async function save() {
  if (saving.value || loading.value) return
  const generation = loadVersion
  saving.value = true
  error.value = null
  try {
    if (mode.value === 'create') {
      const created = await createRecord({ data: { ...data.value, gross_cents: data.value.gross_cents || null, expense_cents: data.value.expense_cents || null } })
      if (generation !== loadVersion) return
      dirty.value = false
      ElMessage.success(t('records.save.success'))
      await router.replace({ name: 'record-edit', params: { id: created.id } })
      return
    }
    if (!original.value) return
    const changes: Change[] = diff(original.value.data, data.value)
    const hasClear = overrides.value.filter((c) => c.clear).map((c) => c.field)
    for (const field of hasClear) {
      if (!changes.some((c) => c.field === field)) {
        changes.push({ field, value: '', clear: true })
      }
    }
    if (changes.length === 0) {
      dirty.value = false
      ElMessage.info('Nothing to save.')
      return
    }
    if ((original.value.source_id || original.value.overrides?.length) && !reason.value.trim()) {
      throw new Error(t('records.reasonRequired'))
    }
    const updated = await updateRecord(
      original.value.id,
      { changes, reason: reason.value || 'User edit' },
      original.value.version,
    )
    if (generation !== loadVersion) return
    original.value = updated
    data.value = { ...updated.data }
    overrides.value = [...(updated.overrides ?? [])]
    reason.value = ''
    dirty.value = false
    ElMessage.success(t('records.save.success'))
    const history = await listRevisions(updated.id)
    if (generation === loadVersion) revisions.value = history
  } catch (e: any) {
    if (generation === loadVersion) error.value = e?.message ?? t('ui.saveFailed')
  } finally {
    saving.value = false
  }
}

function diff(prev: RecordData, next: RecordData): Change[] {
  const out: Change[] = []
  const fields: (keyof RecordData)[] = [
    'service_date',
    'customer',
    'job_type',
    'detail',
    'note',
    'pricing_category',
    'duration_minutes',
    'team_size',
    'gross_cents',
    'expense_cents',
  ]
  for (const field of fields) {
    const before = (prev[field] ?? null) as any
    const after = (next[field] ?? null) as any
    if (before !== after) {
      if ((field === 'gross_cents' || field === 'expense_cents') && after === '') {
        out.push({ field, value: '', clear: true })
      } else {
        out.push({ field, value: after === null || after === undefined ? '' : String(after) })
      }
    }
  }
  return out
}

async function resetOverride(field: string) {
  if (!original.value || saving.value || loading.value) return
  const current = original.value
  saving.value = true
  error.value = null
  try {
    const result = await ElMessageBox.prompt(t('records.revertPrompt'), '', { inputValue: 'Revert override', inputValidator: value => !!value?.trim() }).catch(() => null)
    if (!result || editingId.value !== current.id) return
    const updated = await clearOverride(current.id, { field, reason: result.value }, current.version)
    if (editingId.value !== current.id) return
    original.value = updated
    data.value = { ...updated.data }
    overrides.value = [...(updated.overrides ?? [])]
    dirty.value = false
    revisions.value = await listRevisions(current.id)
    ElMessage.success(t('records.save.success'))
  } catch (e) { error.value = errorMessage(e) }
  finally { saving.value = false }
}

async function archive() {
  await changeArchive(false)
}

async function restore() {
  await changeArchive(true)
}

async function changeArchive(restore: boolean) {
  if (!original.value || saving.value || loading.value) return
  const current = original.value
  saving.value = true
  error.value = null
  try {
    try { await ElMessageBox.confirm(t(restore ? 'records.restoreConfirm' : 'records.archiveConfirm'), '', { type: 'warning' }) } catch { return }
    if (editingId.value !== current.id) return
    const updated = await (restore ? restoreRecord : archiveRecord)(current.id, current.version)
    if (editingId.value !== current.id) return
    original.value = updated
    data.value = { ...updated.data }
    overrides.value = [...(updated.overrides ?? [])]
    dirty.value = false
    ElMessage.success(t('records.save.success'))
    if (!restore) await router.replace({ name: 'records' })
    else revisions.value = await listRevisions(current.id)
  } catch (e) { error.value = errorMessage(e) }
  finally { saving.value = false }
}

function onCancel() {
  router.push({ name: 'records' })
}
</script>

<template>
  <div class="record-edit-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ t('app.title') }}</p>
        <h1>{{ mode === 'create' ? t('records.new') : t('records.edit') }}</h1>
        <p v-if="original" class="subtitle">
          {{ t('records.list.importedFrom') }}: {{ original.source_id || 'manual' }} ·
          {{ original.overrides?.length || 0 }} override(s)
        </p>
      </div>
      <div class="actions">
        <el-button @click="onCancel">{{ t('app.cancel') }}</el-button>
        <el-button
          v-if="mode === 'edit' && original && !original.archived"
          type="warning"
          :disabled="saving || loading"
          @click="archive"
        >
          {{ t('app.delete') }}
        </el-button>
        <el-button
          v-if="mode === 'edit' && original && original.archived"
          type="warning"
          :disabled="saving || loading"
          @click="restore"
        >
          {{ t('app.restore') }}
        </el-button>
        <el-button type="primary" :loading="saving" :disabled="loading || (mode === 'edit' && !original)" @click="save">{{ t('app.save') }}</el-button>
      </div>
    </header>

    <ErrorBanner :message="error" />

    <section class="heph-card" v-loading="loading || saving">
      <h2>{{ t('records.edit') }}</h2>
      <div class="grid">
        <label>
          <span>{{ t('records.fields.serviceDate') }} *</span>
          <el-input v-model="data.service_date" type="date" @input="markDirty" />
        </label>
        <label>
          <span>{{ t('records.fields.customer') }}</span>
          <el-input v-model="data.customer" @input="markDirty" />
        </label>
        <label>
          <span>{{ t('records.fields.jobType') }}</span>
          <el-input v-model="data.job_type" @input="markDirty" />
        </label>
        <label>
          <span>{{ t('records.fields.pricingCategory') }}</span>
          <el-input v-model="data.pricing_category" @input="markDirty" />
        </label>
        <label>
          <span>{{ t('records.fields.durationMinutes') }}</span>
          <el-input-number
            v-model="data.duration_minutes"
            :min="0"
            :step="15"
            @change="markDirty"
            style="width: 100%"
          />
          <small class="hint">{{ t('records.helpers.durationHint') }}</small>
        </label>
        <label>
          <span>{{ t('records.fields.teamSize') }}</span>
          <el-input-number
            v-model="data.team_size"
            :min="1"
            :step="1"
            @change="markDirty"
            style="width: 100%"
          />
        </label>
        <label>
          <span>{{ t('records.fields.grossCents') }}</span>
          <small v-if="data.wage_basis === 'rule_estimate'">{{ t('aimer.estimate') }}</small>
          <el-input v-model="data.gross_cents" :disabled="!!data.wage_basis" placeholder="0" @input="markDirty">
            <template #append>
              <span class="append" v-if="data.gross_cents">{{ formatNzd(data.gross_cents) }}</span>
            </template>
          </el-input>
          <small class="hint">{{ t('records.helpers.grossHint') }}</small>
          <small v-if="isOverridden('gross_cents')" class="hint warn">
            {{ t('records.list.overridden') }}: {{ overriddenValue('gross_cents') || '—' }}
            <el-button link type="primary" size="small" @click="resetOverride('gross_cents')">
              {{ t('ui.revert') }}
            </el-button>
          </small>
        </label>
        <label>
          <span>{{ t('records.fields.expenseCents') }}</span>
          <el-input v-model="data.expense_cents" placeholder="0" @input="markDirty">
            <template #append>
              <span class="append" v-if="data.expense_cents">{{ formatNzd(data.expense_cents) }}</span>
            </template>
          </el-input>
          <small class="hint">{{ t('records.helpers.expenseHint') }}</small>
          <small v-if="isOverridden('expense_cents')" class="hint warn">
            {{ t('records.list.overridden') }}: {{ overriddenValue('expense_cents') || '—' }}
            <el-button link type="primary" size="small" @click="resetOverride('expense_cents')">
              {{ t('ui.revert') }}
            </el-button>
          </small>
        </label>
        <label class="wide">
          <span>{{ t('records.fields.detail') }}</span>
          <el-input v-model="data.detail" type="textarea" :rows="2" @input="markDirty" />
        </label>
        <label class="wide">
          <span>{{ t('records.fields.note') }}</span>
          <el-input v-model="data.note" type="textarea" :rows="2" @input="markDirty" />
        </label>
        <label class="wide">
          <span>{{ t('ui.reasonRequired') }}</span>
          <el-input v-model="reason" :rows="1" />
        </label>
      </div>
    </section>

    <section v-if="revisions.items.length" class="heph-card">
      <h2>{{ t('records.revisions') }}</h2>
      <el-table :data="revisions.items">
        <el-table-column :label="t('ui.version')" prop="version" width="100" />
        <el-table-column :label="t('app.actions')" prop="action" width="120" />
        <el-table-column :label="t('ui.reason')" prop="reason" />
        <el-table-column :label="t('ui.when')" width="200">
          <template #default="{ row }">{{ formatDate(row.created_at?.slice(0, 10)) }}</template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<style scoped>
.record-edit-page {
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
}
.actions {
  display: flex;
  gap: 8px;
}
.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}
.grid label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.78rem;
  color: var(--heph-muted);
}
.grid label.wide {
  grid-column: span 2;
}
.hint {
  color: var(--heph-muted);
  font-size: 0.7rem;
}
.hint.warn {
  color: var(--heph-amber);
}
.append {
  font-size: 0.85rem;
  color: var(--heph-muted);
}
</style>
