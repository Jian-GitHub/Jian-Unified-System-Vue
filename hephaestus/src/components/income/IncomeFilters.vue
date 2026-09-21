<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import type { QueryParams } from '@/types/income'

const props = defineProps<{ modelValue: QueryParams }>()
const emit = defineEmits<{ 'update:modelValue': [QueryParams]; apply: [] }>()
const { t, locale } = useI18n()
const state = reactive<QueryParams>({ ...props.modelValue })

watch(() => props.modelValue, next => Object.assign(state, next))

const dateRange = computed<[string, string] | null>({
  get: () => state.from && state.to ? [state.from, state.to] as [string, string] : null,
  set: value => {
    state.from = value?.[0]
    state.to = value?.[1]
  },
})

const jobTypes = [
  'POS Installation', 'POS Replacement', 'POS Repair', 'POS Collection',
  'Kiosk Installation', 'Kiosk Replacement', 'Printer Installation',
  'Printer Replacement', 'Printer Repair', 'Card Reader Installation',
]

const teamOptions = computed(() => [
  { value: undefined, label: t('filters.teamAll'), icon: '◎' },
  { value: 'solo' as const, label: t('filters.teamSolo'), icon: '●' },
  { value: 'team' as const, label: t('filters.teamTeam'), icon: '●●' },
])

const sortOptions = computed(() => [
  { value: 'date-desc', label: t('filters.sortDateDesc') },
  { value: 'date-asc', label: t('filters.sortDateAsc') },
  { value: 'gross-desc', label: t('filters.sortGrossDesc') },
  { value: 'cash-desc', label: t('filters.sortCashDesc') },
])

function apply() {
  state.cursor = undefined
  emit('update:modelValue', { ...state })
  emit('apply')
}

function reset() {
  Object.assign(state, {
    from: undefined, to: undefined, type: undefined, team: undefined,
    search: '', sort: 'date-desc', archived: 'active', cursor: undefined,
    limit: props.modelValue.limit,
  })
  apply()
}
</script>

<template>
  <section class="filter-panel" :aria-label="t('ui.filterWorkRecords')">
    <div class="filter-topline">
      <div>
        <span class="filter-kicker">{{ t('ui.refineView') }}</span>
        <strong>{{ t('ui.filterWorkRecords') }}</strong>
      </div>
      <el-button text class="reset-link" @click="reset">↺ {{ t('filters.reset') }}</el-button>
    </div>

    <div class="filter-grid">
      <label class="search-field">
        <span>{{ t('filters.search') }}</span>
        <el-input v-model="state.search" :prefix-icon="Search" clearable :placeholder="t('ui.customerJobOrEquipment')" @keyup.enter="apply" />
      </label>
      <label>
        <span>{{ t('ui.dateRange') }}</span>
        <el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" unlink-panels popper-class="heph-date-range-popper" :start-placeholder="t('filters.from')" :end-placeholder="t('filters.to')" />
      </label>
      <label>
        <span>{{ t('filters.jobType') }}</span>
        <el-select v-model="state.type" filterable clearable :placeholder="t('ui.allJobTypes')">
          <el-option v-for="type in jobTypes" :key="type" :label="type" :value="type" />
        </el-select>
      </label>
      <label>
        <span>{{ t('filters.sort') }}</span>
        <el-select v-model="state.sort">
          <el-option v-for="option in sortOptions" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
      </label>
    </div>

    <div class="filter-footer">
      <div class="choice-group">
        <span>{{ t('filters.team') }}</span>
        <el-radio-group :model-value="state.team ?? 'all'" class="choice-cards" @update:model-value="value => state.team = value === 'all' ? undefined : value as 'solo' | 'team'">
          <el-radio-button v-for="option in teamOptions" :key="String(option.value)" :value="option.value ?? 'all'">
            <i>{{ option.icon }}</i>{{ option.label }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div class="choice-group">
        <span>{{ t('filters.archived') }}</span>
        <el-radio-group v-model="state.archived" class="choice-cards compact">
          <el-radio-button value="active">{{ t('filters.archivedActive') }}</el-radio-button>
          <el-radio-button value="all">{{ t('filters.archivedAll') }}</el-radio-button>
          <el-radio-button value="archived">{{ t('filters.archivedOnly') }}</el-radio-button>
        </el-radio-group>
      </div>
      <el-button type="primary" class="apply-button" @click="apply">{{ t('filters.apply') }} →</el-button>
    </div>
  </section>
</template>

<style scoped>
.filter-panel { padding:20px 22px; border:1px solid var(--heph-line); border-radius:10px; background:var(--heph-paper-solid); box-shadow:none; }
.filter-topline,.filter-footer { display:flex; align-items:center; justify-content:space-between; gap:18px; }
.filter-topline { margin-bottom:18px; }.filter-kicker { display:block; margin-bottom:3px; color:var(--heph-pine-2); font-size:9px; font-weight:800; letter-spacing:.16em; }.filter-topline strong { font-size:14px; }
.reset-link { border:0; background:transparent; color:var(--heph-muted); cursor:pointer; font-size:12px; }.reset-link:hover { color:var(--heph-pine-2); }
.filter-grid { display:grid; grid-template-columns:1.35fr 1.2fr 1fr 1fr; gap:12px; }.filter-grid label { display:grid; gap:7px; min-width:0; }.filter-grid label > span,.choice-group > span { color:var(--heph-muted); font-size:10px; font-weight:700; letter-spacing:.04em; }
.filter-grid :deep(.el-date-editor) { width:100%; }.filter-grid :deep(.el-input__wrapper),.filter-grid :deep(.el-select__wrapper),.filter-grid :deep(.el-date-editor) { min-height:42px; border-radius:7px !important; }
.filter-footer { margin-top:16px; padding-top:15px; border-top:1px solid var(--heph-line); }.choice-group { display:grid; gap:7px; }.choice-cards { display:flex; padding:3px; border-radius:7px; background:var(--heph-canvas-soft); }.apply-button { margin-left:auto; min-width:118px; min-height:40px; }
@media(max-width:1100px) { .filter-grid { grid-template-columns:1fr 1fr; }.filter-footer { align-items:flex-end; flex-wrap:wrap; } }
@media(max-width:650px) { .filter-panel { padding:17px 15px; }.filter-grid { grid-template-columns:1fr; }.filter-footer { align-items:stretch; flex-direction:column; }.choice-cards { overflow-x:auto; }.apply-button { width:100%; } }
.choice-cards { flex-wrap:wrap; gap:4px; }
.choice-cards :deep(.el-radio-button__inner) { white-space:normal; line-height:1.5; }
.choice-cards i { margin-right:5px; font-size:8px; font-style:normal; }
@media(max-width:650px) {
  .choice-cards :deep(.el-radio-button) { flex:1; }
  .choice-cards :deep(.el-radio-button__inner) { width:100%; padding:10px 8px; }
}
</style>
