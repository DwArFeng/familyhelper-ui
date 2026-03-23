// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type LoginHistory } from './loginHistory'
import { type RecordKey } from './key'

export type LoginParamRecord = {
  key: RecordKey
  value: string
}

export type DispLoginParamRecord = LoginParamRecord & {
  login_history: LoginHistory
}

export function exists(key: RecordKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'acckeeper',
      `login-param-record/${key.login_history_id}&${key.record_id}/exists/`,
      {},
      'json',
    )
}

export function get(key: RecordKey): Pres<LoginParamRecord> {
  return http
    .generalClient()
    .get('acckeeper', `login-param-record/${key.login_history_id}&${key.record_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<LoginParamRecord> {
  return http.generalClient().get(
    'acckeeper',
    'login-param-record/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForLoginHistory(
  loginHistoryKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<LoginParamRecord> {
  return http.generalClient().get(
    'acckeeper',
    `login-history/${loginHistoryKey.long_id}/login-param-record/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: RecordKey): Pres<DispLoginParamRecord> {
  return http
    .generalClient()
    .get(
      'acckeeper',
      `login-param-record/${key.login_history_id}&${key.record_id}/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispLoginParamRecord> {
  return http.generalClient().get(
    'acckeeper',
    'login-param-record/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForLoginHistoryDisp(
  loginHistoryKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispLoginParamRecord> {
  return http.generalClient().get(
    'acckeeper',
    `login-history/${loginHistoryKey.long_id}/login-param-record/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
