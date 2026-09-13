// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import {
  type ImportTemplateInfo,
  type TaskSettingItemKey,
  taskSettingItemPathPart,
  type TemplateCreateInfo,
  type TemplateRemoveInfo,
} from './common'

export type { ImportTemplateInfo, TemplateCreateInfo, TemplateRemoveInfo, TaskSettingItemKey }

export function exists(taskSettingId: string, identifier: string): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'fileio',
      `import-template/${taskSettingItemPathPart(taskSettingId, identifier)}/exists`,
      {},
      'json',
    )
}

export function get(taskSettingId: string, identifier: string): Pres<ImportTemplateInfo> {
  return http
    .generalClient()
    .get(
      'fileio',
      `import-template/${taskSettingItemPathPart(taskSettingId, identifier)}`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<ImportTemplateInfo> {
  return http.generalClient().get(
    'fileio',
    'import-template/all',
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
): Prespa<ImportTemplateInfo> {
  return http.generalClient().get(
    'fileio',
    `task-setting/${taskSettingKey.long_id}/import-template`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(templateCreateInfo: TemplateCreateInfo): Pres<TaskSettingItemKey> {
  return http
    .generalClient()
    .post('fileio', 'import-template/create', templateCreateInfo, 'application/json;charset=UTF-8')
}

export function remove(templateRemoveInfo: TemplateRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('fileio', 'import-template/remove', templateRemoveInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(taskSettingId: string, identifier: string): Promise<Blob | null> {
  return http
    .generalClient()
    .get(
      'fileio',
      `import-template/${taskSettingItemPathPart(taskSettingId, identifier)}/download-file`,
      {},
      'blob',
    )
}

export function requestStreamVoucher(taskSettingId: string, identifier: string): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'fileio',
      `import-template/${taskSettingItemPathPart(taskSettingId, identifier)}/request-stream-voucher`,
      {},
      'application/json;charset=UTF-8',
    )
}

export function upload(taskSettingId: string, identifier: string, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'fileio',
      `import-template/${taskSettingItemPathPart(taskSettingId, identifier)}/upload`,
      formData,
      'multipart/form-data',
    )
}

export function uploadStream(
  taskSettingId: string,
  identifier: string,
  formData: FormData,
): Pres<null> {
  return http
    .generalClient()
    .post(
      'fileio',
      `import-template/${taskSettingItemPathPart(taskSettingId, identifier)}/upload-stream`,
      formData,
      'multipart/form-data',
    )
}
