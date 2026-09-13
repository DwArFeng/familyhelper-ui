// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type TaskSettingItemKey, taskSettingItemPathPart } from './common'

export type ReaderInfo = {
  key: TaskSettingItemKey
  enabled: boolean
  type: string
  param: string
  remark: string
}

export function exists(taskSettingId: string, identifier: string): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'fileio',
      `reader-info/${taskSettingItemPathPart(taskSettingId, identifier)}/exists`,
      {},
      'json',
    )
}

export function get(taskSettingId: string, identifier: string): Pres<ReaderInfo> {
  return http
    .generalClient()
    .get('fileio', `reader-info/${taskSettingItemPathPart(taskSettingId, identifier)}`, {}, 'json')
}

export function insert(readerInfo: ReaderInfo): Pres<TaskSettingItemKey> {
  return http
    .generalClient()
    .post('fileio', 'reader-info', readerInfo, 'application/json;charset=UTF-8')
}

export function update(readerInfo: ReaderInfo): Pres<null> {
  return http
    .generalClient()
    .patch('fileio', 'reader-info', readerInfo, 'application/json;charset=UTF-8')
}

export function remove(taskSettingId: string, identifier: string): Pres<null> {
  return http
    .generalClient()
    .del('fileio', `reader-info/${taskSettingItemPathPart(taskSettingId, identifier)}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ReaderInfo> {
  return http.generalClient().get(
    'fileio',
    'reader-info/all',
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
): Prespa<ReaderInfo> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/reader-info`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
