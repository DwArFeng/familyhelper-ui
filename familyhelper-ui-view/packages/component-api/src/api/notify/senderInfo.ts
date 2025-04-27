// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type SenderInfoKey = {
  notify_setting_id: string
  topic_id: string
}

export type SenderInfo = {
  key: SenderInfoKey
  label: string
  type: string
  param: string
  remark: string
}

export type InsertSenderInfo = SenderInfo

export type UpdateSenderInfo = SenderInfo

export function exists(key: SenderInfoKey): Pres<boolean> {
  return http
    .generalClient()
    .get('notify', `sender-info/${key.notify_setting_id}%26${key.topic_id}/exists/`, {}, 'json')
}

export function inspect(key: SenderInfoKey): Pres<SenderInfo> {
  return http
    .generalClient()
    .get('notify', `sender-info/${key.notify_setting_id}%26${key.topic_id}/`, {}, 'json')
}

export function insert(senderInfo: InsertSenderInfo): Pres<SenderInfoKey> {
  return http
    .generalClient()
    .post('notify', 'sender-info/', senderInfo, 'application/json;charset=UTF-8')
}

export function update(senderInfo: UpdateSenderInfo): Pres<null> {
  return http
    .generalClient()
    .patch('notify', 'sender-info/', senderInfo, 'application/json;charset=UTF-8')
}

export function remove(key: SenderInfoKey): Pres<null> {
  return http
    .generalClient()
    .del('notify', `sender-info/${key.notify_setting_id}%26${key.topic_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<SenderInfo> {
  return http.generalClient().get(
    'notify',
    'sender-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
