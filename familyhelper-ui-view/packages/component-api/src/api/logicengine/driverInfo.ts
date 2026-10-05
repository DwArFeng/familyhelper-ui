// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Section } from './section'

export type DriverInfo = {
  key: LongIdKey
  section_key: LongIdKey
  enabled: boolean
  type: string
  param: string
  remark: string
}

export type InsertDriverInfo = Omit<DriverInfo, 'key'> & { key: LongIdKey | null }

export type UpdateDriverInfo = DriverInfo

export type DispDriverInfo = DriverInfo & {
  section: Section
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('logicengine', `driver-info/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<DriverInfo> {
  return http.generalClient().get('logicengine', `driver-info/${key.long_id}/`, {}, 'json')
}

export function insert(driverInfo: InsertDriverInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('logicengine', 'driver-info/', driverInfo, 'application/json;charset=UTF-8')
}

export function update(driverInfo: UpdateDriverInfo): Pres<null> {
  return http
    .generalClient()
    .patch('logicengine', 'driver-info/', driverInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('logicengine', `driver-info/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<DriverInfo> {
  return http.generalClient().get(
    'logicengine',
    'driver-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSectionDisp(
  sectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispDriverInfo> {
  return http.generalClient().get(
    'logicengine',
    `driver-info/child-for-section/${sectionKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSectionEnabledDisp(
  sectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispDriverInfo> {
  return http.generalClient().get(
    'logicengine',
    `driver-info/child-for-section-enabled/${sectionKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispDriverInfo> {
  return http.generalClient().get('logicengine', `driver-info/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispDriverInfo> {
  return http.generalClient().get(
    'logicengine',
    'driver-info/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSection(sectionKey: LongIdKey, pagingInfo: PagingInfo): Prespa<DriverInfo> {
  return http.generalClient().get(
    'logicengine',
    `driver-info/child-for-section/${sectionKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSectionEnabled(
  sectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DriverInfo> {
  return http.generalClient().get(
    'logicengine',
    `driver-info/child-for-section-enabled/${sectionKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
