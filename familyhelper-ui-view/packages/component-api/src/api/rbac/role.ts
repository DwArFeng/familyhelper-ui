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

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('rbac', `role/${key.string_id}/exists`, {}, 'json')
}

export function get(key: StringIdKey): Pres<Role> {
  return http.generalClient().get('rbac', `role/${key.string_id}`, {}, 'json')
}

export function insert(role: Role): Pres<StringIdKey> {
  return http.generalClient().post('rbac', 'role', role, 'application/json;charset=UTF-8')
}

export function update(role: Role): Pres<null> {
  return http.generalClient().patch('rbac', 'role', role, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('rbac', `role/${key.string_id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Role> {
  return http.generalClient().get(
    'rbac',
    'role/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForUserAvailable(userKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Role> {
  return http.generalClient().get(
    'rbac',
    `user/${userKey.string_id}/role/available`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function enabled(pagingInfo: PagingInfo): Prespa<Role> {
  return http.generalClient().get(
    'rbac',
    'role/enabled',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<Role> {
  return http.generalClient().get(
    'rbac',
    'role/id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function notChildForUser(userKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Role> {
  return http.generalClient().get(
    'rbac',
    `user/${userKey.string_id}/not-child-role`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
