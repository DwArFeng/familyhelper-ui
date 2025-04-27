// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { DispAccount } from '../system/account'

export type MessageAuthorizationKey = {
  receive_user_id: string
  authorized_send_user_id: string
}

export type MessageAuthorization = {
  key: MessageAuthorizationKey
  enabled: boolean
  remark: string
  created_date: number
}

export type DispMessageAuthorization = MessageAuthorization & {
  receive_account: DispAccount
  authorized_send_account: DispAccount
}

export type MessageAuthorizationCreateInfo = {
  key: MessageAuthorizationKey
  enabled: boolean
  remark: string
}

export type MessageAuthorizationUpdateInfo = {
  key: MessageAuthorizationKey
  enabled: boolean
  remark: string
}

export type MessageAuthorizationRemoveInfo = {
  key: MessageAuthorizationKey
}

export function exists(key: MessageAuthorizationKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'clannad',
      `message-authorization/${key.receive_user_id}%26${key.authorized_send_user_id}/exists/`,
      {},
      'json',
    )
}

export function inspect(key: MessageAuthorizationKey): Pres<MessageAuthorization> {
  return http
    .generalClient()
    .get(
      'clannad',
      `message-authorization/${key.receive_user_id}%26${key.authorized_send_user_id}/`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<MessageAuthorization> {
  return http.generalClient().get(
    'clannad',
    'message-authorization/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForReceiveAccount(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<MessageAuthorization> {
  return http.generalClient().get(
    'clannad',
    `account/receive/${accountKey.string_id}/message-authorization/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAuthorizedSendAccount(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<MessageAuthorization> {
  return http.generalClient().get(
    'clannad',
    `account/authorized-send/${accountKey.string_id}/message-authorization/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAuthorizedSendAccountIdLike(
  accountKey: StringIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<MessageAuthorization> {
  return http.generalClient().get(
    'clannad',
    `account/authorized-send/${accountKey.string_id}/message-authorization/id-like/`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: MessageAuthorizationKey): Pres<DispMessageAuthorization> {
  return http
    .generalClient()
    .get(
      'clannad',
      `message-authorization/${key.receive_user_id}%26${key.authorized_send_user_id}/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispMessageAuthorization> {
  return http.generalClient().get(
    'clannad',
    'message-authorization/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForReceiveAccountDisp(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispMessageAuthorization> {
  return http.generalClient().get(
    'clannad',
    `account/receive/${accountKey.string_id}/message-authorization/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAuthorizedSendAccountDisp(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispMessageAuthorization> {
  return http.generalClient().get(
    'clannad',
    `account/authorized-send/${accountKey.string_id}/message-authorization/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAuthorizedSendAccountIdLikeDisp(
  accountKey: StringIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispMessageAuthorization> {
  return http.generalClient().get(
    'clannad',
    `account/authorized-send/${accountKey.string_id}/message-authorization/id-like/disp/`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: MessageAuthorizationCreateInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message-authorization/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: MessageAuthorizationUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message-authorization/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(removeInfo: MessageAuthorizationRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message-authorization/remove', removeInfo, 'application/json;charset=UTF-8')
}
