// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type Pexp = {
  key: LongIdKey
  role_key: StringIdKey | null
  content: string
  remark: string
}

export type InsertPexp = Omit<Pexp, 'key'> & { key: LongIdKey | null }

export type UpdatePexp = Pexp

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('system', `pexp/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<Pexp> {
  return http.generalClient().get('system', `pexp/${key.long_id}/`, {}, 'json')
}

export function insert(pexp: InsertPexp): Pres<LongIdKey> {
  return http.generalClient().post('system', 'pexp/', pexp, 'application/json;charset=UTF-8')
}

export function update(pexp: UpdatePexp): Pres<null> {
  return http.generalClient().patch('system', 'pexp/', pexp, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('system', `pexp/${key.long_id}/`, {}, 'json')
}

export function childForRole(roleKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Pexp> {
  return http.generalClient().get(
    'system',
    `role/${roleKey.string_id}/pexp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
