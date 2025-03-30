// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

export type Topic = {
  key: StringIdKey
  label: string
  remark: string
  enabled: boolean
  priority: number
}

export type InsertTopic = Topic

export type UpdateTopic = Topic

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('notify', `topic/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey) {
  return http.generalClient().get('notify', `topic/${key.string_id}/`, {}, 'json')
}

export function insert(topic: InsertTopic): Pres<StringIdKey> {
  return http.generalClient().post('notify', 'topic/', topic, 'application/json;charset=UTF-8')
}

export function update(topic: UpdateTopic): Pres<null> {
  return http.generalClient().patch('notify', 'topic/', topic, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('notify', `topic/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Topic> {
  return http.generalClient().get(
    'notify',
    'topic/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function labelLike(pattern: string, pagingInfo: PagingInfo): Prespa<Topic> {
  return http.generalClient().get(
    'notify',
    'topic/label-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
