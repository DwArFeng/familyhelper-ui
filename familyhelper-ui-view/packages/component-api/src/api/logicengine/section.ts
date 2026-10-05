// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type Section = {
  key: LongIdKey
  name: string
  enabled: boolean
  expire_timeout: string
  remark: string
}

export type InsertSection = Omit<Section, 'key'> & { key: LongIdKey | null }

export type UpdateSection = Section

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('logicengine', `section/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<Section> {
  return http.generalClient().get('logicengine', `section/${key.long_id}/`, {}, 'json')
}

export function insert(section: InsertSection): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('logicengine', 'section/', section, 'application/json;charset=UTF-8')
}

export function update(section: UpdateSection): Pres<null> {
  return http
    .generalClient()
    .patch('logicengine', 'section/', section, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('logicengine', `section/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Section> {
  return http.generalClient().get(
    'logicengine',
    'section/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function enabled(pagingInfo: PagingInfo): Prespa<Section> {
  return http.generalClient().get(
    'logicengine',
    'section/enabled/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
