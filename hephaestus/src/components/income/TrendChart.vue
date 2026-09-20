<script setup lang="ts">
// Wraps Chart.js (line + bar) for income trends.

import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Line, Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'
import { formatNzd } from '@/utils/format'
import type { PeriodList } from '@/types/income'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler)

const props = defineProps<{
  series: PeriodList | null
  group: 'day' | 'week' | 'month'
}>()

const { t, locale } = useI18n()
const dark = ref(false)
const reduced = ref(false)
let observer: MutationObserver | undefined
const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
const syncMotion = () => { reduced.value = motion.matches }
onMounted(() => {
  const sync = () => { dark.value = document.documentElement.dataset.theme === 'dark' }
  sync(); syncMotion()
  observer = new MutationObserver(sync)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  motion.addEventListener('change', syncMotion)
})
onBeforeUnmount(() => { observer?.disconnect(); motion.removeEventListener('change', syncMotion) })
const isBar = computed(() => props.group === 'day')
const animationEnabled = computed(() => !reduced.value && (props.series?.items.length ?? 0) <= 80)

const chartData = computed(() => {
  const items = props.series?.items ?? []
  const labels = items.map((p) => new Intl.DateTimeFormat(locale.value, { month: 'short', ...(props.group === 'month' ? { year: '2-digit' as const } : { day: 'numeric' as const }), timeZone: 'UTC' }).format(new Date(`${p.start}T00:00:00Z`)))
  const datasets = [
    {
      label: t('dashboard.summary.gross'),
      data: items.map((p) => Number(p.summary.gross_cents || 0) / 100),
      borderColor: dark.value ? '#51b996' : '#199b7c',
      backgroundColor: isBar.value ? (dark.value ? '#51b996' : '#199b7c') : 'rgba(25,155,124,.09)',
      tension: 0.32,
      fill: !isBar.value,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: isBar.value ? 0 : 2,
      borderRadius: 3,
      maxBarThickness: 16,
      categoryPercentage: 0.65,
      barPercentage: 0.8,
      borderSkipped: false,
    },
    {
      label: t('dashboard.summary.cash'),
      data: items.map((p) => Number(p.summary.known_cash_estimate_cents || 0) / 100),
      borderColor: dark.value ? '#a5d7b7' : '#bce7cd',
      backgroundColor: dark.value ? '#a5d7b7' : '#bce7cd',
      tension: 0.32,
      fill: false,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: isBar.value ? 0 : 2,
      borderRadius: 3,
      maxBarThickness: 16,
      categoryPercentage: 0.65,
      barPercentage: 0.8,
      borderSkipped: false,
    },
  ]
  return { labels, datasets } as unknown as ChartData<'line' | 'bar', number[], string>
})

const chartOptions = computed<ChartOptions<'line' | 'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: animationEnabled.value ? {
    duration: 650,
    easing: 'easeOutQuart',
    delay: context => context.type === 'data' ? Math.min((context.dataIndex ?? 0) * 22, 220) : 0,
  } : false,
  transitions: { active: { animation: { duration: reduced.value ? 0 : 180 } } },
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: { color: dark.value ? '#94a6ac' : '#88969c', maxRotation: 0, autoSkipPadding: 20, maxTicksLimit: 9, font: { size: 10 } },
    },
    y: {
      beginAtZero: true,
      border: { display: false, dash: [3, 4] },
      grid: { color: dark.value ? '#ffffff09' : '#202c3009', drawTicks: false },
      ticks: {
        color: dark.value ? '#94a6ac' : '#88969c',
        font: { size: 10 }, padding: 10, maxTicksLimit: 5,
        callback: (value) => '$' + new Intl.NumberFormat('en-NZ', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value)),
      },
    },
  },
  plugins: {
    legend: {
      position: 'bottom', align: 'start',
      labels: { color: dark.value ? '#94a6ac' : '#77848a', usePointStyle: true, pointStyle: 'rectRounded', boxWidth: 6, boxHeight: 6, padding: 20, font: { size: 10 } },
    },
    tooltip: {
      backgroundColor: '#183c35',
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatNzd(String(Number(ctx.parsed.y) * 100))}`,
      },
    },
  },
}))
</script>

<template>
  <div class="trend-chart" :role="series?.items.length ? undefined : 'status'">
    <div v-if="!series?.items.length" class="chart-empty"><span>{{ t('app.noData') }}</span><small>{{ t('ui.chooseAPeriodOrImportRecordsToSeeYourTrend') }}</small></div>
    <Bar v-if="isBar" :data="chartData as any" :options="chartOptions as any" />
    <Line v-else :data="chartData as any" :options="chartOptions as any" />
  </div>
</template>

<style scoped>
.trend-chart {
  position: relative;
  height: clamp(160px, 20vh, 205px);
  min-height: 0;
  margin-top: 10px;
  flex: 0 0 clamp(160px, 20vh, 205px);
  min-width: 0;
}
.trend-chart :deep(canvas) { position: absolute; inset: 0; }
.chart-empty { position: absolute; inset: 0 0 40px; z-index: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: var(--heph-muted); font-size: 13px; }.chart-empty small { max-width: 230px; text-align: center; font-size: 10px; line-height: 1.6; }
</style>
