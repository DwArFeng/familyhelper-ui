// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type TaskItemKey, taskItemPathPart } from './common'

export type ExportFileInfo = {
  key: TaskItemKey
  origin_name: string
  length: number
  generated_date: number
  remark: string
}

export function exists(taskId: string, identifier: string): Pres<boolean> {
  return http
    .generalClient()
    .get('fileio', `export-file/${taskItemPathPart(taskId, identifier)}/exists`, {}, 'json')
}

export function get(taskId: string, identifier: string): Pres<ExportFileInfo> {
  return http
    .generalClient()
    .get('fileio', `export-file/${taskItemPathPart(taskId, identifier)}`, {}, 'json')
}

export function remove(taskId: string, identifier: string): Pres<null> {
  return http
    .generalClient()
    .del('fileio', `export-file/${taskItemPathPart(taskId, identifier)}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ExportFileInfo> {
  return http.generalClient().get(
    'fileio',
    'export-file/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTask(taskKey: LongIdKey, pagingInfo: PagingInfo): Prespa<ExportFileInfo> {
  return http.generalClient().get(
    'fileio',
    `task/${taskKey.long_id}/export-file`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function downloadFile(taskId: string, identifier: string): Promise<Blob | null> {
  return http
    .generalClient()
    .get('fileio', `export-file/${taskItemPathPart(taskId, identifier)}/download-file`, {}, 'blob')
}

export function requestFileStreamVoucher(taskId: string, identifier: string): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'fileio',
      `export-file/${taskItemPathPart(taskId, identifier)}/request-file-stream-voucher`,
      {},
      'application/json;charset=UTF-8',
    )
}
