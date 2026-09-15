// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type Inspection = {
  key: LongIdKey
  name: string
  enabled: boolean
  remark: string
}

export type InsertInspection = Omit<Inspection, 'key'> & { key: LongIdKey | null }

export type UpdateInspection = Inspection

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('audit', `inspection/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<Inspection> {
  return http.generalClient().get('audit', `inspection/${key.long_id}/`, {}, 'json')
}

export function insert(inspection: InsertInspection): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('audit', 'inspection/', inspection, 'application/json;charset=UTF-8')
}

export function update(inspection: UpdateInspection): Pres<null> {
  return http
    .generalClient()
    .patch('audit', 'inspection/', inspection, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('audit', `inspection/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Inspection> {
  return http.generalClient().get(
    'audit',
    'inspection/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
