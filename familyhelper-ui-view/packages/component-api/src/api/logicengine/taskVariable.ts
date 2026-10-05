// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Task } from './task'

export type TaskVariableValueTypeString = 0
export type TaskVariableValueTypeLong = 1
export type TaskVariableValueTypeDouble = 2
export type TaskVariableValueTypeBoolean = 3
export type TaskVariableValueTypeDate = 4

export type TaskVariableValueType =
  | TaskVariableValueTypeString
  | TaskVariableValueTypeLong
  | TaskVariableValueTypeDouble
  | TaskVariableValueTypeBoolean
  | TaskVariableValueTypeDate

export type TaskVariableKey = {
  task_long_id: string
  variable_string_id: string
}

export type TaskVariable = {
  key: TaskVariableKey
  value_type: TaskVariableValueType
  string_value: string
  long_value: string
  double_value: number
  boolean_value: boolean
  date_value: number
}

export type DispTaskVariable = TaskVariable & {
  task: Task
}

export function exists(key: TaskVariableKey): Pres<boolean> {
  return http
    .generalClient()
    .get(
      'logicengine',
      `task-variable/${key.task_long_id}%26${key.variable_string_id}/exists/`,
      {},
      'json',
    )
}

export function get(key: TaskVariableKey): Pres<TaskVariable> {
  return http
    .generalClient()
    .get(
      'logicengine',
      `task-variable/${key.task_long_id}%26${key.variable_string_id}/`,
      {},
      'json',
    )
}

export function all(pagingInfo: PagingInfo): Prespa<TaskVariable> {
  return http.generalClient().get(
    'logicengine',
    'task-variable/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTaskDisp(
  taskKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispTaskVariable> {
  return http.generalClient().get(
    'logicengine',
    `task-variable/child-for-task/${taskKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: TaskVariableKey): Pres<DispTaskVariable> {
  return http
    .generalClient()
    .get(
      'logicengine',
      `task-variable/${key.task_long_id}%26${key.variable_string_id}/disp/`,
      {},
      'json',
    )
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispTaskVariable> {
  return http.generalClient().get(
    'logicengine',
    'task-variable/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTask(taskKey: LongIdKey, pagingInfo: PagingInfo): Prespa<TaskVariable> {
  return http.generalClient().get(
    'logicengine',
    `task-variable/child-for-task/${taskKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
