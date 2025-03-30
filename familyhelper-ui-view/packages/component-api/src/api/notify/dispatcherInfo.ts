// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

export type DispatcherInfo = {
  key: StringIdKey
  label: string
  type: string
  param: string
  remark: string
}

export type InsertDispatcherInfo = Omit<DispatcherInfo, 'key'> & { key: StringIdKey | null }

export type UpdateDispatcherInfo = DispatcherInfo

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('notify', `dispatcher-info/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<DispatcherInfo> {
  return http.generalClient().get('notify', `dispatcher-info/${key.string_id}/`, {}, 'json')
}

export function insert(dispatcherInfo: InsertDispatcherInfo): Pres<StringIdKey> {
  return http
    .generalClient()
    .post('notify', 'dispatcher-info/', dispatcherInfo, 'application/json;charset=UTF-8')
}

export function update(dispatcherInfo: UpdateDispatcherInfo): Pres<null> {
  return http
    .generalClient()
    .patch('notify', 'dispatcher-info/', dispatcherInfo, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('notify', `dispatcher-info/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<DispatcherInfo> {
  return http.generalClient().get(
    'notify',
    'dispatcher-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
