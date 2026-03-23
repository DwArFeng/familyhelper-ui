// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type User = {
  key: StringIdKey
  remark: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('rbac', `user/${key.string_id}/exists`, {}, 'json')
}

export function get(key: StringIdKey): Pres<User> {
  return http.generalClient().get('rbac', `user/${key.string_id}`, {}, 'json')
}

export function insert(user: User): Pres<StringIdKey> {
  return http.generalClient().post('rbac', 'user', user, 'application/json;charset=UTF-8')
}

export function update(user: User): Pres<null> {
  return http.generalClient().patch('rbac', 'user', user, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('rbac', `user/${key.string_id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<User> {
  return http.generalClient().get(
    'rbac',
    'user/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<User> {
  return http.generalClient().get(
    'rbac',
    'user/id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
