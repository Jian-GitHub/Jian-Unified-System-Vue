<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { googleStatus, googleConnect, googleDisconnect, stageGoogle, listBatches, getBatch } from '@/api/imports'
import type { Batch } from '@/types/income'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import SheetPreview from '@/components/income/SheetPreview.vue'

const props = defineProps<{ sourceId: string }>()
const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const connected = ref(false)
const bound = ref(false)
const busy = ref(false)
const error = ref<string | null>(null)
const spreadsheet = ref('')
const area = ref('Sheet1!A1:Z1000')
const previous = ref<Batch[]>([])
const selectedBatch = ref('')
const adding = ref(false)
const savedTables = computed(() => {
  const seen = new Set<string>()
  return previous.value.filter(batch => {
    if (!batch.spreadsheet || batch.deleted || batch.source_id !== props.sourceId) return false
    const key = `${batch.spreadsheet}|${batch.range}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})
const selectedTable = computed(() => previous.value.find(batch => batch.id === selectedBatch.value))
function selectTable(batch: Batch) {
  selectedBatch.value = batch.id
  spreadsheet.value = batch.spreadsheet || ''
  area.value = batch.range || 'Sheet1!A1:Z1000'
  adding.value = false
}
function addTable() {
  selectedBatch.value = ''
  spreadsheet.value = ''
  adding.value = true
}
watch(() => props.sourceId, () => {
  selectedBatch.value = ''
  spreadsheet.value = ''
  if (savedTables.value[0]) selectTable(savedTables.value[0])
})
async function perform(task: () => Promise<void>) {
  if (busy.value) return
  busy.value = true
  error.value = null
  try { await task() } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? t('google.failed')
  } finally { busy.value = false }
}
onMounted(() => perform(async () => {
  const [status, batches] = await Promise.allSettled([googleStatus(), listBatches()])
  if (batches.status === 'fulfilled') previous.value = batches.value.items
  else error.value = batches.reason?.message ?? t('google.failed')
  if (status.status === 'fulfilled') {
    connected.value = status.value.connected
    bound.value = status.value.bound
  } else error.value = status.reason?.message ?? t('google.failed')
  if (typeof route.query.template_id === 'string') {
    const template = await getBatch(route.query.template_id)
    if (template.spreadsheet && template.source_id === props.sourceId) selectTable(template)
  }
  if (!selectedBatch.value && savedTables.value[0]) selectTable(savedTables.value[0])
  if (route.query.google === 'failed') error.value = t('google.failed')
}))
const connect = () => perform(async () => {
  const result = await googleConnect()
  window.location.assign(result.url)
})
const disconnect = () => perform(async () => {
  await googleDisconnect()
  connected.value = false
})
const read = () => perform(async () => {
  if (!connected.value || !props.sourceId || !spreadsheet.value.trim() || !area.value.trim()) {
    throw new Error(t('google.mapping'))
  }
  const batch = await stageGoogle(props.sourceId, spreadsheet.value.trim(), area.value.trim())
  await router.push({ name: 'import-detail', params: { id: batch.id }, query: { template_id: selectedBatch.value || undefined } })
})
</script>

<template>
  <section class="heph-card google-import" v-loading="busy">
    <h2>Google Sheets</h2>
    <p>{{ t('google.explanation') }}</p>
    <ErrorBanner :message="error" />
    <p v-if="!bound">{{ t('google.bindFirst') }}</p>
    <div class="buttons">
      <el-button :disabled="!bound || busy" @click="connect">{{ connected ? t('google.reconnect') : t('google.connect') }}</el-button>
      <el-button v-if="connected" :disabled="busy" @click="disconnect">{{ t('google.disconnect') }}</el-button>
      <span>{{ connected ? t('google.connected') : t('google.disconnected') }}</span>
    </div>
    <div v-if="savedTables.length" class="saved-tables">
      <h3>{{ t('ui.savedSpreadsheets') }}</h3>
      <button v-for="batch in savedTables" :key="batch.id" type="button" :class="['saved-table', { selected: selectedBatch === batch.id }]" @click="selectTable(batch)">
        <strong>{{ batch.range || 'Google Sheets' }}</strong><span>{{ batch.spreadsheet }}</span>
        <small>{{ t('ui.selectToReadTheLatestData') }}</small>
      </button>
      <el-button @click="addTable">{{ t('ui.addAnotherSpreadsheet') }}</el-button>
      <el-button v-if="selectedBatch" @click="router.push({ name: 'import-detail', params: { id: selectedBatch } })">{{ t('ui.viewSavedContents') }}</el-button>
    </div>
    <SheetPreview v-if="selectedTable?.sheets?.length" :key="selectedTable.id" :batch-id="selectedTable.id" :sheets="selectedTable.sheets" />
    <el-form label-position="top" @submit.prevent="read">
      <el-form-item v-if="adding || !selectedBatch" :label="t('google.link')"><el-input v-model="spreadsheet" placeholder="https://docs.google.com/spreadsheets/d/…" /></el-form-item>
      <el-form-item :label="t('google.range')"><el-input v-model="area" placeholder="Sheet1!A1:Z1000" /></el-form-item>
      <p>{{ t('google.mapping') }}</p>
      <el-button type="primary" :disabled="busy || !connected || !sourceId || !spreadsheet.trim() || !area.trim()" @click="read">{{ t('google.read') }}</el-button>
    </el-form>
  </section>
</template>

<style scoped>
.google-import { display: grid; gap: 12px; }
.google-import p { color: var(--heph-muted); font-size: .9rem; }
.buttons { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.saved-table { width: min(360px, 100%); min-width: 0; }
.saved-tables { display:flex; gap:10px; flex-wrap:wrap; align-items:center; }.saved-tables h3 { width:100%; }.saved-table { display:grid; text-align:left; gap:6px; padding:12px; max-width:360px; border:1px solid var(--heph-line); border-radius:8px; background:var(--heph-paper-solid); cursor:pointer; }.saved-table span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:var(--heph-muted); font-size:12px; }.saved-table.selected { border-color:var(--heph-pine); background:var(--heph-mint); }
</style>
