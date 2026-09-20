// Imports & sources — file upload, mapping, preview, commit and Google Sheets
// placeholders. The backend handles CSV/XLSX parsing; the frontend only stages
// the raw file and walks the user through mapping → preview → commit.

import axios, { attachIfMatch } from '@/api/axiosInstance'
import { normalizeList } from './collections'
import { useSessionStore } from '@/store/session'
import type {
  Batch,
  BatchList,
  BatchRows,
  BatchRowsParams,
  CommitRequest,
  CreateSourceRequest,
  MappingRequest,
  Source,
  SourceList,
} from '@/types/income'

export type GoogleConnection = { url: string; bound: boolean; connected: boolean }
export async function googleStatus(): Promise<GoogleConnection> { return (await axios.get('/v1/google/status')).data }
export async function googleConnect(): Promise<GoogleConnection> { return (await axios.post('/v1/google/connect', {})).data }
export async function googleDisconnect(): Promise<GoogleConnection> { return (await axios.post('/v1/google/disconnect', {})).data }
export async function stageGoogle(source_id: string, spreadsheet: string, range: string): Promise<Batch> {
  return (await axios.post('/v1/google/imports', { source_id, spreadsheet, range })).data
}

function etagFor(url: string): string | undefined {
  return useSessionStore().etagFor(url)
}

export async function listSources(): Promise<SourceList> {
  const { data } = await axios.get<SourceList>('/v1/sources')
  return normalizeList(data)
}

export async function deleteSource(id: string): Promise<void> {
  await axios.delete(`/v1/sources/${id}`)
}

export async function createSource(req: CreateSourceRequest): Promise<Source> {
  const { data } = await axios.post<Source>('/v1/sources', req)
  return data
}

export async function listBatches(): Promise<BatchList> {
  const { data } = await axios.get<BatchList>('/v1/imports')
  return normalizeList(data)
}

export async function getBatch(id: string): Promise<Batch> {
  const { data } = await axios.get<Batch>(`/v1/imports/${id}`)
  return data
}

export async function stageImport(sourceId: string, file: File): Promise<Batch> {
  const form = new FormData()
  form.append('source_id', sourceId)
  form.append('file', file, file.name)
  const { data } = await axios.post<Batch>('/v1/imports', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function saveMapping(id: string, mapping: MappingRequest, etag?: string): Promise<Batch> {
  const config = attachIfMatch({ headers: {} }, etag ?? etagFor(`/v1/imports/${id}`))
  const { data } = await axios.put<Batch>(`/v1/imports/${id}/mapping`, mapping, config)
  return data
}

export async function listImportRows(id: string, params: BatchRowsParams = {}): Promise<BatchRows> {
  const { data } = await axios.get<BatchRows>(`/v1/imports/${id}/rows`, {
    params: {
      cursor: params.cursor,
      limit: params.limit,
    },
  })
  return normalizeList(data)
}

export async function commitImport(id: string, req: CommitRequest, etag?: string): Promise<Batch> {
  const config = attachIfMatch({ headers: {} }, etag ?? etagFor(`/v1/imports/${id}`))
  const { data } = await axios.post<Batch>(`/v1/imports/${id}/commit`, req, config)
  return data
}

export async function cancelImport(id: string, etag?: string): Promise<Batch> {
  const config = attachIfMatch({ headers: {} }, etag ?? etagFor(`/v1/imports/${id}`))
  const { data } = await axios.post<Batch>(`/v1/imports/${id}/cancel`, {}, config)
  return data
}

export async function trashBatch(id: string, deleted: boolean, etag?: string): Promise<Batch> {
  const { data } = await axios.post<Batch>(`/v1/imports/${id}/trash`, { deleted }, attachIfMatch({ headers: {} }, etag))
  return data
}

export interface SheetData { sheet: string; items: { row: number; cells: string[] }[]; next_cursor: string; total: number }
export async function readSheet(id: string, sheet = '', cursor = ''): Promise<SheetData> {
  const { data } = await axios.get<SheetData>(`/v1/imports/${id}/sheet`, { params: { sheet, cursor } })
  return normalizeList(data)
}
