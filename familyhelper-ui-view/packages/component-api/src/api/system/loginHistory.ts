// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { PagingInfo } from '../../util/request'
import type { Pres, Prespa } from '../../util/response'

export type LoginHistoryResponseCodePassed = 0
export type LoginHistoryResponseCodeAccountNotExists = 10
export type LoginHistoryResponseCodeAccountDisabled = 20
export type LoginHistoryResponseCodePasswordIncorrect = 30
export type LoginHistoryResponseCodeProtectorProhibited = 40
export type LoginHistoryResponseCodeProtectorInfoNotExists = 50

export type LoginHistoryResponseCode =
  | LoginHistoryResponseCodePassed
  | LoginHistoryResponseCodeAccountNotExists
  | LoginHistoryResponseCodeAccountDisabled
  | LoginHistoryResponseCodePasswordIncorrect
  | LoginHistoryResponseCodeProtectorProhibited
  | LoginHistoryResponseCodeProtectorInfoNotExists

export type LoginHistory = {
  key: LongIdKey
  account_id: string
  happened_date: number
  response_code: LoginHistoryResponseCode
  message: string
  alarm_level: number
  login_remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('system', `login-history/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<LoginHistory> {
  return http.generalClient().get('system', `login-history//${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<LoginHistory> {
  return http.generalClient().get(
    'system',
    'login-history/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function accountIdEquals(pattern: string, pagingInfo: PagingInfo): Prespa<LoginHistory> {
  return http.generalClient().get(
    'system',
    'login-history/account-id-equals/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
