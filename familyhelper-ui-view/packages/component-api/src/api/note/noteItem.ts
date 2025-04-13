// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

import type { DispNoteBook } from './noteBook'
import type { DispNoteNode } from './noteNode'

export type NoteItem = {
  key: LongIdKey
  node_key: LongIdKey | null
  book_key: LongIdKey | null
  name: string
  remark: string
  length: number
  created_date: number
  modified_date: number
  inspected_date: number
  index: number
}

export type DispNoteItem = NoteItem & {
  book: DispNoteBook | null
  node: DispNoteNode | null
}

export type NoteItemCreateInfo = {
  book_key: LongIdKey
  node_key: LongIdKey | null
  name: string
  remark: string
}

export type NoteItemUpdateInfo = {
  key: LongIdKey
  node_key: LongIdKey | null
  name: string
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('note', `note-item/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<NoteItem> {
  return http.generalClient().get('note', `note-item/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<NoteItem> {
  return http.generalClient().get(
    'note',
    'note-item/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteNode(noteNodeKey: LongIdKey, pagingInfo: PagingInfo): Prespa<NoteItem> {
  return http.generalClient().get(
    'note',
    `note-node/${noteNodeKey.long_id}/note-item/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteBookRoot(
  noteBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<NoteItem> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-item/root/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteBookNameLike(
  noteBookKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<NoteItem> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-item/name-like/`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispNoteItem> {
  return http.generalClient().get('note', `note-item/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispNoteItem> {
  return http.generalClient().get(
    'note',
    'note-item/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteNodeDisp(
  noteNodeKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispNoteItem> {
  return http.generalClient().get(
    'note',
    `note-node/${noteNodeKey.long_id}/note-item/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteBookRootDisp(
  noteBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispNoteItem> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-item/root/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteBookNameLikeDisp(
  noteBookKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispNoteItem> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-item/name-like/disp/`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: NoteItemCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('note', 'note-item/create/', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: NoteItemUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-item/update/', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(noteItemKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-item/remove/', noteItemKey, 'application/json;charset=UTF-8')
}

export function downloadNoteFile(noteItemKey: LongIdKey): Promise<Blob> {
  return http
    .generalClient()
    .get('note', `note-item/${noteItemKey.long_id}/download-note-file/`, {}, 'blob')
}

export function uploadNoteFile(noteItemKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'note',
      `note-item/${noteItemKey.long_id}/upload-note-file/`,
      formData,
      'multipart/form-data',
    )
}
