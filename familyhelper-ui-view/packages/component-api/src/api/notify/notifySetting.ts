// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type NotifySetting = {
  key: LongIdKey
  label: string
  remark: string
  enabled: boolean
}

export type InsertNotifySetting = Omit<NotifySetting, 'key'> & { key: LongIdKey | null }

export type UpdateNotifySetting = NotifySetting

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('notify', `notify-setting/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<NotifySetting> {
  return http.generalClient().get('notify', `notify-setting/${key.long_id}/`, {}, 'json')
}

export function insert(notifySetting: InsertNotifySetting): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('notify', 'notify-setting/', notifySetting, 'application/json;charset=UTF-8')
}

export function update(notifySetting: UpdateNotifySetting): Pres<null> {
  return http
    .generalClient()
    .patch('notify', 'notify-setting/', notifySetting, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('notify', `notify-setting/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<NotifySetting> {
  return http.generalClient().get(
    'notify',
    'notify-setting/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function labelLike(pattern: string, pagingInfo: PagingInfo): Prespa<NotifySetting> {
  return http.generalClient().get(
    'notify',
    'notify-setting/label-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
