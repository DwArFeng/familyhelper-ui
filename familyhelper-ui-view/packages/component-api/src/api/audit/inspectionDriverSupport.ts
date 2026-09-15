// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type InspectionDriverSupport = {
  key: StringIdKey
  label: string
  description: string
  example_param: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('audit', `inspection-driver-support/${key.string_id}/exists/`, {}, 'json')
}

export function get(key: StringIdKey): Pres<InspectionDriverSupport> {
  return http
    .generalClient()
    .get('audit', `inspection-driver-support/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<InspectionDriverSupport> {
  return http.generalClient().get(
    'audit',
    'inspection-driver-support/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
