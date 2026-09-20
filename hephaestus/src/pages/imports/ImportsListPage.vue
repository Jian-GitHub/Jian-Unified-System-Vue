<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'

import EmptyState from '@/components/common/EmptyState.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'

import { listBatches, cancelImport, trashBatch } from '@/api/imports'
import type { Batch } from '@/types/income'
import { useSessionStore } from '@/store/session'
import { formatDate } from '@/utils/format'
import { errorMessage } from '@/utils/errors'
import { ElMessage, ElMessageBox } from 'element-plus'

const { t } = useI18n()
const router = useRouter()
const session = useSessionStore()

const batches = ref<Batch[]>([])
const error = ref<string | null>(null)
const loading = ref(false)
const cancelling = ref('')
const showDeleted = ref(false)
const visibleBatches = computed(() => batches.value.filter(batch => !!batch.deleted === showDeleted.value))

async function reload() {
  loading.value = true
  error.value = null
  try {
    const out = await listBatches()
    batches.value = out.items
  } catch (e: any) {
    error.value = e?.message ?? t('ui.requestFailed')
  } finally {
    loading.value = false
  }
}

async function cancel(b: Batch) {
  if (cancelling.value || b.status === 'committed' || b.status === 'cancelled') return
  cancelling.value = b.id
  error.value = null
  try {
    try { await ElMessageBox.confirm(t('imports.cancelConfirm'), t('imports.cancel'), { type: 'warning' }) } catch { return }
    const updated = await cancelImport(b.id, b.version || session.etagFor(`/v1/imports/${b.id}`))
    batches.value = batches.value.map(item => item.id === updated.id ? updated : item)
    ElMessage.success(t('imports.cancelled'))
  } catch (e) {
    error.value = errorMessage(e)
  } finally { cancelling.value = '' }
}

onMounted(reload)
async function remove(b: Batch) {
  if (cancelling.value) return
  cancelling.value = b.id
  error.value = null
  try {
    try { await ElMessageBox.confirm(t(b.deleted ? 'imports.restoreConfirm' : 'imports.deleteConfirm'), '', { type: 'warning' }) } catch { return }
    const updated = await trashBatch(b.id, !b.deleted, b.version)
    batches.value = batches.value.map(item => item.id === updated.id ? updated : item)
    ElMessage.success(t(b.deleted ? 'app.restore' : 'app.delete'))
  } catch (e) { error.value = errorMessage(e) }
  finally { cancelling.value = '' }
}
const page = ref(1)
const pageSize = ref(10)
const pageItems = computed(() => visibleBatches.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
watch([visibleBatches, pageSize], () => { page.value = 1 })
</script>

<template>
  <div class="imports-list-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ t('app.title') }}</p>
        <h1>{{ t('imports.list.heading') }}</h1>
        <p class="subtitle">{{ t('imports.list.subtitle') }}</p>
      </div>
      <el-button type="primary" @click="router.push({ name: 'imports-new' })">
        {{ t('imports.list.new') }}
      </el-button>
    </header>

    <ErrorBanner :message="error" />
    <el-switch v-model="showDeleted" :active-text="t('imports.trash')" />

    <div class="heph-card">
      <EmptyState v-if="visibleBatches.length === 0 && !loading" :title="t('imports.list.empty')" />
      <el-table v-else :data="pageItems" v-loading="loading" @row-click="(b) => router.push({ name: 'import-detail', params: { id: b.id } })">
        <el-table-column :label="t('records.list.columns.date')" width="160">
          <template #default="{ row }">{{ formatDate(row.created_at?.slice(0, 10)) }}</template>
        </el-table-column>
        <el-table-column :label="t('records.list.columns.status')" width="160">
          <template #default="{ row }">
            <span class="heph-pill" :class="{
              success: row.status === 'committed',
              danger: row.status === 'failed',
              warn: row.status === 'awaiting_review' || row.status === 'parsing',
            }">
              {{ t(`imports.status.${row.status}`) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column :label="t('ui.rows')" width="100" prop="row_count" />
        <el-table-column :label="t('ui.inserted')" width="100" prop="inserted" />
        <el-table-column :label="t('app.updated')" width="100" prop="updated" />
        <el-table-column :label="t('ui.excluded')" width="100" prop="excluded" />
        <el-table-column :label="t('ui.errors')" width="100" prop="error_count" />
        <el-table-column :label="t('app.actions')" width="250" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click.stop="router.push({ name: 'import-detail', params: { id: row.id } })">
              {{ t('app.view') }}
            </el-button>
            <el-button
              v-if="!row.deleted && row.status !== 'committed' && row.status !== 'cancelled'"
              size="small"
              link
              type="danger"
              :loading="cancelling === row.id"
              :disabled="!!cancelling"
              @click.stop="cancel(row)"
            >
              {{ t('imports.cancel') }}
            </el-button>
            <el-button size="small" link type="danger" :disabled="!!cancelling" @click.stop="remove(row)">{{ row.deleted ? t('app.restore') : t('app.delete') }}</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-if="visibleBatches.length" v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10,20,50]" :total="visibleBatches.length" layout="total, sizes, prev, pager, next" class="list-pagination" />
    </div>
  </div>
</template>

<style scoped>
.imports-list-page {
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
</style>
