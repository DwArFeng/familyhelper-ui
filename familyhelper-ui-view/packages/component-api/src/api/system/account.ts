// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { PagingInfo } from '../../util/request'
import type { Pres, Prespa } from '../../util/response'

export type Account = {
  key: StringIdKey
  name: string
  enabled: boolean
  remark: string
}

export type DispAccount = Account & {
  display_name: string
}

export type AccountRegisterInfo = {
  account_key: StringIdKey
  display_name: string
  enabled: boolean
  remark: string
  password: string
}

export type AccountUpdateInfo = {
  account_key: StringIdKey
  display_name: string
  enabled: boolean
  remark: string
}

export type AccountPasswordUpdateInfo = {
  account_key: StringIdKey
  old_password: string
  new_password: string
}

export type AccountPasswordResetInfo = {
  account_key: StringIdKey
  new_password: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('system', `account/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<Account> {
  return http.generalClient().get('system', `account/${key.string_id}/`, {}, 'json')
}

export function resetRoleRelation(key: StringIdKey, roleKeys: StringIdKey[]): Pres<null> {
  return http
    .generalClient()
    .post(
      'system',
      `account/${key.string_id}/reset-role-relation`,
      roleKeys,
      'application/json;charset=UTF-8',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<Account> {
  return http.generalClient().get(
    'system',
    'account/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForRole(roleKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Account> {
  return http.generalClient().get(
    'system',
    `role/${roleKey.string_id}/account/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForProfileGuest(
  profileKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Account> {
  return http.generalClient().get(
    'system',
    `profile/${profileKey.string_id}/account/guest/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<Account> {
  return http.generalClient().get(
    'system',
    'account/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: StringIdKey): Pres<DispAccount> {
  return http.generalClient().get('system', `account/${key.string_id}/disp/`, {}, 'json')
}

export function idLikeDisp(pattern: string, pagingInfo: PagingInfo): Prespa<DispAccount> {
  return http.generalClient().get(
    'system',
    'account/id-like/disp/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function remove(key: StringIdKey): Pres<null> {
  return http
    .generalClient()
    .post('system', 'account/remove', key, 'application/json;charset=UTF-8')
}

export function register(registerInfo: AccountRegisterInfo): Pres<null> {
  return http
    .generalClient()
    .post('system', 'account/register', registerInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: AccountUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('system', 'account/update', updateInfo, 'application/json;charset=UTF-8')
}

export function updatePassword(passwordUpdateInfo: AccountPasswordUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('system', 'account/update-password', passwordUpdateInfo, 'application/json;charset=UTF-8')
}

export function resetPassword(passwordResetInfo: AccountPasswordResetInfo): Pres<null> {
  return http
    .generalClient()
    .post('system', 'account/reset-password', passwordResetInfo, 'application/json;charset=UTF-8')
}

export function invalid(key: StringIdKey): Pres<null> {
  return http
    .generalClient()
    .post('system', 'account/invalid', key, 'application/json;charset=UTF-8')
}
