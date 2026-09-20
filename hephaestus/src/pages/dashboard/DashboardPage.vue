<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Download, Plus, Filter, Refresh, Wallet, Money, Clock, Document, ArrowRight, CircleCheck, Warning } from '@element-plus/icons-vue'

import MonthNavigator from '@/components/income/MonthNavigator.vue'
import IncomeInsights from '@/components/income/IncomeInsights.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorBanner from '@/components/common/ErrorBanner.vue'
import IncomeFilters from '@/components/income/IncomeFilters.vue'
import WeeklyCalendar from '@/components/income/WeeklyCalendar.vue'
import TrendChart from '@/components/income/TrendChart.vue'
import AnimatedValue from '@/components/common/AnimatedValue.vue'
import { useLazyRequest } from '@/composables/useLazyRequest'
import { useCursorPagination } from '@/composables/useCursorPagination'
import { vReveal, vSpotlight } from '@/directives/motion'

import { downloadExportCsv, fetchCalendar, fetchSeries, fetchSummary } from '@/api/reporting'
import { listRecords } from '@/api/income'
import { useSettingsStore } from '@/store/settings'
import type { PeriodList, QueryParams, Record, Summary } from '@/types/income'
import { bpsFromPercent, formatHourlyRate, formatNzd, minutesToHours, todayInAucklandIso } from '@/utils/format'
import { errorMessage } from '@/utils/errors'

const { t, locale } = useI18n()
const filtersOpen = ref(false)
const exporting = ref(false)
const updatedAt = ref<Date | null>(null)
const appliedRange = ref('')
const router = useRouter()
const settings = useSettingsStore()
const currentMonth = todayInAucklandIso().slice(0, 7)
const [currentYear, currentMonthNumber] = currentMonth.split('-').map(Number)
const currentMonthEnd = new Date(Date.UTC(currentYear, currentMonthNumber, 0)).toISOString().slice(0, 10)

const actionError = ref<string | null>(null)
const ratePercent = computed(() => settings.defaultRatePercent ?? 20)
const group = ref<'day' | 'week' | 'month'>('week')
const filters = ref<QueryParams>({
  from: `${currentMonth}-01`,
  to: currentMonthEnd,
  sort: 'date-desc',
  archived: 'active',
})

const visualTarget = ref<HTMLElement | null>(null)
const reportingParams = () => ({
  ...filters.value,
  cursor: undefined,
  limit: undefined,
  rate_bps: bpsFromPercent(ratePercent.value),
})

const summaryRequest = useLazyRequest(async () => {
  const params = reportingParams()
  const [current, lifetime] = await Promise.all([
    fetchSummary(params),
    fetchSummary({ archived: 'active', rate_bps: params.rate_bps }).catch(() => null),
  ])
  return {
    current,
    lifetime,
    range: `${params.from || '…'} — ${params.to || '…'}`,
  }
})
const seriesRequest = useLazyRequest(
  () => fetchSeries(group.value, reportingParams()),
  { target: visualTarget },
)
const calendarRequest = useLazyRequest(
  () => fetchCalendar({ ...reportingParams(), group_by: 'day' }),
  { target: visualTarget },
)
const recentPager = useCursorPagination<Record>({
  load: cursor => listRecords({ ...filters.value, cursor, limit: 8 }),
  key: record => record.id,
  preloadDistance: 120,
})
const {
  target: summaryTarget,
  loading: summaryLoading,
  error: summaryError,
  retry: retrySummary,
} = summaryRequest
const {
  loading: seriesLoading,
  error: seriesError,
  retry: retrySeries,
} = seriesRequest
const {
  loading: calendarLoading,
  error: calendarError,
  retry: retryCalendar,
} = calendarRequest
const {
  section: recentTarget,
  items: recent,
  loading: recentLoading,
  error: recentError,
  loaded: recentLoaded,
  hasMore: recentHasMore,
  loadMore: loadMoreRecent,
  retry: retryRecent,
} = recentPager
const recentTable = ref<{ $el: HTMLElement } | null>(null)

const summary = computed<Summary | null>(() => summaryRequest.data.value?.current ?? null)
const allTimeSummary = computed<Summary | null>(() => summaryRequest.data.value?.lifetime ?? null)
const series = computed<PeriodList | null>(() => seriesRequest.data.value)
const calendar = computed<PeriodList | null>(() => calendarRequest.data.value)
const loading = computed(() => summaryRequest.loading.value || seriesRequest.loading.value || calendarRequest.loading.value || recentPager.loading.value)

watch(summaryRequest.data, payload => {
  if (!payload) return
  updatedAt.value = new Date()
  appliedRange.value = payload.range
})
watch(group, seriesRequest.reload)

function reloadFinancials() {
  summaryRequest.reload()
  seriesRequest.reload()
  calendarRequest.reload()
}

function reloadAll() {
  actionError.value = null
  reloadFinancials()
  recentPager.reset()
}

const cashTotal = computed(() => summary.value?.known_cash_estimate_cents ?? '0')

const grossLabel = computed(() => formatNzd(summary.value?.gross_cents ?? '0'))
const netLabel = computed(() => formatNzd(summary.value?.net_estimate_cents ?? '0'))
const cashLabel = computed(() => formatNzd(cashTotal.value))
const allTimeGrossLabel = computed(() => allTimeSummary.value ? formatNzd(allTimeSummary.value.gross_cents) : '—')
const estimatedHourlyLabel = computed(() => formatHourlyRate(summary.value?.known_cash_estimate_cents, summary.value?.duration_minutes ?? 0))
const netHourlyLabel = computed(() => formatHourlyRate(summary.value?.net_estimate_cents, summary.value?.duration_minutes ?? 0))
const hourlyNote = computed(() => t('ui.hourlyNote') + (summary.value && !summary.value.is_complete ? ` · ${t('ui.incomplete')}` : ''))

const completeness = computed(() => {
  if (!summary.value) return ''
  if (summary.value.is_complete) return t('dashboard.isComplete')
  return t('dashboard.notComplete', {
    pending: summary.value.pending_wage_count,
    unknown: summary.value.unknown_expense_count,
  })
})

const activeFilters = computed(() => [filters.value.search, filters.value.type, filters.value.team, filters.value.archived !== 'active' ? filters.value.archived : undefined].filter(Boolean).length)
const updatedLabel = computed(() => updatedAt.value ? new Intl.DateTimeFormat(locale.value, { hour: '2-digit', minute: '2-digit' }).format(updatedAt.value) : '—')
async function exportReport() {
  exporting.value = true
  actionError.value = null
  try {
    await downloadExportCsv(`hephaestus-income-${todayInAucklandIso()}.csv`, { ...filters.value, rate_bps: bpsFromPercent(ratePercent.value) })
  } catch (e: any) {
    actionError.value = errorMessage(e, t('ui.exportFailedPleaseTryAgain'))
  } finally { exporting.value = false }
}

function goToRecords() {
  router.push({ name: 'records', query: filters.value as any })
}

function onRecentTableScroll({ scrollTop }: { scrollTop: number }) {
  const viewport = recentTable.value?.$el.querySelector<HTMLElement>('.el-scrollbar__wrap')
  if (!viewport || viewport.scrollHeight - scrollTop - viewport.clientHeight > 100) return
  void loadMoreRecent()
}
</script>

<template>
  <div class="dashboard-page">
    <header v-reveal class="page-header">
      <div><p class="eyebrow">{{ t('ui.yourFinancesAtAGlance') }}</p><h1>{{ t('ui.incomeOverview') }}<span class="heading-dot"></span></h1><p class="subtitle">{{ t('ui.aClearerViewOfYourWorkEarningsAndEverythingInBetween') }}</p></div>
      <div class="header-actions">
        <div class="all-time-total" :title="t('dashboard.allTimeNote')" v-loading="summaryLoading"><span>{{ t('dashboard.allTimeIncome') }}</span><strong><AnimatedValue :value="allTimeGrossLabel" /></strong></div>
        <el-button :icon="Download" :loading="exporting" @click="exportReport">{{ t('ui.exportReport') }}</el-button><el-button type="primary" :icon="Plus" @click="router.push({ name: 'record-new' })">{{ t('records.new') }}</el-button>
      </div>
    </header>

    <section ref="summaryTarget" v-reveal="70" class="estimate-strip">
      <div class="estimate-status"><span :class="['status-icon', { incomplete: summary && !summary.is_complete }]"><CircleCheck v-if="summary?.is_complete" /><Warning v-else /></span><div><strong>{{ t('ui.knowWhereYourIncomeStands') }}</strong><p>{{ completeness || (t('ui.waitingForIncomeData')) }}</p></div></div>
      <router-link class="rate-settings-link" to="/settings">{{ t('settings.calculation') }} →</router-link>
    </section>

    <div v-reveal="110" class="dashboard-toolbar"><MonthNavigator v-model="filters" @change="reloadAll" /><button type="button" :class="['filter-toggle', { active: filtersOpen || activeFilters }]" :aria-expanded="filtersOpen" aria-controls="dashboard-filters" @click="filtersOpen = !filtersOpen"><Filter />{{ t('app.filter') }}<span v-if="activeFilters" class="filter-count">{{ activeFilters }}</span></button><el-button class="refresh-button" :icon="Refresh" :loading="loading" :aria-label="t('app.refresh')" @click="reloadAll" /></div>
    <IncomeFilters v-show="filtersOpen" id="dashboard-filters" v-model="filters" @apply="reloadAll" />
    <ErrorBanner :message="actionError" />
    <div v-if="summaryError" class="section-error"><ErrorBanner :message="summaryError" /><el-button text @click="retrySummary">{{ t('app.retry') }}</el-button></div>
    <p v-if="summaryError && summary" role="status">{{ t('ui.refreshFailedTheDataBelowIsFromTheLastSuccessfulLoad') }}{{ appliedRange }}</p>

    <section class="summary-grid" v-loading="summaryLoading" :aria-busy="summaryLoading">
      <StatCard v-reveal="140" :label="t('ui.estimatedCashReceived')" :value="summary ? cashLabel : '—'" :note="t('ui.recordsWithKnownWagesAndCostsIncludesRuleEstimates')" :icon="Document" featured :badge="settings.currency" />
      <StatCard
        v-reveal="180"
        :label="t('ui.totalGrossIncome')"
        :value="summary ? grossLabel : '—'"
        :secondary-label="t('ui.estNet')"
        :secondary-value="summary ? netLabel : '—'"
        :note="`${summary?.record_count ?? 0} ${t('ui.recordsNetEstimatedBySourceRules')}`"
        :icon="Wallet"
      />
      <StatCard v-reveal="220" :label="t('ui.estimatedCashPerHour')" :value="estimatedHourlyLabel" :secondary-label="t('ui.netWagesH')" :secondary-value="netHourlyLabel" :note="hourlyNote" :icon="Money" />
      <StatCard v-reveal="260" :label="t('ui.totalHoursWorked')" :value="summary ? minutesToHours(summary.duration_minutes) : '—'" :note="`${t('ui.confirmed')}: ${minutesToHours(summary?.confirmed_duration_minutes ?? 0)}`" :icon="Clock" />
    </section>

    <section ref="visualTarget" class="dashboard-visuals">
      <div v-reveal v-spotlight class="heph-card trend-panel" v-loading="seriesLoading" :aria-busy="seriesLoading">
        <div class="card-header"><div><h2>{{ t('dashboard.trend') }}</h2><p>{{ t('ui.trackGrossEarningsAndEstimatedCashOverTime') }}</p></div><el-radio-group v-model="group" size="small"><el-radio-button value="day">{{ t('dashboard.trendDay') }}</el-radio-button><el-radio-button value="week">{{ t('dashboard.trendWeek') }}</el-radio-button><el-radio-button value="month">{{ t('dashboard.trendMonth') }}</el-radio-button></el-radio-group></div>
        <div v-if="seriesError" class="section-error"><ErrorBanner :message="seriesError" /><el-button text @click="retrySeries">{{ t('app.retry') }}</el-button></div>
        <div class="trend-total"><strong><AnimatedValue :value="summary ? grossLabel : '—'" /></strong><span>{{ settings.currency }}</span><span class="trend-scope">{{ t('ui.currentPeriodGrossWages') }}</span></div>
        <TrendChart :series="series" :group="group" />
      </div>
      <div v-reveal="70" class="insights-lazy" v-loading="calendarLoading" :aria-busy="calendarLoading">
        <IncomeInsights :summary="summary" :days="calendar" />
      </div>
    </section>

    <section v-reveal class="calendar-lazy" v-loading="calendarLoading" :aria-busy="calendarLoading">
      <div v-if="calendarError" class="section-error"><ErrorBanner :message="calendarError" /><el-button text @click="retryCalendar">{{ t('app.retry') }}</el-button></div>
      <WeeklyCalendar @day="date => router.push({ name: 'records', query: { ...filters, from: date, to: date } })" :weeks="calendar" :total-cents="summary?.gross_cents ?? '0'" />
    </section>

    <section ref="recentTarget" v-reveal v-spotlight class="heph-card recent-panel" v-loading="recentLoading && !recentLoaded" :aria-busy="recentLoading">
      <div class="card-header"><div><h2>{{ t('dashboard.recent') }}</h2><p>{{ t('ui.yourLatestWorkAndEarningsAllInOnePlace') }}</p></div><el-button text @click="goToRecords">{{ t('dashboard.viewAll') }}<el-icon class="link-arrow"><ArrowRight /></el-icon></el-button></div>
      <EmptyState v-if="recentLoaded && recent.length === 0 && !recentError" :title="t('dashboard.noSummary')"><el-button type="primary" :icon="Plus" @click="router.push({ name: 'record-new' })">{{ t('records.new') }}</el-button></EmptyState>
      <el-table ref="recentTable" v-else-if="recent.length" :data="recent" :max-height="320" style="width: 100%" @scroll="onRecentTableScroll">
        <el-table-column :label="t('records.list.columns.customer')" min-width="190"><template #default="{ row }"><div class="customer-cell"><span class="customer-avatar">{{ (row.data.customer || '—').slice(0, 1).toUpperCase() }}</span><span><strong>{{ row.data.customer || '—' }}</strong><small>{{ row.data.detail || '—' }}</small></span></div></template></el-table-column>
        <el-table-column :label="t('records.list.columns.date')" prop="data.service_date" width="120" />
        <el-table-column :label="t('records.list.columns.jobType')" min-width="150"><template #default="{ row }"><span class="job-type">{{ row.data.job_type || '—' }}</span></template></el-table-column>
        <el-table-column :label="t('ui.hours')" width="85"><template #default="{ row }">{{ minutesToHours(row.data.duration_minutes || 0) }}</template></el-table-column>
        <el-table-column :label="t('records.list.columns.status')" min-width="135"><template #default="{ row }"><span :class="['heph-pill', row.data.gross_cents == null ? 'warn' : 'success']"><i class="pill-dot"></i>{{ row.data.gross_cents == null ? t('records.list.wagePending') : row.data.wage_basis === 'rule_estimate' ? t('aimer.estimate') : t('records.list.wageConfirmed') }}</span></template></el-table-column>
        <el-table-column :label="t('records.list.columns.gross')" width="115" align="right"><template #default="{ row }"><span class="heph-money">{{ row.data.gross_cents == null ? '—' : formatNzd(row.data.gross_cents) }}</span></template></el-table-column>
        <el-table-column :label="t('records.list.columns.expense')" width="100" align="right"><template #default="{ row }"><span class="heph-money">{{ row.data.expense_cents == null ? '—' : formatNzd(row.data.expense_cents) }}</span></template></el-table-column>
        <el-table-column width="60" align="right"><template #default="{ row }"><el-button text :icon="ArrowRight" :aria-label="`${t('app.view')} ${row.data.customer || row.id}`" @click="router.push({ name: 'record-edit', params: { id: row.id } })" /></template></el-table-column>
      </el-table>
      <div class="infinite-sentinel" role="status" aria-live="polite">
        <template v-if="recentError"><ErrorBanner :message="recentError" /><el-button text @click="retryRecent">{{ t('app.retry') }}</el-button></template>
        <span v-else-if="recentLoading">{{ t('dashboard.loadingMore') }}</span>
        <el-button v-else-if="recentHasMore && recentLoaded" text @click="loadMoreRecent">{{ t('records.list.more') }}</el-button>
        <span v-else-if="recentLoaded && recent.length">{{ t('dashboard.allLoaded') }}</span>
      </div>
    </section>

    <footer class="dashboard-footer"><span>HEPHAESTUS <i> / </i> {{ t('ui.clarityInEveryNumber') }}</span><span>{{ t('ui.lastUpdated') }} {{ updatedLabel }}<span class="footer-dot"></span>{{ settings.currency }}</span></footer>
  </div>
</template>

<style scoped>
.dashboard-page { display: flex; flex-direction: column; gap: clamp(10px, 1.2vh, 14px); }
.page-header { margin-bottom: 1px; }.page-header h1 { display: flex; align-items: center; gap: 9px; }.heading-dot { width: 6px; height: 6px; margin-top: 4px; border-radius: 50%; background: #69b697; box-shadow: 0 0 0 0 color-mix(in srgb,#69b697 40%,transparent); animation: heading-pulse 2.8s ease-out infinite; }.header-actions { display: flex; align-items: center; gap: 8px; }.header-actions .el-button { font-size: 10px; height: 34px; min-height:34px; padding: 0 12px; }.all-time-total { display: grid; gap: 2px; min-width: 112px; padding: 5px 11px; border-right: 1px solid var(--heph-line); text-align: right; }.all-time-total span { color: var(--heph-muted); font-size: 9px; letter-spacing: .04em; }.all-time-total strong { color: var(--heph-pine); font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
@keyframes heading-pulse { 60%,100% { box-shadow: 0 0 0 7px transparent; } }
.dashboard-toolbar { display: flex; align-items: center; gap: 9px; min-width: 0; }.dashboard-toolbar :deep(.period-bar) { flex: 1; min-width: 0; padding: 0; border: 0; border-radius: 0; background: transparent; box-shadow: none; }.filter-toggle { display: flex; align-items: center; justify-content: center; gap: 7px; min-height: 36px; padding: 0 12px; background: var(--heph-paper-solid); border: 1px solid var(--heph-line); border-radius: 7px; font-size: 11px; cursor: pointer; white-space: nowrap; }.filter-toggle svg { width: 14px; }.filter-toggle.active { color: var(--heph-pine); border-color: var(--heph-pine); }.filter-count { padding: 1px 5px; background: var(--heph-mint); border-radius: 3px; }.refresh-button { width: 36px; padding: 0; }
.summary-grid { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); min-height: 112px; gap: clamp(10px, 1.2vw, 15px); }.dashboard-visuals { display: grid; grid-template-columns: minmax(0,1.9fr) minmax(260px,.9fr); min-height: 260px; gap: clamp(12px, 1.4vw, 18px); }.trend-panel { display: flex; flex-direction: column; padding: 14px 16px; }.insights-lazy { min-width: 0; min-height: 260px; }.insights-lazy :deep(.settlement-card) { height: 100%; }.calendar-lazy { position: relative; min-height: 180px; }.card-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 8px; }.card-header h2 { margin: 0; font-size: 14px; }.card-header p { margin: 5px 0 0; font-size: 10px; color: var(--heph-muted); line-height: 1.5; }.card-header .el-radio-group { flex-shrink: 0; }.trend-total { display: flex; align-items: baseline; gap: 7px; }.trend-total strong { font-size: 24px; font-weight: 600; letter-spacing: -.8px; }.trend-total > span { color: var(--heph-muted); font-size: 10px; }.trend-total .trend-scope { margin-left: auto; font-size: 10px; }
.estimate-strip { display: flex; align-items: center; gap: 20px; padding: 12px 17px; border: 1px solid var(--heph-line); border-radius: 10px; background: var(--heph-paper-solid); }.estimate-status { display: flex; align-items: center; gap: 10px; flex: 1; }.status-icon { display: grid; place-items: center; width: 29px; height: 29px; flex: none; border-radius: 50%; color: var(--heph-pine); background: var(--heph-mint); }.status-icon svg { width: 15px; }.status-icon.incomplete { color: var(--heph-warning); background: color-mix(in srgb,var(--heph-amber) 12%,transparent); }.estimate-status strong { font-size: 10px; font-weight: 550; }.estimate-status p { margin: 3px 0 0; font-size: 10px; color: var(--heph-muted); }.rate-settings-link { color:var(--heph-pine); font-size:12px; flex-shrink:0; }.rate-control label { display: flex; justify-content: space-between; font-size: 10px; color: var(--heph-muted); }.rate-control strong { color: var(--heph-pine); }.rate-control :deep(.el-slider) { height: 18px; margin-top: 3px; }.rate-note { max-width: 230px; padding-left: 17px; border-left: 1px solid var(--heph-line); color: var(--heph-muted); font-size: 10px; line-height: 1.6; }
.recent-panel { min-height: 180px; padding-bottom: 8px; }.section-error { display: flex; align-items: center; justify-content: space-between; gap: 10px; }.section-error :deep(.heph-error) { flex: 1; }.infinite-sentinel { display: flex; align-items: center; justify-content: center; gap: 8px; min-height: 38px; color: var(--heph-muted); font-size: 11px; }.infinite-sentinel :deep(.heph-error) { margin: 6px 0; }.link-arrow { margin-left: 8px; }.customer-cell { display: flex; align-items: center; gap: 10px; min-width: 0; }.customer-avatar { display: grid; place-items: center; flex: none; width: 26px; height: 26px; background: var(--heph-canvas-soft); color: var(--heph-pine); border-radius: 8px; font-size: 12px; }.customer-cell > span:last-child { min-width: 0; }.customer-cell strong { display: block; font-size: 11px; font-weight: 550; }.customer-cell small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; margin-top: 3px; font-size: 10px; color: var(--heph-muted); }.job-type { color: var(--heph-muted); font-size: 11px; }.pill-dot { width: 4px; height: 4px; border-radius: 50%; background: currentColor; }.dashboard-footer { display: flex; justify-content: space-between; gap: 12px; color: var(--heph-muted); font-size: 10px; }.dashboard-footer i { margin: 0 8px; font-style: normal; opacity: .4; }.footer-dot { display: inline-block; width: 3px; height: 3px; margin: 0 8px 2px; border-radius: 50%; background: var(--heph-muted); }
@media(min-width:1600px) { .dashboard-visuals { grid-template-columns: minmax(0,2fr) minmax(320px,1fr); } }
@media(max-width:1050px) { .summary-grid { grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; } }
@media(max-width:1200px) { .dashboard-toolbar { flex-wrap: wrap; }.dashboard-toolbar :deep(.period-bar) { flex-basis: calc(100% - 135px); }.estimate-strip { flex-wrap: wrap; }.rate-note { max-width: none; padding-left: 0; border-left: 0; } }
@media(max-width:1100px) and (min-width:901px) { .summary-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }.dashboard-visuals { grid-template-columns: 1fr; } }
@media(max-width:740px) { .summary-grid { grid-template-columns: repeat(2,minmax(0,1fr)); }.dashboard-visuals { grid-template-columns: 1fr; }.dashboard-toolbar :deep(.period-bar) { flex-basis: 100%; }.dashboard-toolbar { gap: 10px; }.filter-toggle { margin-left: auto; }.card-header { flex-wrap: wrap; }.trend-total .trend-scope { display: none; }.header-actions { width: 100%; flex-wrap: wrap; }.all-time-total { margin-right: auto; padding-left: 0; text-align: left; }.estimate-strip { gap: 10px; padding: 12px; }.estimate-status { min-width: 100%; }.rate-control { width: 100%; }.dashboard-footer { flex-direction: column; }.dashboard-page { gap: 12px; } }
</style>
