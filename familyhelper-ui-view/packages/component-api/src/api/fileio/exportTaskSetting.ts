// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type ExportTaskSetting = {
  key: LongIdKey
  enabled: boolean
  name: string
  remark: string
}

export function exists(id: string): Pres<boolean> {
  return http.generalClient().get('fileio', `export-task-setting/${id}/exists`, {}, 'json')
}

export function get(id: string): Pres<ExportTaskSetting> {
  return http.generalClient().get('fileio', `export-task-setting/${id}`, {}, 'json')
}

export function insert(exportTaskSetting: ExportTaskSetting): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('fileio', 'export-task-setting', exportTaskSetting, 'application/json;charset=UTF-8')
}

export function update(exportTaskSetting: ExportTaskSetting): Pres<null> {
  return http
    .generalClient()
    .patch('fileio', 'export-task-setting', exportTaskSetting, 'application/json;charset=UTF-8')
}

export function remove(id: string): Pres<null> {
  return http.generalClient().del('fileio', `export-task-setting/${id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ExportTaskSetting> {
  return http.generalClient().get(
    'fileio',
    'export-task-setting/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
