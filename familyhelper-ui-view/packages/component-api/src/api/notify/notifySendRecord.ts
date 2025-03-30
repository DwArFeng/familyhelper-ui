// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

import type { Topic } from './topic'
import type { DispAccount } from '../system/account'
import type { DispNotifyHistory } from './notifyHistory'

export type NotifySendRecordKey = {
  notify_history_id: string
  topic_id: string
  user_id: string
}

export type NotifySendRecord = {
  key: NotifySendRecordKey
  succeed_flag: boolean
  sender_message: string
}

export type DispNotifySendRecord = NotifySendRecord & {
  notify_history: DispNotifyHistory
  topic: Topic
  account: DispAccount
}

export function exists(key: NotifySendRecordKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'notify',
      `notify-send-record/${key.notify_history_id}%26${key.topic_id}%26${key.user_id}/exists/`,
      {},
      'json',
    )
}

export function inspect(key: NotifySendRecordKey): Pres<NotifySendRecord> {
  return http
    .generalClient()
    .get(
      'notify',
      `notify-send-record/${key.notify_history_id}%26${key.topic_id}%26${key.user_id}/`,
      {},
      'json',
    )
}

export function remove(key: NotifySendRecordKey): Pres<null> {
  return http
    .generalClient()
    .del(
      'notify',
      `notify-send-record/${key.notify_history_id}%26${key.topic_id}%26${key.user_id}/`,
      {},
      'json',
    )
}

export function childForNotifyHistory(
  notifyHistoryKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<NotifySendRecord> {
  return http.generalClient().get(
    'notify',
    `notify-history/${notifyHistoryKey.long_id}/notify-send-record/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: NotifySendRecordKey): Pres<DispNotifySendRecord> {
  return http
    .generalClient()
    .get(
      'notify',
      `notify-send-record/${key.notify_history_id}%26${key.topic_id}%26${key.user_id}/disp/`,
      {},
      'json',
    )
}

export function childForNotifySettingDisp(
  notifyHistoryKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispNotifySendRecord> {
  return http.generalClient().get(
    'notify',
    `notify-history/${notifyHistoryKey.long_id}/notify-send-record/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
