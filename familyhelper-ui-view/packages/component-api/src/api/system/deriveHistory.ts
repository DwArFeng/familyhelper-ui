// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type DeriveHistoryResponseCodePassed = 0
export type DeriveHistoryResponseCodeLoginStateNotExists = 10
export type DeriveHistoryResponseCodeLoginStateExpired = 15
export type DeriveHistoryResponseCodeAccountNotExists = 20
export type DeriveHistoryResponseCodeAccountDisabled = 30
export type DeriveHistoryResponseCodeSerialVersionInconsistent = 40

export type DeriveHistoryResponseCode =
  | DeriveHistoryResponseCodePassed
  | DeriveHistoryResponseCodeLoginStateNotExists
  | DeriveHistoryResponseCodeLoginStateExpired
  | DeriveHistoryResponseCodeAccountNotExists
  | DeriveHistoryResponseCodeAccountDisabled
  | DeriveHistoryResponseCodeSerialVersionInconsistent

export type DeriveHistory = {
  key: LongIdKey
  account_id: string
  happened_date: number
  response_code: DeriveHistoryResponseCode
  derive_remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('system', `derive-history/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<DeriveHistory> {
  return http.generalClient().get('system', `derive-history//${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<DeriveHistory> {
  return http.generalClient().get(
    'system',
    'derive-history/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function accountIdEquals(pattern: string, pagingInfo: PagingInfo): Prespa<DeriveHistory> {
  return http.generalClient().get(
    'system',
    'derive-history/account-id-equals/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
