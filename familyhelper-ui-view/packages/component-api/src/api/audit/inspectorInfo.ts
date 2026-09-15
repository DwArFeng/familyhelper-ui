// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Inspection } from './inspection'

export type InspectorInfo = {
  key: LongIdKey
  inspection_key: LongIdKey
  index: number
  enabled: boolean
  type: string
  param: string
  remark: string
}

export type InsertInspectorInfo = Omit<InspectorInfo, 'key'> & { key: LongIdKey | null }

export type UpdateInspectorInfo = InspectorInfo

export type DispInspectorInfo = InspectorInfo & {
  inspection: Inspection
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('audit', `inspector-info/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<InspectorInfo> {
  return http.generalClient().get('audit', `inspector-info/${key.long_id}/`, {}, 'json')
}

export function insert(inspectorInfo: InsertInspectorInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('audit', 'inspector-info/', inspectorInfo, 'application/json;charset=UTF-8')
}

export function update(inspectorInfo: UpdateInspectorInfo): Pres<null> {
  return http
    .generalClient()
    .patch('audit', 'inspector-info/', inspectorInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('audit', `inspector-info/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<InspectorInfo> {
  return http.generalClient().get(
    'audit',
    'inspector-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispInspectorInfo> {
  return http.generalClient().get('audit', `inspector-info/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispInspectorInfo> {
  return http.generalClient().get(
    'audit',
    'inspector-info/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspection(
  inspectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<InspectorInfo> {
  return http.generalClient().get(
    'audit',
    `inspector-info/child-for-inspection/${inspectionKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspectionDisp(
  inspectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispInspectorInfo> {
  return http.generalClient().get(
    'audit',
    `inspector-info/child-for-inspection/${inspectionKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
