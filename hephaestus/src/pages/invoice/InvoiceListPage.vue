<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

import EmptyState from '@/components/common/EmptyState.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'

import { useInvoiceStore } from '@/store/invoice'
import { renderInvoicePdf } from '@/api/invoice'
import { downloadBlob, formatDate, formatNzd } from '@/utils/format'

const { t } = useI18n()
const router = useRouter()
const store = useInvoiceStore()
const error = ref<string | null>(null)
const busy = ref(false)

async function perform(task: () => unknown) {
  if (busy.value) return
  busy.value = true
  error.value = null
  try { await task() } catch (e: any) { error.value = e?.message ?? t('ui.requestFailed') }
  finally { busy.value = false }
}

const filter = ref<'all' | 'draft' | 'finalised' | 'void'>('all')

const filtered = computed(() =>
  store.sortedDrafts.filter((d) => filter.value === 'all' || d.state === filter.value),
)

function open(id: string) {
  router.push({ name: 'invoice', query: { id } })
}

function duplicate(id: string) {
  return perform(async () => {
    const out = store.duplicate(id)
    if (out) await router.push({ name: 'invoice', query: { id: out.id } })
  })
}

async function remove(id: string) {
  await perform(async () => {
    try { await ElMessageBox.confirm(t('invoice.deleteConfirm'), '', { type: 'warning' }) } catch { return }
    store.delete(id)
    ElMessage.success(t('app.delete'))
  })
}

function voidInvoice(id: string) {
  return perform(async () => {
    const reason = await ElMessageBox.prompt(t('invoice.voidReason'), '', { inputValidator: value => !!value?.trim() }).catch(() => null)
    if (!reason) return
    store.void(id, reason.value)
    ElMessage.success(t('invoice.saved.voided'))
  })
}

function download(id: string) {
  return perform(() => {
  const draft = store.drafts.find((d) => d.id === id)
  if (!draft) return
  const blob = renderInvoicePdf(draft)
  downloadBlob(blob, `invoice-${draft.invoiceNumber || id.slice(0, 8)}.pdf`, 'application/pdf')
  ElMessage.success(t('invoice.status.pdfDownloaded'))
  })
}
const page = ref(1)
const pageSize = ref(10)
const pageItems = computed(() => filtered.value.slice((page.value - 1) * pageSize.value, page.value * pageSize.value))
watch([filtered, pageSize], () => { page.value = 1 })
</script>

<template>
  <div class="invoice-list-page">

    <main class="content">
      <header class="page-header">
        <div>
          <p class="eyebrow">{{ t('invoice.title') }}</p>
          <h1>{{ t('invoice.list.heading') }}</h1>
          <p class="subtitle">{{ t('invoice.list.subtitle') }}</p>
        </div>
        <div class="filters">
          <el-radio-group v-model="filter" size="small">
            <el-radio-button value="all">{{ t('app.actions') }}</el-radio-button>
            <el-radio-button value="draft">{{ t('invoice.states.draft') }}</el-radio-button>
            <el-radio-button value="finalised">{{ t('invoice.states.finalised') }}</el-radio-button>
            <el-radio-button value="void">{{ t('invoice.states.void') }}</el-radio-button>
          </el-radio-group>
          <el-button type="primary" @click="router.push({ name: 'invoice' })">
            {{ t('invoice.list.new') }}
          </el-button>
        </div>
      </header>

      <ErrorBanner :message="error" />
      <section class="heph-card" v-loading="busy">
        <EmptyState v-if="filtered.length === 0" :title="t('invoice.list.empty')" />
        <el-table v-else :data="pageItems">
          <el-table-column :label="t('invoice.form.invoiceNumber')" prop="invoiceNumber" width="160" />
          <el-table-column :label="t('invoice.form.billTo')" prop="billTo" />
          <el-table-column :label="t('app.amount')" width="120">
            <template #default="{ row }">{{ formatNzd(String(row.amountCents)) }}</template>
          </el-table-column>
          <el-table-column :label="t('app.updated')" width="140">
            <template #default="{ row }">{{ formatDate(row.updatedAt?.slice(0, 10)) }}</template>
          </el-table-column>
          <el-table-column :label="t('records.list.columns.status')" width="140">
            <template #default="{ row }">
              <span class="heph-pill" :class="{
                success: row.state === 'finalised',
                warn: row.state === 'void',
              }">
                {{ t(`invoice.states.${row.state || 'draft'}`) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column :label="t('app.actions')" width="360">
            <template #default="{ row }">
              <el-button size="small" link @click="open(row.id)">{{ t('app.view') }}</el-button>
              <el-button size="small" link @click="duplicate(row.id)">{{ t('app.duplicate') }}</el-button>
              <el-button size="small" link @click="download(row.id)">{{ t('invoice.actions.download') }}</el-button>
              <el-button
                v-if="row.state !== 'void'"
                size="small"
                link
                type="warning"
                @click="voidInvoice(row.id)"
              >
                {{ t('app.void') }}
              </el-button>
              <el-button v-if="row.state === 'draft'" size="small" link type="danger" @click="remove(row.id)">
                {{ t('app.delete') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      <el-pagination v-if="filtered.length" v-model:current-page="page" v-model:page-size="pageSize" :page-sizes="[10,20,50]" :total="filtered.length" layout="total, sizes, prev, pager, next" class="list-pagination" />
      </section>

      <p class="note">{{ t('invoice.saved.comingSoon') }}</p>
    </main>
  </div>
</template>

<style scoped>
.invoice-list-page {
  min-height: 100vh;
  background: var(--heph-canvas);
}
.content {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
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
.filters {
  display: flex;
  gap: 12px;
  align-items: center;
}
.note {
  font-size: 0.75rem;
  color: var(--heph-muted);
}
</style>
