// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

export type AttachmentFileInfo = {
  key: LongIdKey
  note_item_key: LongIdKey | null
  origin_name: string
  length: number
  created_date: number
  modified_date: number
  inspected_date: number
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('note', `attachment-file/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<AttachmentFileInfo> {
  return http.generalClient().get('note', `attachment-file/${key.long_id}/`, {}, 'json')
}

export function childForNoteItem(
  noteItemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<AttachmentFileInfo> {
  return http.generalClient().get(
    'note',
    `note-item/${noteItemKey.long_id}/attachment-file/default/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteItemInspectedDateDesc(
  noteItemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<AttachmentFileInfo> {
  return http.generalClient().get(
    'note',
    `note-item/${noteItemKey.long_id}/attachment-file/inspected-date-desc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteItemModifiedDateDesc(
  noteItemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<AttachmentFileInfo> {
  return http.generalClient().get(
    'note',
    `note-item/${noteItemKey.long_id}/attachment-file/modified-date-desc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteItemOriginNameAsc(
  noteItemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<AttachmentFileInfo> {
  return http.generalClient().get(
    'note',
    `note-item/${noteItemKey.long_id}/attachment-file/origin-name-asc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteItemCreatedDateAsc(
  noteItemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<AttachmentFileInfo> {
  return http.generalClient().get(
    'note',
    `note-item/${noteItemKey.long_id}/attachment-file/created-date-asc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function download(attachmentFileKey: LongIdKey): Promise<Blob> {
  return http
    .generalClient()
    .get('note', `attachment-file/${attachmentFileKey.long_id}/download/`, {}, 'blob')
}

export function upload(noteItemKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'note',
      `note-item/${noteItemKey.long_id}/attachment-file/upload/`,
      formData,
      'multipart/form-data',
    )
}

export function update(attachmentFileKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'note',
      `/attachment-file/${attachmentFileKey.long_id}/update/`,
      formData,
      'multipart/form-data',
    )
}

export function remove(attachmentFileKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('note', 'attachment-file/remove/', attachmentFileKey, 'application/json;charset=UTF-8')
}
