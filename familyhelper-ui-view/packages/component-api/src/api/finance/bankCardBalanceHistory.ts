// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type BankCardBalanceHistory = {
  key: LongIdKey
  bank_card_key: LongIdKey
  value: number
  happened_date: number
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('finance', `bank-card-balance-history/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<BankCardBalanceHistory> {
  return http
    .generalClient()
    .get('finance', `bank-card-balance-history/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<BankCardBalanceHistory> {
  return http.generalClient().get(
    'finance',
    'bank-card-balance-history/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForBankCard(
  bankCardKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<BankCardBalanceHistory> {
  return http.generalClient().get(
    'finance',
    `bank-card/${bankCardKey.long_id}/bank-card-balance-history/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForBankCardDesc(
  bankCardKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<BankCardBalanceHistory> {
  return http.generalClient().get(
    'finance',
    `bank-card/${bankCardKey.long_id}/bank-card-balance-history/desc`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
