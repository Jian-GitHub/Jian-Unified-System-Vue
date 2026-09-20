<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue'
import GoogleSheetsImport from '@/components/GoogleSheetsImport.vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

import ErrorBanner from '@/components/common/ErrorBanner.vue'

import { createSource, listSources, stageImport } from '@/api/imports'
import type { Source } from '@/types/income'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

const sources = ref<Source[]>([])
const newSourceName = ref('')
const sourceId = ref<string>('')
const file = ref<File | null>(null)
const submitting = ref(false)
const creating = ref(false)
const error = ref<string | null>(null)

async function loadSources() {
  const out = await listSources()
  sources.value = out.items
  const requested = route.query.source_id
  if (typeof requested === 'string' && out.items.some(s => s.id === requested)) sourceId.value = requested
  if (out.items.length && !sourceId.value) sourceId.value = out.items[0].id
}

async function onCreateSource() {
  if (!newSourceName.value.trim() || creating.value) return
  creating.value = true
  error.value = null
  try {
    const created = await createSource({ label: newSourceName.value.trim() })
    sources.value = [...sources.value, created]
    sourceId.value = created.id
    newSourceName.value = ''
    ElMessage.success(t('sources.created'))
  } catch (e: any) { error.value = e?.message ?? t('imports.new.parseFailed') }
  finally { creating.value = false }
}

async function onSubmit() {
  if (submitting.value) return
  if (!sourceId.value) {
    error.value = 'Please choose or create a source.'
    return
  }
  if (!file.value) {
    error.value = 'Please choose a file.'
    return
  }
  if (!/\.(csv|xlsx)$/i.test(file.value.name) || file.value.size > 10 * 1024 * 1024) {
    error.value = t('imports.new.uploadHint')
    return
  }
  submitting.value = true
  error.value = null
  try {
    const batch = await stageImport(sourceId.value, file.value)
    ElMessage.success(t('imports.new.staged'))
    await router.replace({ name: 'import-detail', params: { id: batch.id }, query: { template_id: route.query.template_id } })
  } catch (e: any) {
    error.value = e?.message ?? t('imports.new.parseFailed')
  } finally {
    submitting.value = false
  }
}

const acceptedTypes = computed(() => '.csv,.xlsx')

const stepState = reactive({ step: 1 })
onMounted(() => loadSources().catch((e) => { error.value = e?.message ?? t('ui.requestFailed') }))
</script>

<template>
  <div class="import-new-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">{{ t('app.title') }}</p>
        <h1>{{ t('imports.new.heading') }}</h1>
        <p class="subtitle">{{ t('imports.new.step1') }} · {{ t('imports.new.step2') }} · {{ t('imports.new.step3') }} · {{ t('imports.new.step4') }}</p>
      </div>
      <el-button @click="router.push({ name: 'imports' })">{{ t('app.back') }}</el-button>
    </header>

    <ErrorBanner :message="error" />

    <section class="heph-card">
      <h2>{{ t('imports.new.step1') }} — {{ t('imports.new.chooseSource') }}</h2>
      <div class="source-row">
        <el-select v-model="sourceId" :placeholder="t('imports.new.chooseSource')" style="min-width: 240px">
          <el-option v-for="s in sources" :key="s.id" :value="s.id" :label="s.label" />
        </el-select>
        <div class="new-source">
          <el-input
            v-model="newSourceName"
            :placeholder="t('imports.new.sourceName')"
            style="width: 240px"
            @keyup.enter="onCreateSource"
          />
          <el-button @click="onCreateSource" :loading="creating" :disabled="!newSourceName.trim() || creating">
            {{ t('imports.new.newSource') }}
          </el-button>
        </div>
      </div>
      <p class="hint">{{ t('google.sourceHint') }}</p>
      <p class="hint">{{ t('aimer.syncHint') }}</p>
    </section>

    <section class="heph-card">
      <h2>{{ t('imports.new.uploadFile') }}</h2>
      <p class="hint">{{ t('imports.new.uploadHint') }}</p>
      <input
        type="file"
        :accept="acceptedTypes"
        @change="(e: any) => (file = e.target.files?.[0] ?? null)"
      />
      <p v-if="file" class="filename">{{ file.name }} ({{ (file.size / 1024).toFixed(1) }} KiB)</p>
    </section>

    <GoogleSheetsImport :source-id="sourceId" />

    <div class="actions">
      <el-button @click="router.push({ name: 'imports' })">{{ t('app.cancel') }}</el-button>
      <el-button
        type="primary"
        :loading="submitting"
        :disabled="!file || !sourceId"
        @click="onSubmit"
      >
        {{ submitting ? t('imports.new.uploading') : t('imports.new.upload') }}
      </el-button>
    </div>
  </div>
</template>

<style scoped>
.import-new-page {
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
  letter-spacing: 0.04em;
}
.source-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 12px 0;
}
.new-source {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}
.source-row > *, .new-source > * { max-width: 100%; }
.hint {
  color: var(--heph-muted);
  font-size: 0.85rem;
  margin: 8px 0 0;
}
.filename {
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--heph-pine-2);
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
