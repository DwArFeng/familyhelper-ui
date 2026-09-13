// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type TaskSettingItemKey, taskSettingItemPathPart } from './common'

export type ImportConf = {
  key: TaskSettingItemKey
  content: string
  remark: string
}

export function exists(taskSettingId: string, identifier: string): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'fileio',
      `import-conf/${taskSettingItemPathPart(taskSettingId, identifier)}/exists`,
      {},
      'json',
    )
}

export function get(taskSettingId: string, identifier: string): Pres<ImportConf> {
  return http
    .generalClient()
    .get('fileio', `import-conf/${taskSettingItemPathPart(taskSettingId, identifier)}`, {}, 'json')
}

export function insert(importConf: ImportConf): Pres<TaskSettingItemKey> {
  return http
    .generalClient()
    .post('fileio', 'import-conf', importConf, 'application/json;charset=UTF-8')
}

export function update(importConf: ImportConf): Pres<null> {
  return http
    .generalClient()
    .patch('fileio', 'import-conf', importConf, 'application/json;charset=UTF-8')
}

export function remove(taskSettingId: string, identifier: string): Pres<null> {
  return http
    .generalClient()
    .del('fileio', `import-conf/${taskSettingItemPathPart(taskSettingId, identifier)}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ImportConf> {
  return http.generalClient().get(
    'fileio',
    'import-conf/all',
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
): Prespa<ImportConf> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/import-conf`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
