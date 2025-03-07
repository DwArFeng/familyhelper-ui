// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey, StringIdKey } from '../subgrade/key'
import type { PagingInfo } from '../../util/request'
import type { Pres, Prespa } from '../../util/response'

export type LoginStateTypeDynamic = 0
export type LoginStateTypeStatic = 10

export type LoginStateType = LoginStateTypeDynamic | LoginStateTypeStatic

export type LoginState = {
  key: LongIdKey
  account_key: StringIdKey
  expire_date: number
  serial_version: number
  generated_date: number
  type: LoginStateType
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('system', `login-state/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<LoginState> {
  return http.generalClient().get('system', `login-state/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<LoginState> {
  return http.generalClient().get(
    'system',
    'login-state/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccount(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<LoginState> {
  return http.generalClient().get(
    'system',
    `account/${accountKey.string_id}/login-state`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountTypeEqualsDynamic(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<LoginState> {
  return http.generalClient().get(
    'system',
    `account/${accountKey.string_id}/login-state/type-equals-dynamic`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountTypeEqualsStatic(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<LoginState> {
  return http.generalClient().get(
    'system',
    `account/${accountKey.string_id}/login-state/type-equals-static`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
