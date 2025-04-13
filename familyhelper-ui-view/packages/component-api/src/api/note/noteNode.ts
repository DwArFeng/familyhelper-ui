// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

import type { DispNoteBook } from './noteBook'

export type NoteNode = {
  key: LongIdKey
  parent_key: LongIdKey | null
  book_key: LongIdKey | null
  name: string
  remark: string
}

export type DispNoteNode = NoteNode & {
  book: DispNoteBook | null
  root_flag: boolean
  has_no_child: boolean
}

export type NoteNodeCreateInfo = {
  book_key: LongIdKey
  parent_key: LongIdKey | null
  name: string
  remark: string
}

export type NoteNodeUpdateInfo = {
  key: LongIdKey
  parent_key: LongIdKey | null
  name: string
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('note', `note-node/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<NoteNode> {
  return http.generalClient().get('note', `note-node/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<NoteNode> {
  return http.generalClient().get(
    'note',
    'note-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteBook(noteBookKey: LongIdKey, pagingInfo: PagingInfo): Prespa<NoteNode> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-node/`,
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
): Prespa<NoteNode> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-node/root/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParent(parentKey: LongIdKey, pagingInfo: PagingInfo): Prespa<NoteNode> {
  return http.generalClient().get(
    'note',
    `note-node/${parentKey.long_id}/child/`,
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
): Prespa<NoteNode> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-node/name-like/`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispNoteNode> {
  return http.generalClient().get('note', `note-node/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispNoteNode> {
  return http.generalClient().get(
    'note',
    'note-node/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNoteBookDisp(
  noteBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispNoteNode> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-node/disp/`,
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
): Prespa<DispNoteNode> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-node/root/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParentDisp(
  parentKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispNoteNode> {
  return http.generalClient().get(
    'note',
    `note-node/${parentKey.long_id}/child/disp/`,
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
): Prespa<DispNoteNode> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/note-node/name-like/disp/`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nodePathFromRoot(nodeKey: LongIdKey): Prespa<NoteNode> {
  return http
    .generalClient()
    .get('note', `note-node/${nodeKey.long_id}/path-from-root/`, {}, 'json')
}

export function nodePathFromRootDisp(nodeKey: LongIdKey): Prespa<DispNoteNode> {
  return http
    .generalClient()
    .get('note', `note-node/${nodeKey.long_id}/path-from-root/disp/`, {}, 'json')
}

export function itemPathFromRoot(itemKey: LongIdKey): Prespa<NoteNode> {
  return http
    .generalClient()
    .get('note', `note-item/${itemKey.long_id}/path-from-root/`, {}, 'json')
}

export function itemPathFromRootDisp(itemKey: LongIdKey): Prespa<DispNoteNode> {
  return http
    .generalClient()
    .get('note', `note-item/${itemKey.long_id}/path-from-root/disp/`, {}, 'json')
}

export function create(createInfo: NoteNodeCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('note', 'note-node/create/', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: NoteNodeUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-node/update/', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(noteNodeKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-node/remove/', noteNodeKey, 'application/json;charset=UTF-8')
}
