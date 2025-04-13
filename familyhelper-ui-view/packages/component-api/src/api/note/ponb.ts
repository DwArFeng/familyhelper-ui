// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

import type { DispNoteBook } from './noteBook'
import type { DispAccount } from '../system/account'

export type PonbPermissionLevelOwner = 0
export type PonbPermissionLevelGuest = 1

export type PonbPermissionLevel = PonbPermissionLevelOwner | PonbPermissionLevelGuest

export type PonbKey = {
  note_book_long_id: number
  user_string_id: string
}

export type Ponb = {
  key: PonbKey
  permission_level: PonbPermissionLevel
  remark: string
}

export type DispPonb = Ponb & {
  note_book: DispNoteBook
  account: DispAccount
}

export function exists(key: PonbKey): Pres<boolean> {
  return http
    .generalClient()
    .get('note', `ponb/${key.note_book_long_id}%26${key.user_string_id}/exists/`, {}, 'json')
}

export function inspect(key: PonbKey): Pres<Ponb> {
  return http
    .generalClient()
    .get('note', `ponb/${key.note_book_long_id}%26${key.user_string_id}/`, {}, 'json')
}

export function inspectDisp(key: PonbKey): Pres<DispPonb> {
  return http
    .generalClient()
    .get('note', `ponb/${key.note_book_long_id}%26${key.user_string_id}/disp/`, {}, 'json')
}

export function childForNoteBook(noteBookKey: LongIdKey, pagingInfo: PagingInfo): Prespa<Ponb> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/ponb/`,
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
): Prespa<DispPonb> {
  return http.generalClient().get(
    'note',
    `note-book/${noteBookKey.long_id}/ponb/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
