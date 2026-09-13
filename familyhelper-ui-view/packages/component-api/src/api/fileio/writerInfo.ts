// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type TaskSettingItemKey, taskSettingItemPathPart } from './common'

export type WriterInfo = {
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
      `writer-info/${taskSettingItemPathPart(taskSettingId, identifier)}/exists`,
      {},
      'json',
    )
}

export function get(taskSettingId: string, identifier: string): Pres<WriterInfo> {
  return http
    .generalClient()
    .get('fileio', `writer-info/${taskSettingItemPathPart(taskSettingId, identifier)}`, {}, 'json')
}

export function insert(writerInfo: WriterInfo): Pres<TaskSettingItemKey> {
  return http
    .generalClient()
    .post('fileio', 'writer-info', writerInfo, 'application/json;charset=UTF-8')
}

export function update(writerInfo: WriterInfo): Pres<null> {
  return http
    .generalClient()
    .patch('fileio', 'writer-info', writerInfo, 'application/json;charset=UTF-8')
}

export function remove(taskSettingId: string, identifier: string): Pres<null> {
  return http
    .generalClient()
    .del('fileio', `writer-info/${taskSettingItemPathPart(taskSettingId, identifier)}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<WriterInfo> {
  return http.generalClient().get(
    'fileio',
    'writer-info/all',
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
): Prespa<WriterInfo> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/writer-info`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
