// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type MessageAttachmentInfo = {
  key: LongIdKey
  message_key: LongIdKey
  origin_name: string
  length: number
  upload_date: number
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('clannad', `message-attachment/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<MessageAttachmentInfo> {
  return http.generalClient().get('clannad', `message-attachment/${key.long_id}/`, {}, 'json')
}

export function childForMessage(
  messageKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<MessageAttachmentInfo> {
  return http.generalClient().get(
    'clannad',
    `message/${messageKey.long_id}/message-attachment/default/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForMessageOriginNameAsc(
  messageKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<MessageAttachmentInfo> {
  return http.generalClient().get(
    'clannad',
    `message/${messageKey.long_id}/message-attachment/origin-name-asc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForMessageUploadDateDesc(
  messageKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<MessageAttachmentInfo> {
  return http.generalClient().get(
    'clannad',
    `message/${messageKey.long_id}/message-attachment/upload-date-desc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function download(key: LongIdKey): Promise<Blob> {
  return http
    .generalClient()
    .get('clannad', `message-attachment/${key.long_id}/download/`, {}, 'blob')
}

export function requestMessageAttachmentStreamVoucher(
  messageAttachmentKey: LongIdKey,
): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'clannad',
      `message-attachment/${messageAttachmentKey.long_id}/request-message-attachment-stream-voucher/`,
      {},
      'application/json;charset=UTF-8',
    )
}

export function upload(messageKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'clannad',
      `message/${messageKey.long_id}/message-attachment/upload/`,
      formData,
      'multipart/form-data',
    )
}

export function uploadStream(messageKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'clannad',
      `message/${messageKey.long_id}/message-attachment/upload-stream/`,
      formData,
      'multipart/form-data',
    )
}

export function update(messageAttachmentKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'clannad',
      `/message-attachment/${messageAttachmentKey.long_id}/update/`,
      formData,
      'multipart/form-data',
    )
}

export function updateStream(messageAttachmentKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'clannad',
      `/message-attachment/${messageAttachmentKey.long_id}/update-stream/`,
      formData,
      'multipart/form-data',
    )
}

export function remove(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'message-attachment/remove/', key, 'application/json;charset=UTF-8')
}
