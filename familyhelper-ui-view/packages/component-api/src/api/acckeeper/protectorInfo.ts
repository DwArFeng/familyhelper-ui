// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type ProtectorInfo = {
  key: StringIdKey
  type: string
  param: string
  remark: string
}

export type InsertProtectorInfo = {
  key?: StringIdKey
  type: string
  param?: string
  remark?: string
}

export type UpdateProtectorInfo = {
  key: StringIdKey
  type: string
  param?: string
  remark?: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('acckeeper', `protector-info/${key.string_id}/exists/`, {}, 'json')
}

export function get(key: StringIdKey): Pres<ProtectorInfo> {
  return http.generalClient().get('acckeeper', `protector-info/${key.string_id}/`, {}, 'json')
}

export function insert(protectorInfo: InsertProtectorInfo): Pres<StringIdKey> {
  return http
    .generalClient()
    .post('acckeeper', 'protector-info/', protectorInfo, 'application/json;charset=UTF-8')
}

export function update(protectorInfo: UpdateProtectorInfo): Pres<null> {
  return http
    .generalClient()
    .patch('acckeeper', 'protector-info/', protectorInfo, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('acckeeper', `protector-info/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ProtectorInfo> {
  return http.generalClient().get(
    'acckeeper',
    'protector-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function typeEquals(type: string, pagingInfo: PagingInfo): Prespa<ProtectorInfo> {
  return http.generalClient().get(
    'acckeeper',
    'protector-info/type-equals/',
    {
      type,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function typeLike(pattern: string, pagingInfo: PagingInfo): Prespa<ProtectorInfo> {
  return http.generalClient().get(
    'acckeeper',
    'protector-info/type-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
