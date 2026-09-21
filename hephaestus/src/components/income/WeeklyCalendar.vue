<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Period, PeriodList } from '@/types/income'
import { formatNzd, todayInAucklandIso } from '@/utils/format'
import { vSpotlight } from '@/directives/motion'

const props = defineProps<{ weeks: PeriodList | null; totalCents: string }>()
const emit = defineEmits<{ day: [string] }>()
const { t, locale } = useI18n()

interface DayCell { date: string; gross: number; pending: number; jobs: number }
interface WeekRow { start: string; end: string; total: number; jobs: number; days: DayCell[] }

const todayIso = todayInAucklandIso()
const mondayOf = (iso: string) => {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d))
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
  return date.toISOString().slice(0, 10)
}

const weeksView = computed<WeekRow[]>(() => {
  const items = (props.weeks?.items ?? []) as Period[]
  const dayMap = new Map(items.filter(item => item.start && item.summary).map(item => [item.start, item.summary]))
  const dates = [...dayMap.keys()].sort()
  if (!dates.length) return []
  const rows: WeekRow[] = []
  const cursor = new Date(`${mondayOf(dates[0])}T00:00:00Z`)
  const end = new Date(`${dates[dates.length - 1]}T00:00:00Z`)
  while (cursor <= end) {
    const days: DayCell[] = []
    for (let i = 0; i < 7; i += 1) {
      const date = cursor.toISOString().slice(0, 10)
      const summary = dayMap.get(date)
      days.push({ date, gross: Number(summary?.gross_cents || 0), pending: summary?.pending_wage_count || 0, jobs: summary?.record_count || 0 })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    rows.push({ start: days[0].date, end: days[6].date, total: days.reduce((sum, day) => sum + day.gross, 0), jobs: days.reduce((sum, day) => sum + day.jobs, 0), days })
  }
  return rows
})

const page = ref(1)
const pageSize = 4
const visibleWeeks = computed(() => weeksView.value.slice((page.value - 1) * pageSize, page.value * pageSize))
watch(weeksView, (weeks) => {
  const currentWeekIndex = weeks.findIndex(week => week.start <= todayIso && todayIso <= week.end)
  page.value = currentWeekIndex >= 0 ? Math.floor(currentWeekIndex / pageSize) + 1 : 1
}, { immediate: true })
const dayLabels = computed(() => Array.from({ length: 7 }, (_, day) => new Intl.DateTimeFormat(locale.value, { weekday: 'short', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, 1 + day)))))
const dayNumber = (iso: string) => String(Number(iso.slice(8, 10)))
const shortDate = (iso: string) => new Intl.DateTimeFormat(locale.value, { month:'short', day:'numeric', timeZone:'UTC' }).format(new Date(`${iso}T00:00:00Z`))
</script>

<template>
  <section v-spotlight class="calendar-card heph-card">
    <header class="calendar-header">
      <div><span class="section-kicker">{{ t('ui.dailyView') }}</span><h2>{{ t('dashboard.calendar') }}</h2></div>
      <div class="calendar-total"><small>{{ t('app.total') }}</small><strong>{{ formatNzd(totalCents) }}</strong></div>
    </header>

    <div v-if="weeksView.length" class="matrix-scroll">
      <div class="calendar-matrix">
        <div class="matrix-heading week-label">{{ t('ui.week') }}</div>
        <div v-for="label in dayLabels" :key="label" class="matrix-heading">{{ label }}</div>
        <template v-for="(week, weekIndex) in visibleWeeks" :key="week.start">
          <div class="week-summary" :style="{ '--row-index': weekIndex }">
            <strong>{{ shortDate(week.start) }} — {{ shortDate(week.end) }}</strong>
            <span>{{ week.jobs }} {{ t('dashboard.summary.records').toLowerCase() }}</span>
            <em>{{ formatNzd(String(week.total)) }}</em>
          </div>
          <button
            v-for="(day, dayIndex) in week.days"
            :key="day.date"
            type="button"
            :class="['day-cell', { active: day.jobs > 0, today: day.date === todayIso }]"
            :title="`${day.date} · ${day.jobs} ${t('dashboard.summary.records').toLowerCase()} · ${formatNzd(String(day.gross))}`"
            :style="{ '--row-index': weekIndex }"
            @click="emit('day', day.date)"
          >
            <span class="day-number"><span class="mobile-day-label">{{ dayLabels[dayIndex] }} </span>{{ dayNumber(day.date) }}</span>
            <strong v-if="day.jobs">{{ formatNzd(String(day.gross)) }}</strong>
            <small v-if="day.jobs">{{ day.jobs }} {{ t('ui.jobs') }}</small>
            <i v-if="day.pending" :aria-label="t('aimer.includesEstimate')"></i>
            <span v-if="!day.jobs" class="empty-mark">·</span>
          </button>
        </template>
      </div>
    </div>
    <el-pagination v-if="weeksView.length > pageSize" v-model:current-page="page" :page-size="pageSize" :total="weeksView.length" layout="prev, pager, next" class="list-pagination" />
    <div v-if="!weeksView.length" class="placeholder">{{ t('dashboard.noSummary') }}</div>
  </section>
</template>

<style scoped>
.calendar-card { min-width:0; padding:12px 16px; }.calendar-header { display:flex; align-items:flex-start; justify-content:space-between; gap:14px; margin-bottom:12px; }.section-kicker { display:block; margin-bottom:3px; color:var(--heph-pine-2); font-size:10px; font-weight:500; letter-spacing:.1em; }.calendar-header h2 { margin:0; font-size:14px; }.calendar-total { text-align:right; }.calendar-total small { display:block; color:var(--heph-muted); font-size:10px; }.calendar-total strong { color:var(--heph-pine); font-size:16px; }
.matrix-scroll { overflow-x:auto; padding-bottom:4px; }.calendar-matrix { display:grid; grid-template-columns:140px repeat(7,minmax(82px,1fr)); min-width:760px; overflow:hidden; border:1px solid var(--heph-line); border-radius:8px; background:var(--heph-paper-solid); }.matrix-heading { padding:9px 8px; border-bottom:1px solid var(--heph-line); color:var(--heph-muted); background:var(--heph-canvas-soft); font-size:10px; font-weight:800; letter-spacing:.08em; text-align:center; }.matrix-heading.week-label { padding-left:12px; text-align:left; }
.week-summary,.day-cell { min-height:50px; border:0; border-bottom:1px solid var(--heph-line); animation:row-enter .45s var(--heph-ease) both; animation-delay:calc(var(--row-index) * 45ms); }.week-summary { display:flex; flex-direction:column; justify-content:center; padding:4px 10px; background:color-mix(in srgb,var(--heph-canvas-soft) 56%,var(--heph-paper-solid)); }.week-summary strong { font-size:10px; }.week-summary span { margin-top:0; color:var(--heph-muted); font-size:10px; }.week-summary em { margin-top:1px; color:var(--heph-pine); font-size:10px; font-style:normal; font-weight:750; }
.day-cell { position:relative; display:flex; flex-direction:column; align-items:flex-start; justify-content:center; min-width:0; padding:8px 9px; border-left:1px solid var(--heph-line); color:var(--heph-muted); background:var(--heph-paper-solid); cursor:pointer; font:inherit; text-align:left; transition:background .2s ease,box-shadow .2s ease,transform .2s var(--heph-ease); }.day-cell:hover { z-index:2; transform:translateY(-2px); background:color-mix(in srgb,var(--heph-mint) 28%,var(--heph-paper-solid)); box-shadow:0 9px 20px rgba(22,63,53,.1); }.day-cell.active { background:color-mix(in srgb,var(--heph-mint) 30%,var(--heph-paper-solid)); }.day-cell.today { box-shadow:inset 0 0 0 1px var(--heph-amber); }.day-cell:focus-visible { z-index:3; outline:2px solid var(--heph-pine-2); outline-offset:-2px; }.day-number { position:absolute; top:7px; right:8px; color:var(--heph-muted); font-size:10px; }.day-cell strong { max-width:100%; overflow:hidden; color:var(--heph-pine); font-size:12px; letter-spacing:-.03em; text-overflow:ellipsis; white-space:nowrap; }.day-cell small { margin-top:3px; font-size:10px; }.day-cell i { position:absolute; bottom:7px; right:8px; width:5px; height:5px; border-radius:50%; background:var(--heph-amber); }.empty-mark { margin:auto; color:var(--heph-line-strong); font-size:16px; }.calendar-matrix > :nth-last-child(-n + 8) { border-bottom:0; }.list-pagination { justify-content:flex-end; margin-top:8px; padding-top:6px; }.placeholder { padding:32px 0; color:var(--heph-muted); font-size:13px; text-align:center; }
@keyframes row-enter { from { opacity:0; transform:translateY(8px); } }
@media(max-width:650px) { .calendar-card { padding:14px 12px; }.calendar-matrix { grid-template-columns:110px repeat(7,minmax(72px,1fr)); }.week-summary,.day-cell { min-height:52px; } }
@media(prefers-reduced-motion:reduce) { .week-summary,.day-cell { animation:none; transition:none; } }
.mobile-day-label { display:none; }
@media(max-width:650px) {
  .calendar-header { flex-wrap:wrap; }
  .calendar-matrix { min-width:0; grid-template-columns:repeat(2,minmax(0,1fr)); }
  .matrix-heading { display:none; }
  .week-summary { grid-column:1 / -1; padding:10px; gap:3px; }
  .day-cell { min-height:76px; padding-top:26px; }
  .day-number { left:9px; right:auto; }
  .mobile-day-label { display:inline; }
  .calendar-matrix > :nth-last-child(-n + 8) { border-bottom:1px solid var(--heph-line); }
}
</style>
