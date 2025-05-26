// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type Permission = {
  key: StringIdKey
  group_key: StringIdKey | null
  name: string
  remark: string
  level: number
}

export type InsertPermission = Permission

export type UpdatePermission = Permission

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('system', `permission/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<Permission> {
  return http.generalClient().get('system', `permission/${key.string_id}/`, {}, 'json')
}

export function insert(permission: InsertPermission): Pres<StringIdKey> {
  return http
    .generalClient()
    .post('system', 'permission/', permission, 'application/json;charset=UTF-8')
}

export function update(permission: UpdatePermission): Pres<null> {
  return http
    .generalClient()
    .patch('system', 'permission/', permission, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('system', `permission/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Permission> {
  return http.generalClient().get(
    'system',
    'permission/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<Permission> {
  return http.generalClient().get(
    'system',
    'permission/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForGroup(
  groupKey: StringIdKey | null,
  pagingInfo: PagingInfo,
): Prespa<Permission> {
  return http.generalClient().get(
    'system',
    `permission-group/${groupKey?.string_id ?? ''}/permission`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function lookupForUser(userKey: StringIdKey): Pres<Permission[]> {
  return http
    .generalClient()
    .post('system', 'permission/lookup-for-user', userKey, 'application/json;charset=UTF-8')
}
