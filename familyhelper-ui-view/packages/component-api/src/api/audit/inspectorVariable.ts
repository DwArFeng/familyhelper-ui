// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type InspectorInfo } from './inspectorInfo'

export type InspectorVariableValueTypeString = 0
export type InspectorVariableValueTypeLong = 1
export type InspectorVariableValueTypeDouble = 2
export type InspectorVariableValueTypeBoolean = 3
export type InspectorVariableValueTypeDate = 4

export type InspectorVariableValueType =
  | InspectorVariableValueTypeString
  | InspectorVariableValueTypeLong
  | InspectorVariableValueTypeDouble
  | InspectorVariableValueTypeBoolean
  | InspectorVariableValueTypeDate

export type InspectorVariableKey = {
  inspector_info_long_id: string
  variable_string_id: string
}

export type InspectorVariable = {
  key: InspectorVariableKey
  value_type: InspectorVariableValueType
  string_value: string
  long_value: string
  double_value: number
  boolean_value: boolean
  date_value: number
}

export type DispInspectorVariable = InspectorVariable & {
  inspector_info: InspectorInfo
}

export type InspectorVariableUpsertInfo = {
  inspector_info_key: LongIdKey
  inspector_variable_id: string
  value_type: InspectorVariableValueType
  value_string: string
}

export type InspectorVariableRemoveInfo = {
  inspector_info_key: LongIdKey
  inspector_variable_id: string
}

export function exists(key: InspectorVariableKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'audit',
      `inspector-variable/${key.inspector_info_long_id}%26${key.variable_string_id}/exists/`,
      {},
      'json',
    )
}

export function get(key: InspectorVariableKey): Pres<InspectorVariable> {
  return http
    .generalClient()
    .get(
      'audit',
      `inspector-variable/${key.inspector_info_long_id}%26${key.variable_string_id}/`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<InspectorVariable> {
  return http.generalClient().get(
    'audit',
    'inspector-variable/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspectorInfo(
  inspectorInfoKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<InspectorVariable> {
  return http.generalClient().get(
    'audit',
    `inspector-variable/child-for-inspector-info/${inspectorInfoKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: InspectorVariableKey): Pres<DispInspectorVariable> {
  return http
    .generalClient()
    .get(
      'audit',
      `inspector-variable/${key.inspector_info_long_id}%26${key.variable_string_id}/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispInspectorVariable> {
  return http.generalClient().get(
    'audit',
    'inspector-variable/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspectorInfoDisp(
  inspectorInfoKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispInspectorVariable> {
  return http.generalClient().get(
    'audit',
    `inspector-variable/child-for-inspector-info/${inspectorInfoKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function upsert(info: InspectorVariableUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post('audit', 'inspector-variable/upsert/', info, 'application/json;charset=UTF-8')
}

export function remove(info: InspectorVariableRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('audit', 'inspector-variable/remove/', info, 'application/json;charset=UTF-8')
}
