// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type DispAccount } from '../system/account'

import { type ImportTaskStatus } from './common'

export type ImportTask = {
  key: LongIdKey
  setting_key: LongIdKey
  userKey: StringIdKey
  status: ImportTaskStatus
  create_date: number
  start_date: number
  end_date: number
  duration: number | null
  data_count: number
  message: string
  should_expire_date: number
  should_dead_date: number
}

export type DispImportTask = {
  key: LongIdKey
  setting_key: LongIdKey
  userKey: StringIdKey
  status: ImportTaskStatus
  create_date: number
  start_date: number
  end_date: number
  duration: number | null
  data_count: number
  message: string
  should_expire_date: number
  should_dead_date: number
  account: DispAccount
}

export function exists(id: string): Pres<boolean> {
  return http.generalClient().get('fileio', `import-task/${id}/exists`, {}, 'json')
}

export function get(id: string): Pres<ImportTask> {
  return http.generalClient().get('fileio', `import-task/${id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ImportTask> {
  return http.generalClient().get(
    'fileio',
    'import-task/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTaskSetting(
  taskSettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<ImportTask> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/import-task`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function createDateDesc(pagingInfo: PagingInfo): Prespa<ImportTask> {
  return http.generalClient().get(
    'fileio',
    'import-task/create-date-desc',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForUser(userKey: StringIdKey, pagingInfo: PagingInfo): Prespa<ImportTask> {
  return http.generalClient().get(
    'fileio',
    `import-task/user/${encodeURIComponent(userKey.string_id)}`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForMe(pagingInfo: PagingInfo): Prespa<ImportTask> {
  return http.generalClient().get(
    'fileio',
    'me/import-task',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(id: string): Pres<DispImportTask> {
  return http.generalClient().get('fileio', `import-task/${id}/disp`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispImportTask> {
  return http.generalClient().get(
    'fileio',
    'import-task/all/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTaskSettingDisp(
  taskSettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispImportTask> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/import-task/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function createDateDescDisp(pagingInfo: PagingInfo): Prespa<DispImportTask> {
  return http.generalClient().get(
    'fileio',
    'import-task/create-date-desc/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForUserDisp(
  userKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispImportTask> {
  return http.generalClient().get(
    'fileio',
    `import-task/user/${encodeURIComponent(userKey.string_id)}/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForMeDisp(pagingInfo: PagingInfo): Prespa<DispImportTask> {
  return http.generalClient().get(
    'fileio',
    'me/import-task/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
