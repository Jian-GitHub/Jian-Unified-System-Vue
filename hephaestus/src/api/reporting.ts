// Reporting endpoints — summary / calendar / series / CSV export.

import axios from '@/api/axiosInstance'
import { normalizeList } from './collections'
import type { PeriodList, QueryParams, Summary } from '@/types/income'
import { downloadBlob } from '@/utils/format'

function buildQuery(params: QueryParams = {}): Record<string, string | number> {
  const out: Record<string, string | number> = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    out[k] = v as string | number
  }
  return out
}

export async function fetchSummary(params: QueryParams = {}): Promise<Summary> {
  const { data } = await axios.get<Summary>('/v1/income-summary', { params: buildQuery(params) })
  return data
}

export async function fetchCalendar(params: QueryParams = {}): Promise<PeriodList> {
  const { data } = await axios.get<PeriodList>('/v1/income-calendar', { params: buildQuery(params) })
  return normalizeList(data)
}

export async function fetchSeries(groupBy: 'day' | 'week' | 'month', params: QueryParams = {}): Promise<PeriodList> {
  const { data } = await axios.get<PeriodList>('/v1/income-series', {
    params: buildQuery({ ...params, group_by: groupBy }),
  })
  return normalizeList(data)
}

export interface ExportResponse {
  content: string
}

export async function exportCsv(params: QueryParams = {}): Promise<string> {
  const { data } = await axios.get<ExportResponse | string>('/v1/income-export.csv', {
    params: buildQuery(params),
    responseType: 'text',
  })
  if (typeof data === 'string') return data
  return data.content
}

export async function downloadExportCsv(filename: string, params: QueryParams = {}) {
  const text = await exportCsv(params)
  downloadBlob(text, filename, 'text/csv;charset=utf-8')
}
