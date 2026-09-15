// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type InspectionAlarmTypeIndicator = {
  key: StringIdKey
  label: string
  remark: string
}

export type InsertInspectionAlarmTypeIndicator = InspectionAlarmTypeIndicator

export type UpdateInspectionAlarmTypeIndicator = InspectionAlarmTypeIndicator

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('audit', `inspection-alarm-type-indicator/${key.string_id}/exists/`, {}, 'json')
}

export function get(key: StringIdKey): Pres<InspectionAlarmTypeIndicator> {
  return http
    .generalClient()
    .get('audit', `inspection-alarm-type-indicator/${key.string_id}/`, {}, 'json')
}

export function insert(
  inspectionAlarmTypeIndicator: InsertInspectionAlarmTypeIndicator,
): Pres<StringIdKey> {
  return http
    .generalClient()
    .post(
      'audit',
      'inspection-alarm-type-indicator/',
      inspectionAlarmTypeIndicator,
      'application/json;charset=UTF-8',
    )
}

export function update(
  inspectionAlarmTypeIndicator: UpdateInspectionAlarmTypeIndicator,
): Pres<null> {
  return http
    .generalClient()
    .patch(
      'audit',
      'inspection-alarm-type-indicator/',
      inspectionAlarmTypeIndicator,
      'application/json;charset=UTF-8',
    )
}

export function remove(key: StringIdKey): Pres<null> {
  return http
    .generalClient()
    .del('audit', `inspection-alarm-type-indicator/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<InspectionAlarmTypeIndicator> {
  return http.generalClient().get(
    'audit',
    'inspection-alarm-type-indicator/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
