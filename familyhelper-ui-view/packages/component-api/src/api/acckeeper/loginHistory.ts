// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

/**
 * 登录响应代码。
 * 对应 Constants.LOGIN_RESPONSE_CODE_*
 */
export type LoginResponseCodePassed = 0
export type LoginResponseCodeAccountNotExists = 10
export type LoginResponseCodeAccountDisabled = 20
export type LoginResponseCodePasswordIncorrect = 30
export type LoginResponseCodeProtectorProhibited = 40
export type LoginResponseCodeProtectorInfoNotExists = 50

export type LoginResponseCode =
  | LoginResponseCodePassed
  | LoginResponseCodeAccountNotExists
  | LoginResponseCodeAccountDisabled
  | LoginResponseCodePasswordIncorrect
  | LoginResponseCodeProtectorProhibited
  | LoginResponseCodeProtectorInfoNotExists

/**
 * 保护器消息等级（登录告警等级）。
 * 对应 Constants.PROTECTOR_MESSAGE_LEVEL_*
 */
export type LoginAlarmLevelInfo = 0
export type LoginAlarmLevelWarn = 10
export type LoginAlarmLevelDanger = 20

export type LoginAlarmLevel = LoginAlarmLevelInfo | LoginAlarmLevelWarn | LoginAlarmLevelDanger

export type AcckeeperAccount = {
  key: StringIdKey
  password: string
  enabled: boolean
  remark: string
  serial_version: string
  display_name: string
  registered_date: number
  login_count: number
  password_update_count: number
  derive_count: number
}

export type LoginHistory = {
  key: LongIdKey
  account_id: string
  happened_date: number
  response_code: LoginResponseCode
  message: string
  alarm_level: LoginAlarmLevel | null
  login_remark: string
}

export type DispLoginHistory = LoginHistory & {
  account: AcckeeperAccount
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('acckeeper', `login-history/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<LoginHistory> {
  return http.generalClient().get('acckeeper', `login-history/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<LoginHistory> {
  return http.generalClient().get(
    'acckeeper',
    'login-history/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function accountIdEquals(accountId: string, pagingInfo: PagingInfo): Prespa<LoginHistory> {
  return http.generalClient().get(
    'acckeeper',
    'login-history/account-id-equals/',
    {
      accountId,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function accountIdLike(pattern: string, pagingInfo: PagingInfo): Prespa<LoginHistory> {
  return http.generalClient().get(
    'acckeeper',
    'login-history/account-id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispLoginHistory> {
  return http.generalClient().get('acckeeper', `login-history/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispLoginHistory> {
  return http.generalClient().get(
    'acckeeper',
    'login-history/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function accountIdEqualsDisp(
  accountId: string,
  pagingInfo: PagingInfo,
): Prespa<DispLoginHistory> {
  return http.generalClient().get(
    'acckeeper',
    'login-history/account-id-equals/disp/',
    {
      accountId,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function accountIdLikeDisp(
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispLoginHistory> {
  return http.generalClient().get(
    'acckeeper',
    'login-history/account-id-like/disp/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
