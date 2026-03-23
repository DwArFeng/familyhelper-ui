// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type AcckeeperAccount } from './loginHistory'

/**
 * 派生响应代码。
 * 对应 Constants.DERIVE_RESPONSE_CODE_*
 */
export type DeriveResponseCodePassed = 0
export type DeriveResponseCodeLoginStateNotExists = 10
export type DeriveResponseCodeLoginStateExpired = 15
export type DeriveResponseCodeAccountNotExists = 20
export type DeriveResponseCodeAccountDisabled = 30
export type DeriveResponseCodeSerialVersionInconsistent = 40

export type DeriveResponseCode =
  | DeriveResponseCodePassed
  | DeriveResponseCodeLoginStateNotExists
  | DeriveResponseCodeLoginStateExpired
  | DeriveResponseCodeAccountNotExists
  | DeriveResponseCodeAccountDisabled
  | DeriveResponseCodeSerialVersionInconsistent

export type DeriveHistory = {
  key: LongIdKey
  account_id: string
  happened_date: number
  response_code: DeriveResponseCode
  derive_remark: string
}

export type DispDeriveHistory = DeriveHistory & {
  account: AcckeeperAccount
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('acckeeper', `derive-history/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<DeriveHistory> {
  return http.generalClient().get('acckeeper', `derive-history/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<DeriveHistory> {
  return http.generalClient().get(
    'acckeeper',
    'derive-history/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function accountIdEquals(accountId: string, pagingInfo: PagingInfo): Prespa<DeriveHistory> {
  return http.generalClient().get(
    'acckeeper',
    'derive-history/account-id-equals/',
    {
      accountId,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function accountIdLike(pattern: string, pagingInfo: PagingInfo): Prespa<DeriveHistory> {
  return http.generalClient().get(
    'acckeeper',
    'derive-history/account-id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispDeriveHistory> {
  return http.generalClient().get('acckeeper', `derive-history/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispDeriveHistory> {
  return http.generalClient().get(
    'acckeeper',
    'derive-history/all/disp/',
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
): Prespa<DispDeriveHistory> {
  return http.generalClient().get(
    'acckeeper',
    'derive-history/account-id-equals/disp/',
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
): Prespa<DispDeriveHistory> {
  return http.generalClient().get(
    'acckeeper',
    'derive-history/account-id-like/disp/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
