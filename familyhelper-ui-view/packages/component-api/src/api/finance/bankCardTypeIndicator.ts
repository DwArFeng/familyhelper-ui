// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type BankCardTypeIndicator = {
  key: StringIdKey
  label: string
  remark: string
}

export type InsertBankCardTypeIndicator = BankCardTypeIndicator

export type UpdateBankCardTypeIndicator = BankCardTypeIndicator

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('finance', `bank-card-type-indicator/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<BankCardTypeIndicator> {
  return http
    .generalClient()
    .get('finance', `bank-card-type-indicator/${key.string_id}/`, {}, 'json')
}

export function insert(bankCardTypeIndicator: InsertBankCardTypeIndicator): Pres<StringIdKey> {
  return http
    .generalClient()
    .post(
      'finance',
      'bank-card-type-indicator/',
      bankCardTypeIndicator,
      'application/json;charset=UTF-8',
    )
}

export function update(bankCardTypeIndicator: UpdateBankCardTypeIndicator): Pres<null> {
  return http
    .generalClient()
    .patch(
      'finance',
      'bank-card-type-indicator/',
      bankCardTypeIndicator,
      'application/json;charset=UTF-8',
    )
}

export function remove(key: StringIdKey): Pres<null> {
  return http
    .generalClient()
    .del('finance', `bank-card-type-indicator/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<BankCardTypeIndicator> {
  return http.generalClient().get(
    'finance',
    'bank-card-type-indicator/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
