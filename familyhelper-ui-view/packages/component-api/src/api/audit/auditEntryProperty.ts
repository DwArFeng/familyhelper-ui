// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type AuditEntry } from './auditEntry'
import { type AuditPropertyIndicator, type AuditPropertyType } from './auditPropertyIndicator'

export type AuditEntryPropertyKey = {
  audit_entry_long_id: string
  property_string_id: string
}

export type AuditEntryProperty = {
  key: AuditEntryPropertyKey
  property_type: AuditPropertyType
  string_value: string
  long_value: string
  double_value: number
  boolean_value: boolean
  date_value: number
}

export type DispAuditEntryProperty = AuditEntryProperty & {
  audit_entry: AuditEntry
  audit_property_indicator: AuditPropertyIndicator | null
}

export function exists(key: AuditEntryPropertyKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'audit',
      `audit-entry-property/${key.audit_entry_long_id}%26${key.property_string_id}/exists/`,
      {},
      'json',
    )
}

export function get(key: AuditEntryPropertyKey): Pres<AuditEntryProperty> {
  return http
    .generalClient()
    .get(
      'audit',
      `audit-entry-property/${key.audit_entry_long_id}%26${key.property_string_id}/`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<AuditEntryProperty> {
  return http.generalClient().get(
    'audit',
    'audit-entry-property/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAuditEntry(
  auditEntryKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<AuditEntryProperty> {
  return http.generalClient().get(
    'audit',
    `audit-entry-property/child-for-audit-entry/${auditEntryKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: AuditEntryPropertyKey): Pres<DispAuditEntryProperty> {
  return http
    .generalClient()
    .get(
      'audit',
      `audit-entry-property/${key.audit_entry_long_id}%26${key.property_string_id}/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispAuditEntryProperty> {
  return http.generalClient().get(
    'audit',
    'audit-entry-property/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAuditEntryDisp(
  auditEntryKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispAuditEntryProperty> {
  return http.generalClient().get(
    'audit',
    `audit-entry-property/child-for-audit-entry/${auditEntryKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
