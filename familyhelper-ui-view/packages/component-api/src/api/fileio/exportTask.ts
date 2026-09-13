// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type DispAccount } from '../system/account'

import { type ExportTaskStatus } from './common'

export type ExportTask = {
  key: LongIdKey
  setting_key: LongIdKey
  userKey: StringIdKey
  status: ExportTaskStatus
  create_date: number
  start_date: number
  end_date: number
  duration: number | null
  data_count: number
  message: string
  should_dead_date: number
  last_beat_date: number
}

export type DispExportTask = {
  key: LongIdKey
  setting_key: LongIdKey
  userKey: StringIdKey
  status: ExportTaskStatus
  create_date: number
  start_date: number
  end_date: number
  duration: number | null
  data_count: number
  message: string
  should_dead_date: number
  last_beat_date: number
  account: DispAccount
}

export function exists(id: string): Pres<boolean> {
  return http.generalClient().get('fileio', `export-task/${id}/exists`, {}, 'json')
}

export function get(id: string): Pres<ExportTask> {
  return http.generalClient().get('fileio', `export-task/${id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ExportTask> {
  return http.generalClient().get(
    'fileio',
    'export-task/all',
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
): Prespa<ExportTask> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/export-task`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function createDateDesc(pagingInfo: PagingInfo): Prespa<ExportTask> {
  return http.generalClient().get(
    'fileio',
    'export-task/create-date-desc',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForUser(userKey: StringIdKey, pagingInfo: PagingInfo): Prespa<ExportTask> {
  return http.generalClient().get(
    'fileio',
    `user/${encodeURIComponent(userKey.string_id)}/export-task`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForMe(pagingInfo: PagingInfo): Prespa<ExportTask> {
  return http.generalClient().get(
    'fileio',
    'me/export-task',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(id: string): Pres<DispExportTask> {
  return http.generalClient().get('fileio', `export-task/${id}/disp`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispExportTask> {
  return http.generalClient().get(
    'fileio',
    'export-task/all/disp',
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
): Prespa<DispExportTask> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/export-task/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function createDateDescDisp(pagingInfo: PagingInfo): Prespa<DispExportTask> {
  return http.generalClient().get(
    'fileio',
    'export-task/create-date-desc/disp',
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
): Prespa<DispExportTask> {
  return http.generalClient().get(
    'fileio',
    `user/${encodeURIComponent(userKey.string_id)}/export-task/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForMeDisp(pagingInfo: PagingInfo): Prespa<DispExportTask> {
  return http.generalClient().get(
    'fileio',
    'me/export-task/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
