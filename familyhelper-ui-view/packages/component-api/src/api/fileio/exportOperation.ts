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
    .post('fileio', 'export/create-task', taskCreateInfo, 'application/json;charset=UTF-8')
}

export function upsertTaskMetadata(metadataUpsertInfo: MetadataUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'fileio',
      'export/upsert-task-metadata',
      metadataUpsertInfo,
      'application/json;charset=UTF-8',
    )
}

export function executeTask(taskExecuteInfo: TaskExecuteInfo): Pres<null> {
  return http
    .generalClient()
    .post('fileio', 'export/execute-task', taskExecuteInfo, 'application/json;charset=UTF-8')
}

export function executeTaskAsync(taskExecuteInfo: TaskExecuteInfo): Pres<null> {
  return http
    .generalClient()
    .post('fileio', 'export/execute-task-async', taskExecuteInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(taskId: string, identifier: string): Promise<Blob | null> {
  return http
    .generalClient()
    .get('fileio', `export/${taskItemPathPart(taskId, identifier)}/download-file`, {}, 'blob')
}
