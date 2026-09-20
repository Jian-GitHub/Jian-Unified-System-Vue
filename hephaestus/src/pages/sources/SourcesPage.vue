<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'

import EmptyState from '@/components/common/EmptyState.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'

import { createSource, deleteSource, listSources } from '@/api/imports'
import type { Source } from '@/types/income'
import { formatDate } from '@/utils/format'

const { t } = useI18n()

const sources = ref<Source[]>([])
const newLabel = ref('')
const error = ref<string | null>(null)
const loading = ref(false)
const saving = ref(false)

async function reload() {
  loading.value = true
  error.value = null
  try {
    const out = await listSources()
    sources.value = out.items
  } catch (e: any) {
    error.value = e?.message ?? t('ui.requestFailed')
  } finally {
    loading.value = false
  }
}

async function onCreate() {
  const label = newLabel.value.trim()
  if (!label || saving.value) return
  saving.value = true
  error.value = null
  try {
    const created = await createSource({ label })
    sources.value = [...sources.value, created]
    newLabel.value = ''
    ElMessage.success(t('sources.created'))
  } catch (e: any) {
    error.value = e?.message ?? t('ui.requestFailed')
  } finally {
    saving.value = false
  }
}

onMounted(reload)

async function remove(source: Source) {
  if (saving.value) return
  saving.value = true
  error.value = null
  try {
    try { await ElMessageBox.confirm(t('sources.deleteConfirm', { name: source.label }), t('sources.delete'), { type: 'warning' }) } catch { return }
    await deleteSource(source.id)
    await reload()
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message
  } finally { saving.value = false }
}
</script>

<template>
  <div class="sources-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ t('app.title') }}</p>
        <h1>{{ t('sources.heading') }}</h1>
        <p class="subtitle">{{ t('sources.subtitle') }}</p>
      </div>
    </header>

    <ErrorBanner :message="error" />

    <section class="heph-card">
      <h2>{{ t('sources.new') }}</h2>
      <div class="create-row">
        <el-input
          v-model="newLabel"
          :placeholder="t('sources.createPlaceholder')"
          style="max-width: 360px"
          @keyup.enter="onCreate"
        />
        <el-button type="primary" :loading="saving" :disabled="!newLabel.trim()" @click="onCreate">
          {{ t('app.addNew') }}
        </el-button>
      </div>
      <p class="hint"><router-link to="/imports/new">{{ t('google.sourceHint') }}</router-link></p>
    </section>

    <section class="heph-card">
      <h2>{{ t('sources.heading') }}</h2>
      <EmptyState v-if="sources.length === 0 && !loading" :title="t('sources.noSources')" />
      <el-table v-else :data="sources" v-loading="loading">
		<el-table-column :label="t('app.actions')" width="120">
		  <template #default="{ row }"><el-button type="danger" link :disabled="saving" @click="remove(row)">{{ t('sources.delete') }}</el-button></template>
		</el-table-column>
        <el-table-column :label="t('app.actions')" prop="label" />
        <el-table-column :label="t('ui.kind')" width="180">
          <template #default="{ row }">{{ t(`sources.kind.${row.kind || 'manual_file'}`) }}</template>
        </el-table-column>
      </el-table>
    </section>
  </div>
</template>

<style scoped>
.sources-page {
  display: flex;
  flex-direction: column;
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
.create-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.hint {
  color: var(--heph-muted);
  font-size: 0.85rem;
  margin-top: 12px;
}
</style>
