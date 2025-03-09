// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { PagingInfo } from '../../util/request'
import type { Pres, Prespa } from '../../util/response'

export type ProfileIndicatorKey = {
  category_id: string
  string_id: string
}

export type ProfileIndicator = {
  key: ProfileIndicatorKey
  label: string
  remark: string
}

export type InsertProfileIndicator = ProfileIndicator

export type UpdateProfileIndicator = ProfileIndicator

export function exists(key: ProfileIndicatorKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'clannad',
      `profile-type-indicator/${key.category_id}%26${key.string_id}/exists/`,
      {},
      'json',
    )
}

export function inspect(key: ProfileIndicatorKey): Pres<ProfileIndicator> {
  return http
    .generalClient()
    .get('clannad', `profile-type-indicator/${key.category_id}%26${key.string_id}/`, {}, 'json')
}

export function insert(profileIndicator: InsertProfileIndicator): Pres<ProfileIndicatorKey> {
  return http
    .generalClient()
    .post('clannad', 'profile-type-indicator/', profileIndicator, 'application/json;charset=UTF-8')
}

export function update(profileIndicator: UpdateProfileIndicator): Pres<null> {
  return http
    .generalClient()
    .patch('clannad', 'profile-type-indicator/', profileIndicator, 'application/json;charset=UTF-8')
}

export function remove(key: ProfileIndicatorKey): Pres<null> {
  return http
    .generalClient()
    .del('clannad', `profile-type-indicator/${key.category_id}%26${key.string_id}/`, {}, 'json')
}

export function childForCategory(
  category: string,
  pagingInfo: PagingInfo,
): Prespa<ProfileIndicator> {
  return http.generalClient().get(
    'clannad',
    'profile-type-indicator/child-for-category/',
    {
      category,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
