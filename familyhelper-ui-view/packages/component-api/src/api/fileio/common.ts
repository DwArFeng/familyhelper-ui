// noinspection JSUnusedGlobalSymbols

import { type LongIdKey, type StringIdKey } from '../subgrade/key'

export type ImportTaskStatusCreated = 0
export type ImportTaskStatusProcessing = 1
export type ImportTaskStatusFinished = 2
export type ImportTaskStatusFailed = 3
export type ImportTaskStatusExpired = 4
export type ImportTaskStatusDead = 5

export type ImportTaskStatus =
  | ImportTaskStatusCreated
  | ImportTaskStatusProcessing
  | ImportTaskStatusFinished
  | ImportTaskStatusFailed
  | ImportTaskStatusExpired
  | ImportTaskStatusDead

export type ExportTaskStatusCreated = 0
export type ExportTaskStatusProcessing = 1
export type ExportTaskStatusFinished = 2
export type ExportTaskStatusFailed = 3
export type ExportTaskStatusExpired = 4
export type ExportTaskStatusDead = 5

export type ExportTaskStatus =
  | ExportTaskStatusCreated
  | ExportTaskStatusProcessing
  | ExportTaskStatusFinished
  | ExportTaskStatusFailed
  | ExportTaskStatusExpired
  | ExportTaskStatusDead

export type TaskSettingItemKey = {
  task_setting_id: string
  identifier: string
}

export type TaskItemKey = {
  task_id: string
  identifier: string
}

export type TaskCreateInfo = {
  setting_key: LongIdKey
  user_key: StringIdKey | null
  message: string | null
}

export type MetadataUpsertInfo = {
  key: TaskItemKey
  content: string | null
}

export type TaskStartInfo = {
  task_key: LongIdKey
  message: string | null
}

export type TaskExecuteInfo = TaskStartInfo

export type TemplateCreateInfo = {
  task_setting_key: LongIdKey | null
  identifier: string
  origin_name: string | null
}

export type TemplateRemoveInfo = {
  key: TaskSettingItemKey
}

export type ImportTemplateInfo = {
  key: TaskSettingItemKey
  origin_name: string
  length: number
  uploaded_date: number
  remark: string
}

export type ExportTemplateInfo = {
  key: TaskSettingItemKey
  origin_name: string
  length: number
  uploaded_date: number
  remark: string
}

export function taskSettingItemPathPart(taskSettingId: string, identifier: string): string {
  return `${taskSettingId}%26${encodeURIComponent(identifier)}`
}

export function taskItemPathPart(taskId: string, identifier: string): string {
  return `${taskId}%26${encodeURIComponent(identifier)}`
}
