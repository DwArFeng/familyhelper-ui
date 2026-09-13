// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type TaskSettingItemKey, taskSettingItemPathPart } from './common'

export type ExporterInfo = {
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
      `exporter-info/${taskSettingItemPathPart(taskSettingId, identifier)}/exists`,
      {},
      'json',
    )
}

export function get(taskSettingId: string, identifier: string): Pres<ExporterInfo> {
  return http
    .generalClient()
    .get(
      'fileio',
      `exporter-info/${taskSettingItemPathPart(taskSettingId, identifier)}`,
      {},
      'json',
    )
}

export function insert(exporterInfo: ExporterInfo): Pres<TaskSettingItemKey> {
  return http
    .generalClient()
    .post('fileio', 'exporter-info', exporterInfo, 'application/json;charset=UTF-8')
}

export function update(exporterInfo: ExporterInfo): Pres<null> {
  return http
    .generalClient()
    .patch('fileio', 'exporter-info', exporterInfo, 'application/json;charset=UTF-8')
}

export function remove(taskSettingId: string, identifier: string): Pres<null> {
  return http
    .generalClient()
    .del(
      'fileio',
      `exporter-info/${taskSettingItemPathPart(taskSettingId, identifier)}`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<ExporterInfo> {
  return http.generalClient().get(
    'fileio',
    'exporter-info/all',
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
): Prespa<ExporterInfo> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/exporter-info`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
