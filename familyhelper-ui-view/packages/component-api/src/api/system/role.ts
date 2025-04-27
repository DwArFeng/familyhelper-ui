// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type Role = {
  key: StringIdKey
  name: string
  enabled: boolean
  remark: string
}

export type InsertRole = Role

export type UpdateRole = Role

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('system', `role/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<Role> {
  return http.generalClient().get('system', `role/${key.string_id}/`, {}, 'json')
}

export function insert(role: InsertRole): Pres<StringIdKey> {
  return http.generalClient().post('system', 'role/', role, 'application/json;charset=UTF-8')
}

export function update(role: UpdateRole): Pres<null> {
  return http.generalClient().patch('system', 'role/', role, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('system', `role/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Role> {
  return http.generalClient().get(
    'system',
    'role/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccount(accountKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Role> {
  return http.generalClient().get(
    'system',
    `account/${accountKey.string_id}/role/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
