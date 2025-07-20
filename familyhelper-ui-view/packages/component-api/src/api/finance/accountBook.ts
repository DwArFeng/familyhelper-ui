// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type PoabPermissionLevel } from './poab'
import { type DispAccount } from '../system/account'

export type AccountBook = {
  key: LongIdKey
  name: string
  last_recorded_date: number | null
  total_value: number
  remark: string
}

export type DispAccountBook = AccountBook & {
  owner_account: DispAccount | null
  permission_level: PoabPermissionLevel | null
}

export type AccountBookCreateInfo = {
  name: string
  remark: string
}

export type AccountBookUpdateInfo = {
  account_book_key: LongIdKey
  name: string
  remark: string
}

export type AccountBookPermissionUpsertInfo = {
  account_book_key: LongIdKey
  user_key: StringIdKey
  permission_level: PoabPermissionLevel
}

export type AccountBookPermissionRemoveInfo = {
  account_book_key: LongIdKey
  user_key: StringIdKey
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('finance', `account-book/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<AccountBook> {
  return http.generalClient().get('finance', `account-book/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<AccountBook> {
  return http.generalClient().get(
    'finance',
    'account-book/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function allPermitted(pagingInfo: PagingInfo): Prespa<AccountBook> {
  return http.generalClient().get(
    'finance',
    'account-book/all-permitted/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function allOwned(pagingInfo: PagingInfo): Prespa<AccountBook> {
  return http.generalClient().get(
    'finance',
    'account-book/all-owned/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispAccountBook> {
  return http.generalClient().get('finance', `account-book/${key.long_id}/disp/`, {}, 'json')
}

export function allPermittedDisp(pagingInfo: PagingInfo): Prespa<DispAccountBook> {
  return http.generalClient().get(
    'finance',
    'account-book/all-permitted/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function allOwnedDisp(pagingInfo: PagingInfo): Prespa<DispAccountBook> {
  return http.generalClient().get(
    'finance',
    'account-book/all-owned/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: AccountBookCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('finance', 'account-book/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: AccountBookUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'account-book/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(accountBookKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'account-book/remove', accountBookKey, 'application/json;charset=UTF-8')
}

export function upsertPermission(upsertInfo: AccountBookPermissionUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'account-book/upsert-permission', upsertInfo, 'application/json;charset=UTF-8')
}

export function removePermission(removeInfo: AccountBookPermissionRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'account-book/remove-permission', removeInfo, 'application/json;charset=UTF-8')
}

export function recordCommit(accountBookKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'account-book/record-commit', accountBookKey, 'application/json;charset=UTF-8')
}

export function rollbackAll(accountBookKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'account-book/rollback-all', accountBookKey, 'application/json;charset=UTF-8')
}
