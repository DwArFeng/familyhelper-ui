// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'
import { Message } from './message'

export type MessageBodyInfo = {
  key: LongIdKey
  length: number
  upload_date: number
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('clannad', `message-body/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<Message> {
  return http.generalClient().get('clannad', `message-body/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<MessageBodyInfo> {
  return http.generalClient().get(
    'clannad',
    'message-body/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function download(key: LongIdKey): Promise<Blob> {
  return http.generalClient().get('clannad', `message-body/${key.long_id}/download/`, {}, 'blob')
}

export function update(key: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('clannad', `message-body/${key.long_id}/update/`, formData, 'multipart/form-data')
}
