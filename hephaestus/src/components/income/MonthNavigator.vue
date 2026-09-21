<script setup lang="ts">
import { computed } from 'vue'
import { Calendar } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import type { QueryParams } from '@/types/income'
import { todayInAucklandIso } from '@/utils/format'

const props = defineProps<{ modelValue: QueryParams }>()
const emit = defineEmits<{ 'update:modelValue': [QueryParams]; change: [] }>()
const { t, locale } = useI18n()

const month = computed({
  get: () => {
    const from = props.modelValue.from
    if (!from || !from.endsWith('-01')) return ''
    const [year, value] = from.split('-').map(Number)
    return props.modelValue.to === new Date(Date.UTC(year, value, 0)).toISOString().slice(0, 10) ? from.slice(0, 7) : ''
  },
  set: (value: string) => select(value),
})

const periodLabel = computed(() => month.value
  ? new Intl.DateTimeFormat(locale.value, { year: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${month.value}-01T00:00:00Z`))
  : props.modelValue.from || props.modelValue.to
    ? `${props.modelValue.from || '…'} — ${props.modelValue.to || '…'}`
    : t('ui.allTimeOverview'))

function select(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value || '')) return
  const [year, selectedMonth] = value.split('-').map(Number)
  emit('update:modelValue', { ...props.modelValue, from: `${value}-01`, to: new Date(Date.UTC(year, selectedMonth, 0)).toISOString().slice(0, 10), cursor: undefined })
  emit('change')
}

function move(offset: number) {
  const [year, value] = (month.value || todayInAucklandIso().slice(0, 7)).split('-').map(Number)
  select(new Date(Date.UTC(year, value - 1 + offset, 1)).toISOString().slice(0, 7))
}

function all() {
  emit('update:modelValue', { ...props.modelValue, from: undefined, to: undefined, cursor: undefined })
  emit('change')
}
</script>

<template>
  <section class="period-bar" :aria-label="t('ui.reportingPeriod')">
    <div class="period-heading">
      <span class="calendar-icon"><el-icon><Calendar /></el-icon></span>
      <div><small>{{ t('ui.reportingPeriod') }}</small><strong>{{ periodLabel }}</strong></div>
    </div>
    <div class="period-controls">
      <el-button circle :aria-label="t('ui.previousMonth')" @click="move(-1)">←</el-button>
      <el-date-picker v-model="month" type="month" value-format="YYYY-MM" :clearable="false" :placeholder="t('ui.chooseMonth')" />
      <el-button circle :aria-label="t('ui.nextMonth')" @click="move(1)">→</el-button>
      <div class="period-presets">
        <el-button text :class="{ active: month === todayInAucklandIso().slice(0, 7) }" @click="select(todayInAucklandIso().slice(0, 7))">{{ t('ui.thisMonth') }}</el-button>
        <el-button text :class="{ active: !modelValue.from && !modelValue.to }" @click="all">{{ t('ui.allTime') }}</el-button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.period-bar { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; border: 1px solid var(--heph-line); border-radius: 10px; background: var(--heph-paper-solid); }
.period-heading { display: flex; align-items: center; gap: 10px; min-width: 175px; }.calendar-icon { display: grid; place-items: center; width: 32px; height: 34px; border: 1px solid var(--heph-line); border-radius: 7px; background: var(--heph-paper-solid); color: var(--heph-muted); }.period-heading small { display: block; margin-bottom: 4px; color: var(--heph-muted); font-size: 10px; font-weight: 500; letter-spacing: .08em; }.period-heading strong { display: block; font-size: 12px; font-weight: 550; }
.period-controls { display: flex; align-items: center; justify-content: flex-end; gap: 6px; flex-wrap: wrap; }.period-controls :deep(.el-date-editor) { width: 145px; }.period-controls :deep(.el-input__wrapper) { min-height: 34px; font-size: 11px; }.period-controls :deep(.el-button.is-circle) { width: 30px; height: 32px; min-height: 32px; border-radius: 6px; background: transparent; border-color: transparent; }
.period-presets { display: flex; gap: 3px; margin-left: 5px; padding: 3px; border: 1px solid var(--heph-line); border-radius: 7px; background: var(--heph-paper-solid); }.period-presets button { min-height: 28px; padding: 0 10px; border: 0; border-radius: 4px; color: var(--heph-muted); background: transparent; cursor: pointer; font: inherit; font-size: 10px; }.period-presets button.active { color: var(--heph-pine); background: var(--heph-mint); }
@media(max-width:1050px) and (min-width:901px) { .period-bar { align-items: flex-start; flex-direction: column; }.period-controls { justify-content: flex-start; } }
@media(max-width:740px) { .period-bar { align-items: flex-start; flex-direction: column; padding: 14px; gap: 12px; }.period-controls { justify-content: flex-start; width: 100%; }.period-controls :deep(.el-date-editor) { flex: 1; min-width: 125px; }.period-presets { margin-left: auto; } }
@media(max-width:450px) { .period-presets { width: 100%; margin: 4px 0 0; }.period-presets button { flex: 1; } }
</style>
