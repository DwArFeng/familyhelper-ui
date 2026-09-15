// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Inspection } from './inspection'

export type InspectionTaskStatusCreated = 0
export type InspectionTaskStatusProcessing = 1
export type InspectionTaskStatusFinished = 2
export type InspectionTaskStatusFailed = 3
export type InspectionTaskStatusExpired = 4
export type InspectionTaskStatusDied = 5

export type InspectionTaskStatus =
  | InspectionTaskStatusCreated
  | InspectionTaskStatusProcessing
  | InspectionTaskStatusFinished
  | InspectionTaskStatusFailed
  | InspectionTaskStatusExpired
  | InspectionTaskStatusDied

export type InspectionTask = {
  key: LongIdKey
  inspection_key: LongIdKey
  status: InspectionTaskStatus
  created_date: number
  started_date: number | null
  ended_date: number | null
  /**
   * 任务持续时间，单位毫秒。
   */
  duration: string | null
  should_expire_date: number
  should_die_date: number | null
  expired_date: number | null
  died_date: number | null
  anchor_message: string | null
}

export type DispInspectionTask = InspectionTask & {
  inspection: Inspection
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('audit', `inspection-task/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<InspectionTask> {
  return http.generalClient().get('audit', `inspection-task/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<InspectionTask> {
  return http.generalClient().get(
    'audit',
    'inspection-task/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspection(
  inspectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<InspectionTask> {
  return http.generalClient().get(
    'audit',
    `inspection-task/child-for-inspection/${inspectionKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function shouldExpire(pagingInfo: PagingInfo): Prespa<InspectionTask> {
  return http.generalClient().get(
    'audit',
    'inspection-task/should-expire/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function shouldDie(pagingInfo: PagingInfo): Prespa<InspectionTask> {
  return http.generalClient().get(
    'audit',
    'inspection-task/should-die/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispInspectionTask> {
  return http.generalClient().get('audit', `inspection-task/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispInspectionTask> {
  return http.generalClient().get(
    'audit',
    'inspection-task/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspectionDisp(
  inspectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispInspectionTask> {
  return http.generalClient().get(
    'audit',
    `inspection-task/child-for-inspection/${inspectionKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function shouldExpireDisp(pagingInfo: PagingInfo): Prespa<DispInspectionTask> {
  return http.generalClient().get(
    'audit',
    'inspection-task/should-expire/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function shouldDieDisp(pagingInfo: PagingInfo): Prespa<DispInspectionTask> {
  return http.generalClient().get(
    'audit',
    'inspection-task/should-die/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
