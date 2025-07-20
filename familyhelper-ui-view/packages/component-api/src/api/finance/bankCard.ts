// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type DispAccountBook } from './accountBook'
import { type BankCardTypeIndicator } from './bankCardTypeIndicator'

export type BankCard = {
  key: LongIdKey
  account_book_key: LongIdKey
  name: string
  card_type: string
  last_recorded_date: number
  balance_value: number
  temp_flag: boolean
  temp_last_recorded_date: number
  temp_balance_value: number
  remark: string
}

export type DispBankCard = BankCard & {
  account_book: DispAccountBook
  type_indicator: BankCardTypeIndicator
}

export type BankCardCreateInfo = {
  account_book_key: LongIdKey
  name: string
  card_type: string
  remark: string
}

export type BankCardUpdateInfo = {
  bank_card_key: LongIdKey
  name: string
  card_type: string
  remark: string
}

export type BankCardBalanceRecordInfo = {
  bank_card_key: LongIdKey
  balance: number
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('finance', `bank-card/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<BankCard> {
  return http.generalClient().get('finance', `bank-card/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<BankCard> {
  return http.generalClient().get(
    'finance',
    'bank-card/all/',
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
): Prespa<BankCard> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/bank-card/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispBankCard> {
  return http.generalClient().get('finance', `bank-card/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispBankCard> {
  return http.generalClient().get(
    'finance',
    'bank-card/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookDisp(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispBankCard> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/bank-card/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: BankCardCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('finance', 'bank-card/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: BankCardUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'bank-card/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(bankCardKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'bank-card/remove', bankCardKey, 'application/json;charset=UTF-8')
}

export function recordBalance(recordInfo: BankCardBalanceRecordInfo): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'bank-card/record-balance', recordInfo, 'application/json;charset=UTF-8')
}

export function rollbackBalance(bankCardKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'bank-card/rollback-balance', bankCardKey, 'application/json;charset=UTF-8')
}
