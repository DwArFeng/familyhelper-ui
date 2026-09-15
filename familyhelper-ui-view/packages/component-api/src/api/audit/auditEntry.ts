// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type AuditCategory } from './auditCategory'

export type AuditEntry = {
  key: LongIdKey
  category_key: StringIdKey | null
  created_date: number
}

export type DispAuditEntry = AuditEntry & {
  audit_category: AuditCategory | null
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('audit', `audit-entry/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<AuditEntry> {
  return http.generalClient().get('audit', `audit-entry/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<AuditEntry> {
  return http.generalClient().get(
    'audit',
    'audit-entry/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function createdDateDesc(pagingInfo: PagingInfo): Prespa<AuditEntry> {
  return http.generalClient().get(
    'audit',
    'audit-entry/created-date-desc/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAuditCategory(
  auditCategoryKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<AuditEntry> {
  return http.generalClient().get(
    'audit',
    `audit-entry/child-for-audit-category/${auditCategoryKey.string_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispAuditEntry> {
  return http.generalClient().get('audit', `audit-entry/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispAuditEntry> {
  return http.generalClient().get(
    'audit',
    'audit-entry/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function createdDateDescDisp(pagingInfo: PagingInfo): Prespa<DispAuditEntry> {
  return http.generalClient().get(
    'audit',
    'audit-entry/created-date-desc/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAuditCategoryDisp(
  auditCategoryKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispAuditEntry> {
  return http.generalClient().get(
    'audit',
    `audit-entry/child-for-audit-category/${auditCategoryKey.string_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
