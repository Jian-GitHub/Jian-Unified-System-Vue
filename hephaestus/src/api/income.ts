// Income record CRUD. Wraps /work-records endpoints. State-changing endpoints
// (create / update / archive / restore / clear-override) accept an If-Match
// header so the backend's optimistic concurrency check works.

import axios, { attachIfMatch } from '@/api/axiosInstance'
import { normalizeList } from './collections'
import { useSessionStore } from '@/store/session'
import type {
  ClearOverrideRequest,
  CreateRecordRequest,
  QueryParams,
  Record,
  RecordData,
  RecordList,
  RevisionList,
  UpdateRecordRequest,
} from '@/types/income'

function etagFor(url: string): string | undefined {
  return useSessionStore().etagFor(url)
}

function buildQuery(params: QueryParams = {}): { [key: string]: string | number } {
  const out: { [key: string]: string | number } = {}
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue
    out[k] = v as string | number
  }
  return out
}

export async function createRecord(req: CreateRecordRequest): Promise<Record> {
  const { data } = await axios.post<Record>('/v1/work-records', req)
  return data
}

export async function listRecords(params: QueryParams = {}): Promise<RecordList> {
  const { data } = await axios.get<RecordList>('/v1/work-records', { params: buildQuery(params) })
  return normalizeList(data)
}

export async function getRecord(id: string): Promise<Record> {
  const { data } = await axios.get<Record>(`/v1/work-records/${id}`)
  return data
}

export async function updateRecord(
  id: string,
  req: UpdateRecordRequest,
  etag?: string,
): Promise<Record> {
  const config = attachIfMatch({ headers: {} }, etag ?? etagFor(`/v1/work-records/${id}`))
  const { data } = await axios.patch<Record>(`/v1/work-records/${id}`, req, config)
  return data
}

export async function archiveRecord(id: string, etag?: string): Promise<Record> {
  const config = attachIfMatch({ headers: {} }, etag ?? etagFor(`/v1/work-records/${id}`))
  const { data } = await axios.post<Record>(`/v1/work-records/${id}/archive`, {}, config)
  return data
}

export async function restoreRecord(id: string, etag?: string): Promise<Record> {
  const config = attachIfMatch({ headers: {} }, etag ?? etagFor(`/v1/work-records/${id}`))
  const { data } = await axios.post<Record>(`/v1/work-records/${id}/restore`, {}, config)
  return data
}

export async function clearOverride(
  id: string,
  req: ClearOverrideRequest,
  etag?: string,
): Promise<Record> {
  const config = attachIfMatch({ headers: {} }, etag ?? etagFor(`/v1/work-records/${id}`))
  const { data } = await axios.delete<Record>(`/v1/work-records/${id}/overrides/${req.field}`, {
    ...config,
    data: { reason: req.reason },
  })
  return data
}

export async function listRevisions(id: string): Promise<RevisionList> {
  const { data } = await axios.get<RevisionList>(`/v1/work-records/${id}/revisions`)
  return normalizeList(data)
}

// Convenience: turn user-facing form fields into the backend RecordData shape.
export function emptyRecordData(): RecordData {
  return {
    service_date: '',
    customer: '',
    job_type: '',
    detail: '',
    note: '',
    pricing_category: '',
    duration_minutes: 0,
    team_size: 1,
    gross_cents: null,
    expense_cents: null,
  }
}
