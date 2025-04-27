// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type NotifyInfoRecordTypeRouteInfo = 0
export type NotifyInfoRecordTypeDispatchInfo = 1
export type NotifyInfoRecordTypeSendInfo = 2

export type NotifyInfoRecordType =
  | NotifyInfoRecordTypeRouteInfo
  | NotifyInfoRecordTypeDispatchInfo
  | NotifyInfoRecordTypeSendInfo

import { type DispNotifyHistory } from './notifyHistory'

export type NotifyInfoRecordKey = {
  notify_history_id: string
  type: NotifyInfoRecordType
  record_id: string
}

export type NotifyInfoRecord = {
  key: NotifyInfoRecordKey
  value: string
}

export type DispNotifyInfoRecord = NotifyInfoRecord & {
  notify_history: DispNotifyHistory
}

export function exists(key: NotifyInfoRecordKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'notify',
      `notify-info-record/${key.notify_history_id}%26${key.type}%26${key.record_id}/exists/`,
      {},
      'json',
    )
}

export function inspect(key: NotifyInfoRecordKey): Pres<NotifyInfoRecord> {
  return http
    .generalClient()
    .get(
      'notify',
      `notify-info-record/${key.notify_history_id}%26${key.type}%26${key.record_id}/`,
      {},
      'json',
    )
}

export function remove(key: NotifyInfoRecordKey): Pres<null> {
  return http
    .generalClient()
    .del(
      'notify',
      `notify-info-record/${key.notify_history_id}%26${key.type}%26${key.record_id}/`,
      {},
      'json',
    )
}

export function childForNotifyHistory(
  notifyHistoryKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<NotifyInfoRecord> {
  return http.generalClient().get(
    'notify',
    `notify-history/${notifyHistoryKey.long_id}/notify-info-record/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: NotifyInfoRecordKey): Pres<DispNotifyInfoRecord> {
  return http
    .generalClient()
    .get(
      'notify',
      `notify-info-record/${key.notify_history_id}%26${key.type}%26${key.record_id}/disp/`,
      {},
      'json',
    )
}

export function childForNotifySettingDisp(
  notifySettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispNotifyInfoRecord> {
  return http.generalClient().get(
    'notify',
    `notify-history/${notifySettingKey.long_id}/notify-info-record/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
