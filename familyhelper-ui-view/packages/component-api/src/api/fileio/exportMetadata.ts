// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type TaskItemKey, taskItemPathPart } from './common'

export type ExportMetadata = {
  key: TaskItemKey
  content: string
  remark: string
}

export function exists(taskId: string, identifier: string): Pres<boolean> {
  return http
    .generalClient()
    .get('fileio', `export-metadata/${taskItemPathPart(taskId, identifier)}/exists`, {}, 'json')
}

export function get(taskId: string, identifier: string): Pres<ExportMetadata> {
  return http
    .generalClient()
    .get('fileio', `export-metadata/${taskItemPathPart(taskId, identifier)}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ExportMetadata> {
  return http.generalClient().get(
    'fileio',
    'export-metadata/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTask(taskKey: LongIdKey, pagingInfo: PagingInfo): Prespa<ExportMetadata> {
  return http.generalClient().get(
    'fileio',
    `task/${taskKey.long_id}/export-metadata`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
