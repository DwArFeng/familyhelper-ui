// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type AuditCategory = {
  key: StringIdKey
  enabled: boolean
  name: string
  remark: string
}

export type InsertAuditCategory = AuditCategory

export type UpdateAuditCategory = AuditCategory

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('audit', `audit-category/${key.string_id}/exists/`, {}, 'json')
}

export function get(key: StringIdKey): Pres<AuditCategory> {
  return http.generalClient().get('audit', `audit-category/${key.string_id}/`, {}, 'json')
}

export function insert(auditCategory: InsertAuditCategory): Pres<StringIdKey> {
  return http
    .generalClient()
    .post('audit', 'audit-category/', auditCategory, 'application/json;charset=UTF-8')
}

export function update(auditCategory: UpdateAuditCategory): Pres<null> {
  return http
    .generalClient()
    .patch('audit', 'audit-category/', auditCategory, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('audit', `audit-category/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<AuditCategory> {
  return http.generalClient().get(
    'audit',
    'audit-category/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<AuditCategory> {
  return http.generalClient().get(
    'audit',
    'audit-category/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nameLike(pattern: string, pagingInfo: PagingInfo): Prespa<AuditCategory> {
  return http.generalClient().get(
    'audit',
    'audit-category/name-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
