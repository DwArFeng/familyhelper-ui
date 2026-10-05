// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Task } from './task'

export type TaskEvent = {
  key: LongIdKey
  task_key: LongIdKey
  happened_date: number
  message: string
}

export type DispTaskEvent = TaskEvent & {
  task: Task
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('logicengine', `task-event/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<TaskEvent> {
  return http.generalClient().get('logicengine', `task-event/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<TaskEvent> {
  return http.generalClient().get(
    'logicengine',
    'task-event/all/',
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
): Prespa<DispTaskEvent> {
  return http.generalClient().get(
    'logicengine',
    `task-event/child-for-task/${taskKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispTaskEvent> {
  return http.generalClient().get('logicengine', `task-event/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispTaskEvent> {
  return http.generalClient().get(
    'logicengine',
    'task-event/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTask(taskKey: LongIdKey, pagingInfo: PagingInfo): Prespa<TaskEvent> {
  return http.generalClient().get(
    'logicengine',
    `task-event/child-for-task/${taskKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
