// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type TaskItemKey, taskItemPathPart } from './common'

export type ImportMetadata = {
  key: TaskItemKey
  content: string
  remark: string
}

export function exists(taskId: string, identifier: string): Pres<boolean> {
  return http
    .generalClient()
    .get('fileio', `import-metadata/${taskItemPathPart(taskId, identifier)}/exists`, {}, 'json')
}

export function get(taskId: string, identifier: string): Pres<ImportMetadata> {
  return http
    .generalClient()
    .get('fileio', `import-metadata/${taskItemPathPart(taskId, identifier)}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ImportMetadata> {
  return http.generalClient().get(
    'fileio',
    'import-metadata/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTask(taskKey: LongIdKey, pagingInfo: PagingInfo): Prespa<ImportMetadata> {
  return http.generalClient().get(
    'fileio',
    `task/${taskKey.long_id}/import-metadata`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
