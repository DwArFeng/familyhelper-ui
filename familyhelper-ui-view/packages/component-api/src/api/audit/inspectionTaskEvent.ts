// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type InspectionTask } from './inspectionTask'

export type InspectionTaskEvent = {
  key: LongIdKey
  inspection_task_key: LongIdKey
  happened_date: number
  message: string
}

export type DispInspectionTaskEvent = InspectionTaskEvent & {
  inspection_task: InspectionTask
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('audit', `inspection-task-event/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<InspectionTaskEvent> {
  return http.generalClient().get('audit', `inspection-task-event/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<InspectionTaskEvent> {
  return http.generalClient().get(
    'audit',
    'inspection-task-event/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspectionTask(
  inspectionTaskKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<InspectionTaskEvent> {
  return http.generalClient().get(
    'audit',
    `inspection-task-event/child-for-inspection-task/${inspectionTaskKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispInspectionTaskEvent> {
  return http.generalClient().get('audit', `inspection-task-event/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispInspectionTaskEvent> {
  return http.generalClient().get(
    'audit',
    'inspection-task-event/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspectionTaskDisp(
  inspectionTaskKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispInspectionTaskEvent> {
  return http.generalClient().get(
    'audit',
    `inspection-task-event/child-for-inspection-task/${inspectionTaskKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
