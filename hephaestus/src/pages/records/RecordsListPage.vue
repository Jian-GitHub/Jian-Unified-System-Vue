<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import MonthNavigator from '@/components/income/MonthNavigator.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import IncomeFilters from '@/components/income/IncomeFilters.vue'

import { archiveRecord, getRecord, listRecords, restoreRecord } from '@/api/income'
import type { QueryParams, Record, RecordList } from '@/types/income'
import { useSessionStore } from '@/store/session'
import { formatNzd } from '@/utils/format'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const session = useSessionStore()

const filters = ref<QueryParams>({
  sort: 'date-desc',
  archived: 'active',
  limit: 10,
})
const list = ref<RecordList>({ items: [], next_cursor: '' })
const error = ref<string | null>(null)
const loading = ref(false)
const changing = ref('')

const page = ref(1)
const cursors = ref<string[]>([''])
let requestId = 0
async function fetchPage(target: number) {
  const current = ++requestId
  loading.value = true
  error.value = null
  try {
    const result = await listRecords({ ...filters.value, limit: filters.value.limit || 10, cursor: cursors.value[target - 1] || undefined })
    if (current !== requestId) return
    list.value = result
    page.value = target
    if (result.next_cursor) cursors.value[target] = result.next_cursor
  } catch (e: any) {
    if (current === requestId) error.value = e?.message ?? t('ui.requestFailed')
  } finally {
    if (current === requestId) loading.value = false
  }
}
function reload() { cursors.value = ['']; return fetchPage(1) }

function loadRouteFilters() {
  const q = route.query
  const text = (key: string) => typeof q[key] === 'string' ? q[key] as string : undefined
  filters.value = {
    from: text('from'), to: text('to'), type: text('type'), search: text('search'),
    team: q.team === 'solo' || q.team === 'team' ? q.team : undefined,
    archived: q.archived === 'all' || q.archived === 'archived' ? q.archived : 'active',
    sort: ['date-desc', 'date-asc', 'gross-desc', 'cash-desc'].includes(text('sort') || '') ? text('sort') as QueryParams['sort'] : 'date-desc',
    limit: filters.value.limit || 10,
  }
  reload()
}

watch(() => route.fullPath, loadRouteFilters, { immediate: true })

async function toggleArchive(rec: Record) {
  if (changing.value) return
  changing.value = rec.id
  const isArchived = rec.archived
  const confirmText = isArchived ? t('records.restoreConfirm') : t('records.archiveConfirm')
  try {
    try { await ElMessageBox.confirm(confirmText, '', { type: 'warning' }) } catch { return }
    if (isArchived) {
      await restoreRecord(rec.id, rec.version)
    } else {
      await archiveRecord(rec.id, rec.version)
    }
    await reload()
  } catch (e: any) {
    if (e?.message === 'cancel') return
    ElMessage.error(e?.message ?? t('ui.requestFailed'))
  } finally { changing.value = '' }
}

function view(rec: Record) {
  router.push({ name: 'record-edit', params: { id: rec.id } })
}
</script>

<template>
  <div class="records-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ t('app.title') }}</p>
        <h1>{{ t('records.list.heading') }}</h1>
        <p class="subtitle">{{ t('ui.browseByMonthAndCustomerSelectARowForDetails') }}</p>
      </div>
      <el-button type="primary" @click="router.push({ name: 'record-new' })">
        {{ t('records.new') }}
      </el-button>
    </header>

    <MonthNavigator v-model="filters" @change="reload" />
    <IncomeFilters v-model="filters" @apply="reload" />
    <ErrorBanner :message="error" />

    <div class="heph-card">
      <EmptyState
        v-if="list.items.length === 0 && !loading"
        :title="t('records.list.empty')"
      />
      <el-table
        v-else
        :data="list.items"
        v-loading="loading"
        style="width: 100%"
        @row-click="view"
      >
        <el-table-column :label="t('records.list.columns.date')" prop="data.service_date" width="120" />
        <el-table-column :label="t('records.list.columns.customer')" prop="data.customer" width="160" />
        <el-table-column :label="t('records.list.columns.jobType')" prop="data.job_type" width="140" />
        <el-table-column :label="t('records.list.columns.detail')" prop="data.detail" />
        <el-table-column :label="t('records.list.columns.duration')" width="120">
          <template #default="{ row }">
            <span>{{ Math.round((row.data.duration_minutes ?? 0) / 6) / 10 }}h</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('records.list.columns.team')" width="80">
          <template #default="{ row }">{{ row.data.team_size }}</template>
        </el-table-column>
        <el-table-column :label="t('records.list.columns.gross')" width="120">
          <template #default="{ row }">
            <span :class="['heph-money', row.data.gross_cents ? 'positive' : 'negative']">
              {{ row.data.gross_cents ? formatNzd(row.data.gross_cents) : t('records.list.wagePending') }}
              <small v-if="row.data.wage_basis === 'rule_estimate'">{{ t('aimer.estimate') }}</small>
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('records.list.columns.expense')" width="120">
          <template #default="{ row }">
            <span class="heph-money">{{ row.data.expense_cents == null ? '—' : formatNzd(row.data.expense_cents) }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="t('records.list.columns.status')" width="160">
          <template #default="{ row }">
            <div class="status-pills">
              <span v-if="row.archived" class="heph-pill warn">{{ t('records.list.archived') }}</span>
              <span v-if="row.overrides?.length" class="heph-pill">{{ t('records.list.overridden') }}</span>
              <span v-if="row.source_id" class="heph-pill success">
                {{ t('records.list.importedFrom') }}
              </span>
              <span v-if="!row.data.gross_cents" class="heph-pill warn">
                {{ t('records.list.wagePending') }}
              </span>
              <span v-else class="heph-pill success">
                {{ row.data.wage_basis === 'rule_estimate' ? t('aimer.estimate') : t('records.list.wageConfirmed') }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="t('records.list.columns.actions')" width="160">
          <template #default="{ row }">
            <el-button size="small" link @click.stop="view(row)">{{ t('app.view') }}</el-button>
            <el-button size="small" link type="danger" :loading="changing === row.id" :disabled="!!changing" @click.stop="toggleArchive(row)">
              {{ row.archived ? t('app.restore') : t('app.delete') }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="list-pagination">
        <span>{{ t('ui.pageRecords', { page, count: list.items.length }) }}</span>
        <el-select v-model="filters.limit" style="width:120px" :disabled="loading" @change="reload">
          <el-option v-for="size in [10,20,50]" :key="size" :value="size" :label="`${size} / ${t('ui.page')}`" />
        </el-select>
        <el-button :disabled="loading || page === 1" @click="fetchPage(page-1)">{{ t('ui.previous') }}</el-button>
        <el-button :disabled="loading || !list.next_cursor" @click="fetchPage(page+1)">{{ t('ui.next') }}</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.records-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 18px;
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
.status-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.load-more {
  margin-top: 12px;
  display: flex;
  justify-content: center;
}
</style>
