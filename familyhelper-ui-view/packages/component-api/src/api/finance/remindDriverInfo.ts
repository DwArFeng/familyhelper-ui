// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type RemindScopeTypeOwnerOnly = 0
export type RemindScopeTypeOwnerAndModifier = 1
export type RemindScopeTypeAllPermitted = 2

export type RemindScopeType =
  | RemindScopeTypeOwnerOnly
  | RemindScopeTypeOwnerAndModifier
  | RemindScopeTypeAllPermitted

export type RemindDriverInfo = {
  key: LongIdKey
  account_book_key: LongIdKey
  enabled: boolean
  type: string
  param: string
  remind_scope_type: RemindScopeType
  remark: string
}

export type InsertRemindDriverInfo = Omit<RemindDriverInfo, 'key'> & {
  key: LongIdKey | null
}

export type UpdateRemindDriverInfo = RemindDriverInfo

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('finance', `remind-driver-info/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<RemindDriverInfo> {
  return http.generalClient().get('finance', `remind-driver-info/${key.long_id}/`, {}, 'json')
}

export function insert(remindDriverInfo: InsertRemindDriverInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('finance', 'remind-driver-info/', remindDriverInfo, 'application/json;charset=UTF-8')
}

export function update(remindDriverInfo: UpdateRemindDriverInfo): Pres<null> {
  return http
    .generalClient()
    .patch('finance', 'remind-driver-info/', remindDriverInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('finance', `remind-driver-info/${key.long_id}/`, {}, 'json')
}

export function childForAccountBook(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<RemindDriverInfo> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/remind-driver-info/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
