// Income domain types. Mirrors the Hephaestus income.api contract; cents and
// IDs are decimal strings to avoid JS integer precision loss.

export interface RecordData {
  wage_basis?: 'company' | 'rule_estimate' | ''
  participants?: string[]
  payment_status?: string
  service_date: string
  customer: string
  job_type: string
  detail: string
  note: string
  pricing_category: string
  duration_minutes: number
  team_size: number
  gross_cents: string | null
  expense_cents: string | null
}

export interface Change {
  field: string
  value: string
  clear?: boolean
}

export interface Record {
  id: string
  version: string
  data: RecordData
  base: RecordData
  overrides: Change[]
  source_id: string
  source_key: string
  archived: boolean
  wage_status: string
}

export interface RecordList {
  items: Record[]
  next_cursor: string
}

export interface CreateRecordRequest {
  data: RecordData
}

export interface UpdateRecordRequest {
  changes: Change[]
  reason: string
}

export interface ClearOverrideRequest {
  field: string
  reason: string
}

export interface QueryParams {
  from?: string
  to?: string
  type?: string
  team?: 'all' | 'solo' | 'team'
  search?: string
  sort?: 'date-desc' | 'date-asc' | 'gross-desc' | 'cash-desc'
  archived?: 'active' | 'all' | 'archived'
  cursor?: string
  group_by?: 'day' | 'week' | 'month'
  limit?: number
  rate_bps?: number
}

export interface Summary {
  gross_cents: string
  tax_estimate_cents: string
  net_estimate_cents: string
  known_expense_cents: string
  known_cash_estimate_cents: string
  record_count: number
  pending_wage_count: number
  unknown_expense_count: number
  duration_minutes: number
  confirmed_duration_minutes: number
  is_complete: boolean
  calculation_version: string
}

export interface Period {
  start: string
  end: string
  summary: Summary
}

export interface PeriodList {
  items: Period[]
}

export interface Revision {
  version: string
  action: string
  reason: string
  before?: Record | null
  after: Record
  created_at: string
}

export interface RevisionList {
  items: Revision[]
}

// Sources & imports ------------------------------------------------------------

export interface Source {
  id: string
  label: string
  kind: 'manual_file' | 'google_sheet' | string
}

export interface SourceList {
  items: Source[]
}

export interface CreateSourceRequest {
  label: string
}

export interface ColumnMapping {
  field: string
  column: number
}

export interface RowDecision {
  row: number
  action: 'new' | 'update' | 'unchanged' | 'exclude'
  record_id?: string
  expected_version?: string
  keep_overrides?: boolean
}

export interface MappingRequest {
  rule_profile?: '' | 'aimerhq-v1'
  wage_column_confirmed?: boolean
  sheet: string
  header_row: number
  date_format: 'iso' | 'dmy' | 'mdy' | 'excel'
  duration_format: 'minutes' | 'hours' | 'hh:mm'
  empty_expense_zero: boolean
  default_team_size: number
  columns: ColumnMapping[]
  decisions?: RowDecision[]
}

export interface ImportRow {
  row: number
  data: RecordData
  source_key: string
  fingerprint: string
  action: string
  record_id?: string
  expected_version?: string
  keep_overrides?: boolean
  errors: string[]
}

export interface Batch {
  deleted?: boolean
  filename?: string
  spreadsheet?: string
  range?: string
  mapping?: MappingRequest | null
  id: string
  source_id: string
  status: string
  version: string
  selection_hash: string
  row_count: number
  error_count: number
  inserted: number
  updated: number
  unchanged: number
  excluded: number
  sheets: string[]
  created_at: string
}

export interface BatchList {
  items: Batch[]
}

export interface BatchRows {
  items: ImportRow[]
  next_cursor: string
}

export interface BatchRowsParams {
  cursor?: string
  limit?: number
}

export interface CommitRequest {
  selection_hash: string
}
