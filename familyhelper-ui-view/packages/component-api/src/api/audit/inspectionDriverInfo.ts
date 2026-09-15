// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Inspection } from './inspection'

export type InspectionDriverInfo = {
  key: LongIdKey
  inspection_key: LongIdKey
  enabled: boolean
  type: string
  param: string
  remark: string
}

export type InsertInspectionDriverInfo = Omit<InspectionDriverInfo, 'key'> & {
  key: LongIdKey | null
}

export type UpdateInspectionDriverInfo = InspectionDriverInfo

export type DispInspectionDriverInfo = InspectionDriverInfo & {
  inspection: Inspection
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('audit', `inspection-driver-info/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<InspectionDriverInfo> {
  return http.generalClient().get('audit', `inspection-driver-info/${key.long_id}/`, {}, 'json')
}

export function insert(inspectionDriverInfo: InsertInspectionDriverInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'audit',
      'inspection-driver-info/',
      inspectionDriverInfo,
      'application/json;charset=UTF-8',
    )
}

export function update(inspectionDriverInfo: UpdateInspectionDriverInfo): Pres<null> {
  return http
    .generalClient()
    .patch(
      'audit',
      'inspection-driver-info/',
      inspectionDriverInfo,
      'application/json;charset=UTF-8',
    )
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('audit', `inspection-driver-info/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<InspectionDriverInfo> {
  return http.generalClient().get(
    'audit',
    'inspection-driver-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispInspectionDriverInfo> {
  return http
    .generalClient()
    .get('audit', `inspection-driver-info/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispInspectionDriverInfo> {
  return http.generalClient().get(
    'audit',
    'inspection-driver-info/all/disp/',
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
): Prespa<InspectionDriverInfo> {
  return http.generalClient().get(
    'audit',
    `inspection-driver-info/child-for-inspection/${inspectionKey.long_id}/`,
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
): Prespa<DispInspectionDriverInfo> {
  return http.generalClient().get(
    'audit',
    `inspection-driver-info/child-for-inspection/${inspectionKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
