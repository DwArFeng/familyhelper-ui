// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type TaskItemKey, taskItemPathPart } from './common'

export type ImportFileInfo = {
  key: TaskItemKey
  origin_name: string
  length: number
  uploaded_date: number
  remark: string
}

export function exists(taskId: string, identifier: string): Pres<boolean> {
  return http
    .generalClient()
    .get('fileio', `import-file/${taskItemPathPart(taskId, identifier)}/exists`, {}, 'json')
}

export function get(taskId: string, identifier: string): Pres<ImportFileInfo> {
  return http
    .generalClient()
    .get('fileio', `import-file/${taskItemPathPart(taskId, identifier)}`, {}, 'json')
}

export function remove(taskId: string, identifier: string): Pres<null> {
  return http
    .generalClient()
    .del('fileio', `import-file/${taskItemPathPart(taskId, identifier)}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ImportFileInfo> {
  return http.generalClient().get(
    'fileio',
    'import-file/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTask(taskKey: LongIdKey, pagingInfo: PagingInfo): Prespa<ImportFileInfo> {
  return http.generalClient().get(
    'fileio',
    `task/${taskKey.long_id}/import-file`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function requestFileStreamVoucher(taskId: string, identifier: string): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'fileio',
      `import-file/${taskItemPathPart(taskId, identifier)}/request-file-stream-voucher`,
      {},
      'application/json;charset=UTF-8',
    )
}
