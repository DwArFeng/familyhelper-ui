// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'
import { type StringIdKey } from '../subgrade/key'

export type MetaIndicatorKey = {
  topic_id: string
  meta_id: string
}

export type MetaIndicator = {
  key: MetaIndicatorKey
  label: string
  remark: string
  default_value: string
}

export type InsertMetaIndicator = MetaIndicator

export type UpdateMetaIndicator = MetaIndicator

export function exists(key: MetaIndicatorKey): Pres<boolean> {
  return http
    .generalClient()
    .get('notify', `meta-indicator/${key.topic_id}%26${key.meta_id}/exists/`, {}, 'json')
}

export function inspect(key: MetaIndicatorKey): Pres<MetaIndicator> {
  return http
    .generalClient()
    .get('notify', `meta-indicator/${key.topic_id}%26${key.meta_id}/exists/`, {}, 'json')
}

export function insert(metaIndicator: InsertMetaIndicator): Pres<MetaIndicatorKey> {
  return http
    .generalClient()
    .post('notify', 'meta-indicator/', metaIndicator, 'application/json;charset=UTF-8')
}

export function update(metaIndicator: UpdateMetaIndicator): Pres<null> {
  return http
    .generalClient()
    .patch('notify', 'meta-indicator/', metaIndicator, 'application/json;charset=UTF-8')
}

export function remove(key: MetaIndicatorKey): Pres<null> {
  return http
    .generalClient()
    .del('notify', `meta-indicator/${key.topic_id}%26${key.meta_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<MetaIndicator> {
  return http.generalClient().get(
    'notify',
    'meta-indicator/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTopic(
  topicKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<MetaIndicator> {
  return http.generalClient().get(
    'notify',
    `topic/${topicKey.string_id}/meta-indicator/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function metaMissing(
  notifySettingId: string,
  topicId: string,
  userId: string,
): Pres<MetaIndicator[]> {
  return http.generalClient().get(
    'notify',
    'meta-indicator/meta-missing/',
    {
      'notify-setting-id': notifySettingId,
      'topic-id': topicId,
      'user-id': userId,
    },
    'json',
  )
}
