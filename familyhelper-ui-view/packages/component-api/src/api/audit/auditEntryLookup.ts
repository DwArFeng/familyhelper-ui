// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type Pres } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type AuditCategory } from './auditCategory'
import { type AuditEntry } from './auditEntry'
import { type AuditEntryProperty } from './auditEntryProperty'
import { type AuditPropertyType } from './auditPropertyIndicator'

export type LogicOperatorAnd = 0
export type LogicOperatorOr = 1

export type LogicOperator = LogicOperatorAnd | LogicOperatorOr

export type AuditEntryLookupCompositeItem = {
  property_id: string
  property_type: AuditPropertyType
  first_condition: string | null
  second_condition: string | null
  enabled: boolean
}

export type AuditEntryCompositeLookupInfo = {
  paging_info: PagingInfo
  category_key: StringIdKey | null
  audit_entry_key: LongIdKey | null
  start_created_date: number | null
  end_created_date: number | null
  composite_items: AuditEntryLookupCompositeItem[]
}

export type AuditEntryLookupItem = {
  category_key: StringIdKey | null
  audit_entry_key: LongIdKey | null
  start_created_date: number | null
  end_created_date: number | null
  composite_items: AuditEntryLookupCompositeItem[]
  enabled: boolean
}

export type AuditEntryLookupQueryGroup = {
  logic_operator: LogicOperator
  lookup_items: AuditEntryLookupItem[]
  query_groups: AuditEntryLookupQueryGroup[]
  enabled: boolean
}

export type AuditEntryGroupedLookupInfo = {
  paging_info: PagingInfo
  logic_operator: LogicOperator
  lookup_items: AuditEntryLookupItem[]
  query_groups: AuditEntryLookupQueryGroup[]
}

export type AuditEntryLookupResultData = {
  audit_entry: AuditEntry
  audit_category: AuditCategory | null
  audit_entry_property_map: Record<string, AuditEntryProperty>
}

export type AuditEntryLookupResult = {
  current_page: number
  total_pages: number
  rows: number
  count: string
  data: AuditEntryLookupResultData[]
}

export function composite(info: AuditEntryCompositeLookupInfo): Pres<AuditEntryLookupResult> {
  return http
    .generalClient()
    .post('audit', 'audit-entry-lookup/composite/', info, 'application/json;charset=UTF-8')
}

export function grouped(info: AuditEntryGroupedLookupInfo): Pres<AuditEntryLookupResult> {
  return http
    .generalClient()
    .post('audit', 'audit-entry-lookup/grouped/', info, 'application/json;charset=UTF-8')
}
