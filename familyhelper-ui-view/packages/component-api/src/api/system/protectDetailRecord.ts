// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type RecordKey = {
  login_history_id: string
  record_id: string
}

export type ProtectDetailRecord = {
  key: RecordKey
  value: string
}

export function exists(recordKey: RecordKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'system',
      `protect-detail-record/${recordKey.login_history_id}%26${recordKey.record_id}/exists/`,
      {},
      'json',
    )
}

export function inspect(recordKey: RecordKey): Pres<ProtectDetailRecord> {
  return http
    .generalClient()
    .get(
      'system',
      `protect-detail-record/${recordKey.login_history_id}%26${recordKey.record_id}/`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<ProtectDetailRecord> {
  return http.generalClient().get(
    'system',
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
    'system',
    `login-history/${loginHistoryKey.long_id}/protect-detail-record/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
