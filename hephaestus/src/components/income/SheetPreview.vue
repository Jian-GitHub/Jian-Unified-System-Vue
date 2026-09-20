<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { readSheet, type SheetData } from '@/api/imports'
import ErrorBanner from '@/components/common/ErrorBanner.vue'

const props = defineProps<{ batchId: string; sheets: string[] }>()
const { t, locale } = useI18n()
const sheet = ref('')
const result = ref<SheetData | null>(null)
const loading = ref(false)
const downloading = ref(false)
const error = ref('')
const page = ref(1)
let request = 0
async function load(target = 1) {
  const current = ++request
  loading.value = true
  error.value = ''
  try {
    const data = await readSheet(props.batchId, sheet.value, String((target - 1) * 100))
    if (current !== request) return
    result.value = data
    page.value = target
  } catch (e: any) { if (current === request) error.value = e?.message ?? t('ui.readSheetFailed') }
  finally { if (current === request) loading.value = false }
}
watch(() => props.batchId, () => {
  sheet.value = props.sheets[0] || ''
  result.value = null
  load()
}, { immediate: true })
const columns = computed(() => Math.max(0, ...(result.value?.items || []).map(row => row.cells?.length || 0)))
const letter = (index: number): string => index < 26 ? String.fromCharCode(65 + index) : letter(Math.floor(index / 26) - 1) + letter(index % 26)
async function download() {
  if (downloading.value) return
  downloading.value = true
  error.value = ''
  const id = props.batchId
  try {
    const XLSX = await import('xlsx')
    const workbook = XLSX.utils.book_new()
    for (const name of props.sheets) {
      const cells: string[][] = []
      let cursor = ''
      do {
        const data = await readSheet(id, name, cursor)
        cells.push(...data.items.map(row => row.cells))
        if (data.next_cursor && data.next_cursor === cursor) throw new Error('Invalid spreadsheet pagination.')
        cursor = data.next_cursor
      } while (cursor)
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(cells), name)
    }
    XLSX.writeFile(workbook, `import-${id}.xlsx`)
  } catch (e: any) { error.value = e?.message ?? t('ui.downloadFailed') }
  finally { downloading.value = false }
}
</script>
<template>
  <section class="heph-card sheet-preview">
    <header><h2>{{ t('ui.savedSpreadsheetSnapshot') }}</h2>
      <el-select v-model="sheet" :disabled="loading" @change="load(1)" style="width:200px">
        <el-option v-for="name in sheets" :key="name" :label="name" :value="name" />
      </el-select>
      <el-button :loading="loading" @click="load(page)">{{ t('ui.refresh') }}</el-button>
      <el-button :loading="downloading" @click="download">{{ t('ui.downloadSnapshotXlsx') }}</el-button>
    </header>
    <ErrorBanner :message="error" />
    <el-table :data="result?.items || []" height="300" border v-loading="loading">
      <el-table-column prop="row" label="#" width="64" fixed />
      <el-table-column v-for="column in columns" :key="column" :label="`${letter(column - 1)} · ${column - 1}`" min-width="140">
        <template #default="{ row }">{{ row.cells?.[column - 1] ?? '' }}</template>
      </el-table-column>
    </el-table>
    <footer><span>{{ t('ui.originalCellsZeroBasedColumnIndexes') }} · {{ result?.total || 0 }} {{ t('ui.rows') }}</span>
      <el-button :disabled="loading || page === 1" @click="load(page - 1)">{{ t('ui.previous') }}</el-button>
      <span>{{ page }}</span><el-button :disabled="loading || !result?.next_cursor" @click="load(page + 1)">{{ t('ui.next') }}</el-button>
    </footer>
  </section>
</template>
<style scoped>
.sheet-preview { display:grid; gap:12px; }.sheet-preview header,.sheet-preview footer { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }.sheet-preview h2,.sheet-preview footer > span:first-child { margin-right:auto; }.sheet-preview footer { color:var(--heph-muted); font-size:12px; }
</style>
