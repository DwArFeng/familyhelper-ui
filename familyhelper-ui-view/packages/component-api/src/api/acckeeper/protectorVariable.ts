// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type ProtectorInfo } from './protectorInfo'

/**
 * 对应 acckeeper 的 ProtectorVariableKey。
 */
export type ProtectorVariableKey = {
  protector_info_id: string
  variable_id: string
}

export type ProtectorVariable = {
  key: ProtectorVariableKey
  value: string
  remark: string
}

export type DispProtectorVariable = ProtectorVariable & {
  protector_info: ProtectorInfo
}

export type InsertProtectorVariable = {
  key: ProtectorVariableKey
  value: string
  remark?: string
}

export type UpdateProtectorVariable = {
  key: ProtectorVariableKey
  value: string
  remark?: string
}

export function exists(key: ProtectorVariableKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'acckeeper',
      `protector-variable/${key.protector_info_id}&${key.variable_id}/exists/`,
      {},
      'json',
    )
}

export function get(key: ProtectorVariableKey): Pres<ProtectorVariable> {
  return http
    .generalClient()
    .get('acckeeper', `protector-variable/${key.protector_info_id}&${key.variable_id}/`, {}, 'json')
}

export function insert(protectorVariable: InsertProtectorVariable): Pres<ProtectorVariableKey> {
  return http
    .generalClient()
    .post('acckeeper', 'protector-variable/', protectorVariable, 'application/json;charset=UTF-8')
}

export function update(protectorVariable: UpdateProtectorVariable): Pres<null> {
  return http
    .generalClient()
    .patch('acckeeper', 'protector-variable/', protectorVariable, 'application/json;charset=UTF-8')
}

export function remove(key: ProtectorVariableKey): Pres<null> {
  return http
    .generalClient()
    .del('acckeeper', `protector-variable/${key.protector_info_id}&${key.variable_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ProtectorVariable> {
  return http.generalClient().get(
    'acckeeper',
    'protector-variable/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForProtectorInfo(
  protectorInfoKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<ProtectorVariable> {
  return http.generalClient().get(
    'acckeeper',
    `protector-info/${protectorInfoKey.string_id}/protector-variable/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: ProtectorVariableKey): Pres<DispProtectorVariable> {
  return http
    .generalClient()
    .get(
      'acckeeper',
      `protector-variable/${key.protector_info_id}&${key.variable_id}/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispProtectorVariable> {
  return http.generalClient().get(
    'acckeeper',
    'protector-variable/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForProtectorInfoDisp(
  protectorInfoKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispProtectorVariable> {
  return http.generalClient().get(
    'acckeeper',
    `protector-info/${protectorInfoKey.string_id}/protector-variable/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
