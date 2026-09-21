<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEChart } from '@/composables/useEChart'
import { useSettingsStore } from '@/store/settings'
import { formatNzd } from '@/utils/format'
import type { PeriodList } from '@/types/income'

const props = defineProps<{ series: PeriodList | null; group: 'day' | 'week' | 'month' }>()
const { t, locale } = useI18n()
const settings = useSettingsStore()
const target = ref<HTMLElement | null>(null)

useEChart(target, colors => {
  const items = props.series?.items ?? []
  const isBar = props.group === 'day'
  const labels = items.map(p => new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    ...(props.group === 'month' ? { year: '2-digit' as const } : { day: 'numeric' as const }),
    timeZone: 'UTC',
  }).format(new Date(p.start + 'T00:00:00Z')))
  // Currency is a reactive dependency even when only tooltip formatting changes.
  const currency = settings.currency
  return {
    animation: items.length <= 80,
    color: [colors.primary, colors.secondary],
    textStyle: { fontFamily: 'inherit', color: colors.muted },
    grid: { top: 14, left: 8, right: 14, bottom: 50, containLabel: true },
    legend: {
      bottom: 0, left: 0, type: 'scroll', icon: 'roundRect',
      itemWidth: 10, itemHeight: 6, textStyle: { color: colors.muted, fontSize: 10 },
      pageTextStyle: { color: colors.muted },
    },
    tooltip: {
      trigger: 'axis', confine: true, backgroundColor: colors.paper,
      borderColor: colors.line, textStyle: { color: colors.ink, fontSize: 12 },
      valueFormatter: (value: unknown) => formatNzd(String(Math.round(Number(value) * 100))),
    },
    xAxis: {
      type: 'category', data: labels, boundaryGap: isBar,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: colors.muted, fontSize: 10, hideOverlap: true },
    },
    yAxis: {
      type: 'value', splitNumber: 4,
      axisLabel: {
        color: colors.muted, fontSize: 10,
        formatter: (value: number) => new Intl.NumberFormat(locale.value, {
          style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1,
        }).format(value),
      },
      splitLine: { lineStyle: { color: colors.line, type: 'dashed' } },
    },
    series: [
      { name: t('dashboard.summary.gross'), field: 'gross_cents' as const },
      { name: t('dashboard.summary.cash'), field: 'known_cash_estimate_cents' as const },
    ].map((series, index) => ({
      name: series.name, type: isBar ? 'bar' : 'line',
      data: items.map(p => Number(p.summary[series.field] || 0) / 100),
      smooth: 0.25, showSymbol: items.length === 1, symbolSize: 6,
      lineStyle: { width: 2 },
      areaStyle: !isBar && index === 0 ? { opacity: 0.08 } : undefined,
      barMaxWidth: 18, itemStyle: { borderRadius: isBar ? [3, 3, 0, 0] : 0 },
      emphasis: { focus: 'series' },
    })),
  }
})
</script>

<template>
  <div class="trend-chart">
    <div ref="target" class="chart-canvas" role="img" :aria-label="t('dashboard.trend')" />
    <div v-if="!series?.items.length" class="chart-empty" role="status"><span>{{ t('app.noData') }}</span><small>{{ t('ui.chooseAPeriodOrImportRecordsToSeeYourTrend') }}</small></div>
  </div>
</template>

<style scoped>
.trend-chart { position:relative; height:clamp(200px,24vh,260px); flex:0 0 clamp(200px,24vh,260px); min-width:0; margin-top:10px; }
.chart-canvas { width:100%; height:100%; }
.chart-empty { position:absolute; inset:0 0 50px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:var(--heph-muted); font-size:13px; pointer-events:none; }
.chart-empty small { max-width:230px; text-align:center; font-size:10px; line-height:1.6; }
</style>
