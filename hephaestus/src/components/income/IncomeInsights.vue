<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Summary, PeriodList } from '@/types/income'
import { formatNzd } from '@/utils/format'
import AnimatedValue from '@/components/common/AnimatedValue.vue'
import { vSpotlight } from '@/directives/motion'

const props = defineProps<{ summary: Summary | null; days: PeriodList | null }>()
const { t, locale } = useI18n()
const gross = computed(() => Number(props.summary?.gross_cents || 0))
const tax = computed(() => Number(props.summary?.tax_estimate_cents || 0))
const net = computed(() => Number(props.summary?.net_estimate_cents || 0))
const expense = computed(() => Number(props.summary?.known_expense_cents || 0))
const cash = computed(() => Number(props.summary?.known_cash_estimate_cents || 0))
const active = computed(() => (props.days?.items || []).filter(item => item.summary.record_count > 0))
const average = computed(() => active.value.length ? Math.round(gross.value / active.value.length) : 0)
const bestDay = computed(() => active.value.reduce((best, item) => Number(item.summary.gross_cents || 0) > Number(best?.summary.gross_cents || 0) ? item : best, active.value[0]))
const netShare = computed(() => gross.value > 0 ? Math.min(100, Math.max(0, net.value / gross.value * 100)) : 0)
const ringLength = 2 * Math.PI * 64
const breakdown = computed(() => [
  { label: t('ui.netWages'), value: net.value, tone: 'net' },
  { label: t('ui.estWithholding'), value: tax.value, tone: 'tax' },
  { label: t('ui.knownExpenseReturns'), value: expense.value, tone: 'expense' },
])
const shortDate = (iso?: string) => iso ? new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`)) : '—'
</script>

<template>
  <article v-spotlight class="heph-card settlement-card">
    <header><div><h2>{{ t('ui.incomeBreakdown') }}</h2><p>{{ t('ui.understandWhereYourEarningsGo') }}</p></div><span class="estimate-badge">{{ t('ui.estimated') }}</span></header>
    <div class="income-ring" role="img" :aria-label="gross > 0 ? t('ui.netShare', { percent: netShare.toFixed(1) }) : (t('ui.noIncomeData'))">
      <svg viewBox="0 0 164 164" aria-hidden="true"><circle cx="82" cy="82" r="64" fill="none" stroke="var(--heph-canvas-soft)" stroke-width="15" /><circle v-if="gross > 0" cx="82" cy="82" r="64" fill="none" stroke="var(--heph-lime)" stroke-width="15" /><circle class="retained-ring" v-if="gross > 0" cx="82" cy="82" r="64" fill="none" stroke="var(--heph-pine-2)" stroke-width="15" stroke-linecap="round" :stroke-dasharray="`${ringLength * netShare / 100} ${ringLength}`" transform="rotate(-90 82 82)" /></svg>
      <div class="ring-label"><small>{{ t('ui.takeHomeShare') }}</small><strong><AnimatedValue :value="gross > 0 ? `${netShare.toFixed(0)}%` : '—'" /></strong><span>{{ t('ui.ofGrossEarnings') }}</span></div>
    </div>
    <div class="breakdown-legend"><div v-for="item in breakdown" :key="item.tone"><span :class="['legend-dot', item.tone]"></span><span>{{ item.label }}</span><strong>{{ summary ? formatNzd(String(item.value)) : '—' }}</strong></div></div>
    <footer><span>{{ t('ui.totalEstimatedCash') }}</span><strong><AnimatedValue :value="summary ? formatNzd(String(cash)) : '—'" /></strong></footer>
    <div class="workday-summary"><span>{{ active.length }} {{ t('ui.activeDays') }}</span><span>{{ formatNzd(String(average)) }} {{ t('ui.activeDay') }}</span><span :title="bestDay ? formatNzd(bestDay.summary.gross_cents) : ''">{{ t('ui.best') }} · {{ shortDate(bestDay?.start) }}</span></div>
  </article>
</template>
<style scoped>
.settlement-card { padding: 12px 16px; display: flex; flex-direction: column; }.settlement-card header { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }.settlement-card h2 { margin: 0; font-size: 15px; }.settlement-card header p { margin: 7px 0 0; color: var(--heph-muted); font-size: 10px; }.estimate-badge { padding: 4px 7px; border-radius: 4px; background: var(--heph-canvas-soft); color: var(--heph-muted); font-size: 10px; }
.income-ring { position: relative; width: 116px; height: 116px; flex: none; margin: 3px auto; }.income-ring svg { width: 100%; height: 100%; }.ring-label { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }.ring-label small { font-size: 9px; color: var(--heph-muted); }.ring-label strong { font-size: 26px; line-height: 1.1; letter-spacing: -1px; font-weight: 600; }.ring-label span { font-size: 9px; color: var(--heph-muted); }
.retained-ring { transition: stroke-dasharray .65s var(--heph-ease); }
.breakdown-legend { display: grid; gap: 6px; }.breakdown-legend > div { display: flex; align-items: center; gap: 7px; font-size: 11px; color: var(--heph-muted); }.legend-dot { width: 6px; height: 6px; border-radius: 2px; flex: none; }.legend-dot.net { background: var(--heph-pine-2); }.legend-dot.tax { background: var(--heph-lime); }.legend-dot.expense { background: var(--heph-blue); }.breakdown-legend strong { margin-left: auto; color: var(--heph-ink); font-size: 10px; font-weight: 550; }.settlement-card footer { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 11px; padding-top: 10px; border-top: 1px solid var(--heph-line); font-size: 11px; }.settlement-card footer strong { font-size: 15px; color: var(--heph-pine); letter-spacing: -.4px; }.workday-summary { line-height: 1.35; display: flex; flex-wrap: wrap; gap: 4px 8px; margin-top: 6px; color: var(--heph-muted); font-size: 10px; }
@media(prefers-reduced-motion:reduce) { .retained-ring { transition: none; } }
</style>
