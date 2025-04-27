// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { DispAccount } from '../system/account'

export type MessageStatusEditing = 0
export type MessageStatusSend = 1
export type MessageStatusReceived = 2

export type MessageStatus = MessageStatusEditing | MessageStatusSend | MessageStatusReceived

export type Message = {
  key: LongIdKey
  send_user_key: StringIdKey
  receive_user_key: StringIdKey | null
  subject: string
  remark: string
  status: MessageStatus
  sent_date: number | null
  received_date: number | null
  attachment_count: number
  created_date: number
  receive_user_hide: boolean
}

export type DispMessage = Message & {
  send_account: DispAccount
  receive_account: DispAccount | null
}

export type MessageCreateInfo = {
  receive_user_key: StringIdKey | null
  subject: string
  remark: string
}

export type MessageUpdateInfo = {
  message_key: LongIdKey
  receive_user_key: StringIdKey | null
  subject: string
  remark: string
}

export type MessageRemoveInfo = {
  message_key: LongIdKey
}

export type MessageMarkSentInfo = {
  message_key: LongIdKey
}

export type MessageMarkReceivedInfo = {
  message_key: LongIdKey
}

export type MessageReceiveUserHideInfo = {
  message_key: LongIdKey
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('clannad', `message/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<Message> {
  return http.generalClient().get('clannad', `message/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Message> {
  return http.generalClient().get(
    'clannad',
    'message/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSendAccount(
  accountId: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Message> {
  return http.generalClient().get(
    'clannad',
    `account/send/${accountId.string_id}/message/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForReceiveAccount(
  accountId: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Message> {
  return http.generalClient().get(
    'clannad',
    `account/receive/${accountId.string_id}/message/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSendAccountDisplay(
  accountId: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Message> {
  return http.generalClient().get(
    'clannad',
    `account/send/${accountId.string_id}/message/display/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSendAccountStatusEqDisplay(
  accountId: StringIdKey,
  status: MessageStatus,
  pagingInfo: PagingInfo,
): Prespa<Message> {
  return http.generalClient().get(
    'clannad',
    `account/send/${accountId.string_id}/message/display/status-eq/`,
    {
      status,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForReceiveAccountDisplay(
  accountId: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Message> {
  return http.generalClient().get(
    'clannad',
    `account/receive/${accountId.string_id}/message/display/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispMessage> {
  return http.generalClient().get('clannad', `message/${key.long_id}/disp/`, {}, 'blob')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispMessage> {
  return http.generalClient().get(
    'clannad',
    'message/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSendAccountDisp(
  accountId: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispMessage> {
  return http.generalClient().get(
    'clannad',
    `account/send/${accountId.string_id}/message/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForReceiveAccountDisp(
  accountId: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispMessage> {
  return http.generalClient().get(
    'clannad',
    `account/receive/${accountId.string_id}/message/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSendAccountDisplayDisp(
  accountId: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispMessage> {
  return http.generalClient().get(
    'clannad',
    `account/send/${accountId.string_id}/message/display/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSendAccountStatusEqDisplayDisp(
  accountId: StringIdKey,
  status: MessageStatus,
  pagingInfo: PagingInfo,
): Prespa<DispMessage> {
  return http.generalClient().get(
    'clannad',
    `account/send/${accountId.string_id}/message/display/status-eq/disp/`,
    {
      status,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForReceiveAccountDisplayDisp(
  accountId: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispMessage> {
  return http.generalClient().get(
    'clannad',
    `account/receive/${accountId.string_id}/message/display/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: MessageCreateInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message/create/', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: MessageUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message/update/', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(removeInfo: MessageRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message/remove/', removeInfo, 'application/json;charset=UTF-8')
}

export function markSent(markSentInfo: MessageMarkSentInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message/mark-sent/', markSentInfo, 'application/json;charset=UTF-8')
}

export function markReceived(markReceivedInfo: MessageMarkReceivedInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message/mark-received/', markReceivedInfo, 'application/json;charset=UTF-8')
}

export function markReceiveUserHide(receiveUserHideInfo: MessageReceiveUserHideInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'clannad',
      'message/mark-receive-user-hide/',
      receiveUserHideInfo,
      'application/json;charset=UTF-8',
    )
}
