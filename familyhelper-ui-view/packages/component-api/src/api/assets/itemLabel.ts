// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type ItemLabel = {
  key: StringIdKey
  label: string
  remark: string
}

export type InsertItemLabel = ItemLabel
export type UpdateItemLabel = ItemLabel

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('assets', `item-label/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<ItemLabel> {
  return http.generalClient().get('assets', `item-label/${key.string_id}/`, {}, 'json')
}

export function insert(itemLabel: InsertItemLabel): Pres<StringIdKey> {
  return http
    .generalClient()
    .post('assets', 'item-label/', itemLabel, 'application/json;charset=UTF-8')
}

export function update(itemLabel: UpdateItemLabel): Pres<null> {
  return http
    .generalClient()
    .patch('assets', 'item-label/', itemLabel, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('assets', `item-label/${key.string_id}/`, {}, 'json')
}

export function allExists(keys: StringIdKey[]): Pres<boolean> {
  return http
    .generalClient()
    .post('assets', 'item-label/all-exists/', keys, 'application/json;charset=UTF-8')
}

export function all(pagingInfo: PagingInfo): Prespa<ItemLabel> {
  return http.generalClient().get(
    'assets',
    'item-label/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
