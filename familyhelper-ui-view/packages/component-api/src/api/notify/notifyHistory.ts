// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type NotifySetting } from './notifySetting'

export type NotifyHistory = {
  key: LongIdKey
  notify_setting_key: LongIdKey | null
  happened_date: number
  remark: string
}

export type DispNotifyHistory = NotifyHistory & {
  notify_setting: NotifySetting | null
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('notify', `notify-history/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<NotifyHistory> {
  return http.generalClient().get('notify', `notify-history/${key.long_id}/`, {}, 'json')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('notify', `notify-history/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<NotifySetting> {
  return http.generalClient().get(
    'notify',
    'notify-history/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNotifySetting(
  notifySettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<NotifySetting> {
  return http.generalClient().get(
    'notify',
    `notify-setting/${notifySettingKey.long_id}/notify-history/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispNotifyHistory> {
  return http.generalClient().get('notify', `notify-history/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispNotifyHistory> {
  return http.generalClient().get(
    'notify',
    'notify-history/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNotifySettingDisp(
  notifySettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispNotifyHistory> {
  return http.generalClient().get(
    'notify',
    `notify-setting/${notifySettingKey.long_id}/notify-history/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
