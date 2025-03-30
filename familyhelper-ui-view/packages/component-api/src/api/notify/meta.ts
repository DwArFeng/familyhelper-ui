// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { Pres, Prespa } from '../../util/response'

import type { MetaIndicator } from './metaIndicator'
import type { PagingInfo } from '../../util/request'
import type { LongIdKey, StringIdKey } from '../subgrade/key'

export type MetaKey = {
  notify_setting_id: string
  topic_id: string
  user_id: string
  meta_id: string
}

export type Meta = {
  key: MetaKey
  value: string
  remark: string
}

export type InsertMeta = Meta

export type UpdateMeta = Meta

export type DispMeta = Meta & {
  indicator: MetaIndicator
}

export function exists(key: MetaKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'notify',
      `meta/${key.notify_setting_id}%26${key.topic_id}%26${key.user_id}%26${key.meta_id}/exists/`,
      {},
      'json',
    )
}

export function inspect(key: MetaKey): Pres<Meta> {
  return http
    .generalClient()
    .get(
      'notify',
      `meta/${key.notify_setting_id}%26${key.topic_id}%26${key.user_id}%26${key.meta_id}/exists/`,
      {},
      'json',
    )
}

export function insert(meta: InsertMeta): Pres<MetaKey> {
  return http.generalClient().post('notify', 'meta/', meta, 'application/json;charset=UTF-8')
}

export function update(meta: UpdateMeta): Pres<null> {
  return http.generalClient().patch('notify', 'meta/', meta, 'application/json;charset=UTF-8')
}

export function remove(key: MetaKey): Pres<null> {
  return http
    .generalClient()
    .del(
      'notify',
      `meta/${key.notify_setting_id}%26${key.topic_id}%26${key.user_id}%26${key.meta_id}/`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<Meta> {
  return http.generalClient().get(
    'notify',
    'meta/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNotifySettingTopicUser(
  notifySettingKey: LongIdKey,
  topicKey: StringIdKey,
  userKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Meta> {
  return http.generalClient().get(
    'notify',
    `notify-setting/${notifySettingKey.long_id}/topic/${topicKey.string_id}/user/${userKey.string_id}/meta/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: MetaKey): Pres<DispMeta> {
  return http
    .generalClient()
    .get(
      'notify',
      `meta/${key.notify_setting_id}%26${key.topic_id}%26${key.user_id}%26${key.meta_id}/exists/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispMeta> {
  return http.generalClient().get(
    'notify',
    'meta/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNotifySettingTopicUserDisp(
  notifySettingKey: LongIdKey,
  topicKey: StringIdKey,
  userKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispMeta> {
  return http.generalClient().get(
    'notify',
    `notify-setting/${notifySettingKey.long_id}/topic/${topicKey.string_id}/user/${userKey.string_id}/meta/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
