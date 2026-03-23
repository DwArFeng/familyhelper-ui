// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type AcckeeperAccount } from './loginHistory'

/**
 * 登录状态类型。
 * 对应 Constants.LOGIN_STATE_TYPE_*
 */
export type LoginStateTypeDynamic = 0
export type LoginStateTypeStatic = 10

export type LoginStateType = LoginStateTypeDynamic | LoginStateTypeStatic

export type LoginState = {
  key: StringIdKey
  account_key: StringIdKey
  expire_date: number
  serial_version: string
  generated_date: number
  type: LoginStateType
  remark: string
}

export type DispLoginState = LoginState & {
  account: AcckeeperAccount
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('acckeeper', `login-state/${key.string_id}/exists/`, {}, 'json')
}

export function get(key: StringIdKey): Pres<LoginState> {
  return http.generalClient().get('acckeeper', `login-state/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<LoginState> {
  return http.generalClient().get(
    'acckeeper',
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
    'acckeeper',
    `account/${accountKey.string_id}/login-state/`,
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
    'acckeeper',
    `account/${accountKey.string_id}/login-state/type-dynamic`,
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
    'acckeeper',
    `account/${accountKey.string_id}/login-state/type-static`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: StringIdKey): Pres<DispLoginState> {
  return http.generalClient().get('acckeeper', `login-state/${key.string_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispLoginState> {
  return http.generalClient().get(
    'acckeeper',
    'login-state/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountDisp(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispLoginState> {
  return http.generalClient().get(
    'acckeeper',
    `account/${accountKey.string_id}/login-state/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountTypeEqualsDynamicDisp(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispLoginState> {
  return http.generalClient().get(
    'acckeeper',
    `account/${accountKey.string_id}/login-state/type-dynamic/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountTypeEqualsStaticDisp(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispLoginState> {
  return http.generalClient().get(
    'acckeeper',
    `account/${accountKey.string_id}/login-state/type-static/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
