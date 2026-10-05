// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Section } from './section'
import { type State, type StateKey } from './state'

export type TaskStatusCreated = 0
export type TaskStatusProcessing = 1
export type TaskStatusFinished = 2
export type TaskStatusFailed = 3
export type TaskStatusExpired = 4
export type TaskStatusDied = 5

export type TaskStatus =
  | TaskStatusCreated
  | TaskStatusProcessing
  | TaskStatusFinished
  | TaskStatusFailed
  | TaskStatusExpired
  | TaskStatusDied

export type Task = {
  key: LongIdKey
  section_key: LongIdKey
  current_state_key: StateKey | null
  status: TaskStatus
  created_date: number
  started_date: number | null
  ended_date: number | null
  duration: string | null
  should_expire_date: number
  should_die_date: number | null
  expired_date: number | null
  died_date: number | null
  state_changed_date: number | null
  anchor_message: string | null
}

export type DispTask = Task & {
  section: Section
  current_state: State | null
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('logicengine', `task/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<Task> {
  return http.generalClient().get('logicengine', `task/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Task> {
  return http.generalClient().get(
    'logicengine',
    'task/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSectionDisp(
  sectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispTask> {
  return http.generalClient().get(
    'logicengine',
    `task/child-for-section/${sectionKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForCurrentStateDisp(
  currentStateKey: StateKey,
  pagingInfo: PagingInfo,
): Prespa<DispTask> {
  return http.generalClient().get(
    'logicengine',
    `task/child-for-current-state/${currentStateKey.section_long_id}%26${currentStateKey.state_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispTask> {
  return http.generalClient().get('logicengine', `task/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispTask> {
  return http.generalClient().get(
    'logicengine',
    'task/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSection(sectionKey: LongIdKey, pagingInfo: PagingInfo): Prespa<Task> {
  return http.generalClient().get(
    'logicengine',
    `task/child-for-section/${sectionKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForCurrentState(
  currentStateKey: StateKey,
  pagingInfo: PagingInfo,
): Prespa<Task> {
  return http.generalClient().get(
    'logicengine',
    `task/child-for-current-state/${currentStateKey.section_long_id}%26${currentStateKey.state_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
