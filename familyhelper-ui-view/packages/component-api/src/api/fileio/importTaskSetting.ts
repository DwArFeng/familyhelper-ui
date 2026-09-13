// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type ImportTaskSetting = {
  key: LongIdKey
  enabled: boolean
  name: string
  remark: string
}

export function exists(id: string): Pres<boolean> {
  return http.generalClient().get('fileio', `import-task-setting/${id}/exists`, {}, 'json')
}

export function get(id: string): Pres<ImportTaskSetting> {
  return http.generalClient().get('fileio', `import-task-setting/${id}`, {}, 'json')
}

export function insert(importTaskSetting: ImportTaskSetting): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('fileio', 'import-task-setting', importTaskSetting, 'application/json;charset=UTF-8')
}

export function update(importTaskSetting: ImportTaskSetting): Pres<null> {
  return http
    .generalClient()
    .patch('fileio', 'import-task-setting', importTaskSetting, 'application/json;charset=UTF-8')
}

export function remove(id: string): Pres<null> {
  return http.generalClient().del('fileio', `import-task-setting/${id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ImportTaskSetting> {
  return http.generalClient().get(
    'fileio',
    'import-task-setting/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
