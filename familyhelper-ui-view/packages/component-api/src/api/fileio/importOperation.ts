// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres } from '../../util/response'

import {
  type MetadataUpsertInfo,
  type TaskCreateInfo,
  type TaskExecuteInfo,
  taskItemPathPart,
} from './common'

export function createTask(taskCreateInfo: TaskCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('fileio', 'import/create-task', taskCreateInfo, 'application/json;charset=UTF-8')
}

export function upsertTaskMetadata(metadataUpsertInfo: MetadataUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'fileio',
      'import/upsert-task-metadata',
      metadataUpsertInfo,
      'application/json;charset=UTF-8',
    )
}

export function upload(taskId: string, identifier: string, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'fileio',
      `import/${taskItemPathPart(taskId, identifier)}/upload`,
      formData,
      'multipart/form-data',
    )
}

export function uploadStream(taskId: string, identifier: string, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'fileio',
      `import/${taskItemPathPart(taskId, identifier)}/upload-stream`,
      formData,
      'multipart/form-data',
    )
}

export function executeTask(taskExecuteInfo: TaskExecuteInfo): Pres<null> {
  return http
    .generalClient()
    .post('fileio', 'import/execute-task', taskExecuteInfo, 'application/json;charset=UTF-8')
}

export function executeTaskAsync(taskExecuteInfo: TaskExecuteInfo): Pres<null> {
  return http
    .generalClient()
    .post('fileio', 'import/execute-task-async', taskExecuteInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(taskId: string, identifier: string): Promise<Blob | null> {
  return http
    .generalClient()
    .get('fileio', `import/${taskItemPathPart(taskId, identifier)}/download-file`, {}, 'blob')
}
