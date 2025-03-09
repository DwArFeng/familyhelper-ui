// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

export type NicknameKey = {
  subject_user_id: string
  object_user_id: string
}

export type Nickname = {
  key: NicknameKey
  call: string
  remark: string
}

export type InsertNickname = Nickname

export type UpdateNickname = Nickname

export function exists(key: NicknameKey): Pres<boolean> {
  return http
    .generalClient()
    .get('clannad', `nickname/${key.subject_user_id}%26${key.object_user_id}/exists/`, {}, 'json')
}

export function inspect(key: NicknameKey): Pres<Nickname> {
  return http
    .generalClient()
    .get('clannad', `nickname/${key.subject_user_id}%26${key.object_user_id}/`, {}, 'json')
}

export function insert(nickname: InsertNickname): Pres<NicknameKey> {
  return http
    .generalClient()
    .post('clannad', 'nickname/', nickname, 'application/json;charset=UTF-8')
}

export function update(nickname: UpdateNickname): Pres<null> {
  return http
    .generalClient()
    .patch('clannad', 'nickname/', nickname, 'application/json;charset=UTF-8')
}

export function remove(key: NicknameKey): Pres<null> {
  return http
    .generalClient()
    .del('clannad', `nickname/${key.subject_user_id}%26${key.object_user_id}/`, {}, 'json')
}

export function childForSubjectUser(
  subjectUserKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Nickname> {
  return http.generalClient().get(
    'clannad',
    `user/subject/${subjectUserKey.string_id}/nickname/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
