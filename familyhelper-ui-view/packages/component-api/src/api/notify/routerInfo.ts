// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

export type RouterInfo = {
  key: LongIdKey
  label: string
  type: string
  param: string
  remark: string
}

export type InsertRouterInfo = Omit<RouterInfo, 'key'> & { key: LongIdKey | null }

export type UpdateRouterInfo = RouterInfo

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('notify', `router-info/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<RouterInfo> {
  return http.generalClient().get('notify', `router-info/${key.long_id}/`, {}, 'json')
}

export function insert(routerInfo: InsertRouterInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('notify', 'router-info/', routerInfo, 'application/json;charset=UTF-8')
}

export function update(routerInfo: UpdateRouterInfo): Pres<null> {
  return http
    .generalClient()
    .patch('notify', 'router-info/', routerInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('notify', `router-info/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<RouterInfo> {
  return http.generalClient().get(
    'notify',
    'router-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
