// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Inspection } from './inspection'
import { type InspectionTask } from './inspectionTask'
import { type InspectorInfo } from './inspectorInfo'
import { type InspectionAlarmTypeIndicator } from './inspectionAlarmTypeIndicator'

export type InspectionAlarm = {
  key: LongIdKey
  inspection_key: LongIdKey | null
  inspection_task_key: LongIdKey | null
  inspector_info_key: LongIdKey | null
  happened_date: number
  type: string
  message: string
}

export type DispInspectionAlarm = InspectionAlarm & {
  inspection: Inspection | null
  inspection_task: InspectionTask | null
  inspector_info: InspectorInfo | null
  type_indicator: InspectionAlarmTypeIndicator | null
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('audit', `inspection-alarm/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<InspectionAlarm> {
  return http.generalClient().get('audit', `inspection-alarm/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<InspectionAlarm> {
  return http.generalClient().get(
    'audit',
    'inspection-alarm/all/',
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
): Prespa<InspectionAlarm> {
  return http.generalClient().get(
    'audit',
    `inspection-alarm/child-for-inspection/${inspectionKey.long_id}/`,
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
): Prespa<InspectionAlarm> {
  return http.generalClient().get(
    'audit',
    `inspection-alarm/child-for-inspection-task/${inspectionTaskKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspectorInfo(
  inspectorInfoKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<InspectionAlarm> {
  return http.generalClient().get(
    'audit',
    `inspection-alarm/child-for-inspector-info/${inspectorInfoKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispInspectionAlarm> {
  return http.generalClient().get('audit', `inspection-alarm/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispInspectionAlarm> {
  return http.generalClient().get(
    'audit',
    'inspection-alarm/all/disp/',
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
): Prespa<DispInspectionAlarm> {
  return http.generalClient().get(
    'audit',
    `inspection-alarm/child-for-inspection/${inspectionKey.long_id}/disp/`,
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
): Prespa<DispInspectionAlarm> {
  return http.generalClient().get(
    'audit',
    `inspection-alarm/child-for-inspection-task/${inspectionTaskKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForInspectorInfoDisp(
  inspectorInfoKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispInspectionAlarm> {
  return http.generalClient().get(
    'audit',
    `inspection-alarm/child-for-inspector-info/${inspectorInfoKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
