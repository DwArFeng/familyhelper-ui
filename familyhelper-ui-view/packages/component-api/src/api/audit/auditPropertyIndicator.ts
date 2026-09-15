// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type AuditCategory } from './auditCategory'

export type AuditPropertyTypeString = 0
export type AuditPropertyTypeLong = 1
export type AuditPropertyTypeDouble = 2
export type AuditPropertyTypeBoolean = 3
export type AuditPropertyTypeDate = 4

export type AuditPropertyType =
  | AuditPropertyTypeString
  | AuditPropertyTypeLong
  | AuditPropertyTypeDouble
  | AuditPropertyTypeBoolean
  | AuditPropertyTypeDate

export type AuditPropertyIndicatorKey = {
  audit_category_string_id: string
  property_string_id: string
}

export type AuditPropertyIndicator = {
  key: AuditPropertyIndicatorKey
  label: string
  property_type: AuditPropertyType
  default_string_value: string
  default_long_value: string
  default_double_value: number
  default_boolean_value: boolean
  default_date_value: number
  order: number
}

export type InsertAuditPropertyIndicator = AuditPropertyIndicator

export type UpdateAuditPropertyIndicator = AuditPropertyIndicator

export type DispAuditPropertyIndicator = AuditPropertyIndicator & {
  audit_category: AuditCategory
}

export function exists(key: AuditPropertyIndicatorKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'audit',
      `audit-property-indicator/${key.audit_category_string_id}%26${key.property_string_id}/exists/`,
      {},
      'json',
    )
}

export function get(key: AuditPropertyIndicatorKey): Pres<AuditPropertyIndicator> {
  return http
    .generalClient()
    .get(
      'audit',
      `audit-property-indicator/${key.audit_category_string_id}%26${key.property_string_id}/`,
      {},
      'json',
    )
}

export function insert(
  auditPropertyIndicator: InsertAuditPropertyIndicator,
): Pres<AuditPropertyIndicatorKey> {
  return http
    .generalClient()
    .post(
      'audit',
      'audit-property-indicator/',
      auditPropertyIndicator,
      'application/json;charset=UTF-8',
    )
}

export function update(auditPropertyIndicator: UpdateAuditPropertyIndicator): Pres<null> {
  return http
    .generalClient()
    .patch(
      'audit',
      'audit-property-indicator/',
      auditPropertyIndicator,
      'application/json;charset=UTF-8',
    )
}

export function remove(key: AuditPropertyIndicatorKey): Pres<null> {
  return http
    .generalClient()
    .del(
      'audit',
      `audit-property-indicator/${key.audit_category_string_id}%26${key.property_string_id}/`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<AuditPropertyIndicator> {
  return http.generalClient().get(
    'audit',
    'audit-property-indicator/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: AuditPropertyIndicatorKey): Pres<DispAuditPropertyIndicator> {
  return http
    .generalClient()
    .get(
      'audit',
      `audit-property-indicator/${key.audit_category_string_id}%26${key.property_string_id}/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispAuditPropertyIndicator> {
  return http.generalClient().get(
    'audit',
    'audit-property-indicator/all/disp/',
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
): Prespa<AuditPropertyIndicator> {
  return http.generalClient().get(
    'audit',
    `audit-property-indicator/child-for-audit-category/${auditCategoryKey.string_id}/`,
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
): Prespa<DispAuditPropertyIndicator> {
  return http.generalClient().get(
    'audit',
    `audit-property-indicator/child-for-audit-category/${auditCategoryKey.string_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
