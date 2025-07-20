// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type TotalBalanceHistory = {
  key: LongIdKey
  account_book_key: LongIdKey
  total_value: number
  happened_date: number
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('finance', `total-balance-history/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<TotalBalanceHistory> {
  return http.generalClient().get('finance', `total-balance-history/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<TotalBalanceHistory> {
  return http.generalClient().get(
    'finance',
    'total-balance-history/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBook(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<TotalBalanceHistory> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/total-balance-history/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookDesc(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<TotalBalanceHistory> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/total-balance-history/desc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
