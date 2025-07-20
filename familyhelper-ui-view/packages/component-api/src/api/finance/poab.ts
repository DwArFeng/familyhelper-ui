// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type DispAccountBook } from './accountBook'
import { type DispAccount } from '../system/account'

export type PoabPermissionLevelOwner = 0
export type PoabPermissionLevelGuest = 1

export type PoabPermissionLevel = PoabPermissionLevelOwner | PoabPermissionLevelGuest

export type PoabKey = {
  long_id: string
  string_id: string
}

export type Poab = {
  key: PoabKey
  permission_level: PoabPermissionLevel
  remark: string
}

export type DispPoab = Poab & {
  account_book: DispAccountBook
  account: DispAccount
}

export function exists(key: PoabKey): Pres<boolean> {
  return http
    .generalClient()
    .get('finance', `poab/${key.long_id}%26${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: PoabKey): Pres<Poab> {
  return http.generalClient().get('finance', `poab/${key.long_id}%26${key.string_id}/`, {}, 'json')
}

export function inspectDisp(key: PoabKey): Pres<DispPoab> {
  return http
    .generalClient()
    .get('finance', `poab/${key.long_id}%26${key.string_id}/disp/`, {}, 'json')
}

export function childForAccountBook(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<Poab> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/poab/`,
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
): Prespa<DispPoab> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/poab/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
