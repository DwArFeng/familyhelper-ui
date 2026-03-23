// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type LoginHistory } from './loginHistory'
import { type RecordKey } from './key'

export type ProtectDetailRecord = {
  key: RecordKey
  value: string
}

export type DispProtectDetailRecord = ProtectDetailRecord & {
  login_history: LoginHistory
}

export function exists(key: RecordKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'acckeeper',
      `protect-detail-record/${key.login_history_id}&${key.record_id}/exists/`,
      {},
      'json',
    )
}

export function get(key: RecordKey): Pres<ProtectDetailRecord> {
  return http
    .generalClient()
    .get('acckeeper', `protect-detail-record/${key.login_history_id}&${key.record_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ProtectDetailRecord> {
  return http.generalClient().get(
    'acckeeper',
    'protect-detail-record/all/',
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
): Prespa<ProtectDetailRecord> {
  return http.generalClient().get(
    'acckeeper',
    `login-history/${loginHistoryKey.long_id}/protect-detail-record/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: RecordKey): Pres<DispProtectDetailRecord> {
  return http
    .generalClient()
    .get(
      'acckeeper',
      `protect-detail-record/${key.login_history_id}&${key.record_id}/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispProtectDetailRecord> {
  return http.generalClient().get(
    'acckeeper',
    'protect-detail-record/all/disp/',
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
): Prespa<DispProtectDetailRecord> {
  return http.generalClient().get(
    'acckeeper',
    `login-history/${loginHistoryKey.long_id}/protect-detail-record/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
