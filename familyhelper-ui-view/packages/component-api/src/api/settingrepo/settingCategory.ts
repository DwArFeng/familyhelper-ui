// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type SettingCategory = {
  key: StringIdKey
  formatter_type: string
  formatter_param: string
  remark: string
}

export type InsertSettingCategory = SettingCategory

export type UpdateSettingCategory = SettingCategory

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `setting-category/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<SettingCategory> {
  return http.generalClient().get('settingrepo', `setting-category/${key.string_id}/`, {}, 'json')
}

export function insert(settingCategory: InsertSettingCategory): Pres<StringIdKey> {
  return http
    .generalClient()
    .post('settingrepo', 'setting-category/', settingCategory, 'application/json;charset=UTF-8')
}

export function update(settingCategory: UpdateSettingCategory): Pres<null> {
  return http
    .generalClient()
    .patch('settingrepo', 'setting-category/', settingCategory, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('settingrepo', `setting-category/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<SettingCategory> {
  return http.generalClient().get(
    'settingrepo',
    'setting-category/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<SettingCategory> {
  return http.generalClient().get(
    'settingrepo',
    'setting-category/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
