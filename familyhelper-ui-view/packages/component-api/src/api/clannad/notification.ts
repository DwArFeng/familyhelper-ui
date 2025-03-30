// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey, StringIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

export type Notification = {
  key: LongIdKey
  user_key: StringIdKey
  remark: string
  notified_date: number
  read_date: number | null
  read_flag: boolean
  subject: string
  body: string
}

export type NotificationCreateInfo = {
  user_key: StringIdKey
  subject: string
  body: string
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('clannad', `notification/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<Notification> {
  return http.generalClient().get('clannad', `notification/${key.long_id}/`, {}, 'json')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('clannad', `notification/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Notification> {
  return http.generalClient().get(
    'clannad',
    'notification/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForUser(userKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Notification> {
  return http.generalClient().get(
    'clannad',
    `user/${userKey.string_id}/notification/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForUserUnread(
  userKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Notification> {
  return http.generalClient().get(
    'clannad',
    `user/${userKey.string_id}/notification/unread/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(notificationCreateInfo: NotificationCreateInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'clannad',
      'notification/create',
      notificationCreateInfo,
      'application/json;charset=UTF-8',
    )
}

export function read(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'notification/read', key, 'application/json;charset=UTF-8')
}

export function readAll(userKey: StringIdKey): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'notification/read-all', userKey, 'application/json;charset=UTF-8')
}

export function removeAll(userKey: StringIdKey): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'notification/remove-all', userKey, 'application/json;charset=UTF-8')
}
