// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type Scope = {
  key: StringIdKey
  name: string
  remark: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('rbac', `scope/${key.string_id}/exists`, {}, 'json')
}

export function get(key: StringIdKey): Pres<Scope> {
  return http.generalClient().get('rbac', `scope/${key.string_id}`, {}, 'json')
}

export function insert(scope: Scope): Pres<StringIdKey> {
  return http.generalClient().post('rbac', 'scope', scope, 'application/json;charset=UTF-8')
}

export function update(scope: Scope): Pres<null> {
  return http.generalClient().patch('rbac', 'scope', scope, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('rbac', `scope/${key.string_id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Scope> {
  return http.generalClient().get(
    'rbac',
    'scope/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<Scope> {
  return http.generalClient().get(
    'rbac',
    'scope/id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nameLike(pattern: string, pagingInfo: PagingInfo): Prespa<Scope> {
  return http.generalClient().get(
    'rbac',
    'scope/name-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
