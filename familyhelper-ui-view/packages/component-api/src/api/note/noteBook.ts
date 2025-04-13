// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey, StringIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

import type { PonbPermissionLevel } from './ponb'
import type { DispAccount } from '../system/account'

export type NoteBook = {
  key: LongIdKey
  name: string
  remark: string
  created_date: number
  item_count: number
  last_modified_date: number
  last_inspected_date: number
}

export type DispNoteBook = NoteBook & {
  owner_account: DispAccount | null
  permission_level: PonbPermissionLevel | null
  favorite: boolean
}

export type NoteBookCreateInfo = {
  name: string
  remark: string
  favorite: boolean
}

export type NoteBookUpdateInfo = {
  note_book_key: LongIdKey
  name: string
  remark: string
  favorite: boolean
}

export type NoteBookPermissionUpsertInfo = {
  note_book_key: LongIdKey
  user_key: StringIdKey
  permission_level: PonbPermissionLevel
}

export type NoteBookPermissionRemoveInfo = {
  note_book_key: LongIdKey
  user_key: StringIdKey
}

export type NoteBookFavoredChangeInfo = {
  note_book_key: LongIdKey
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('note', `note-book/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<NoteBook> {
  return http.generalClient().get('note', `note-book/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<NoteBook> {
  return http.generalClient().get(
    'note',
    'note-book/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function userOwned(pagingInfo: PagingInfo): Prespa<NoteBook> {
  return http.generalClient().get(
    'note',
    'note-book/user-owned/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function userPermittedWithConditionDisplay(
  pattern: string,
  onlyFavored: boolean,
  pagingInfo: PagingInfo,
): Prespa<NoteBook> {
  return http.generalClient().get(
    'note',
    'note-book/user-permitted-with-condition-display/',
    {
      pattern,
      'only-favored': onlyFavored,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function userOwnedWithConditionDisplay(
  pattern: string,
  onlyFavored: boolean,
  pagingInfo: PagingInfo,
): Prespa<NoteBook> {
  return http.generalClient().get(
    'note',
    'note-book/user-owned-with-condition-display/',
    {
      pattern,
      'only-favored': onlyFavored,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispNoteBook> {
  return http.generalClient().get('note', `note-book/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispNoteBook> {
  return http.generalClient().get(
    'note',
    'note-book/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function userOwnedDisp(pagingInfo: PagingInfo): Prespa<DispNoteBook> {
  return http.generalClient().get(
    'note',
    'note-book/user-owned/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function userPermittedWithConditionDisplayDisp(
  pattern: string,
  onlyFavored: boolean,
  pagingInfo: PagingInfo,
): Prespa<DispNoteBook> {
  return http.generalClient().get(
    'note',
    'note-book/user-permitted-with-condition-display/disp/',
    {
      pattern,
      'only-favored': onlyFavored,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function userOwnedWithConditionDisplayDisp(
  pattern: string,
  onlyFavored: boolean,
  pagingInfo: PagingInfo,
): Prespa<DispNoteBook> {
  return http.generalClient().get(
    'note',
    'note-book/user-owned-with-condition-display/disp/',
    {
      pattern,
      'only-favored': onlyFavored,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: NoteBookCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('note', 'note-book/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: NoteBookUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-book/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(noteBookKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-book/remove', noteBookKey, 'application/json;charset=UTF-8')
}

export function upsertPermission(upsertInfo: NoteBookPermissionUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-book/upsert-permission', upsertInfo, 'application/json;charset=UTF-8')
}

export function removePermission(removeInfo: NoteBookPermissionRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-book/remove-permission', removeInfo, 'application/json;charset=UTF-8')
}

export function changeFavored(changeInfo: NoteBookFavoredChangeInfo): Pres<null> {
  return http
    .generalClient()
    .post('note', 'note-book/change-favored', changeInfo, 'application/json;charset=UTF-8')
}
