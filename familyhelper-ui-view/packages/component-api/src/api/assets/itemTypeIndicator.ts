// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type ItemTypeIndicator = {
  key: StringIdKey
  label: string
  remark: string
}

export type InsertItemTypeIndicator = ItemTypeIndicator
export type UpdateItemTypeIndicator = ItemTypeIndicator

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('assets', `item-type-indicator/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<ItemTypeIndicator> {
  return http.generalClient().get('assets', `item-type-indicator/${key.string_id}/`, {}, 'json')
}

export function insert(itemTypeIndicator: InsertItemTypeIndicator): Pres<StringIdKey> {
  return http
    .generalClient()
    .post('assets', 'item-type-indicator/', itemTypeIndicator, 'application/json;charset=UTF-8')
}

export function update(itemTypeIndicator: UpdateItemTypeIndicator): Pres<null> {
  return http
    .generalClient()
    .patch('assets', 'item-type-indicator/', itemTypeIndicator, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey): Pres<null> {
  return http.generalClient().del('assets', `item-type-indicator/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ItemTypeIndicator> {
  return http.generalClient().get(
    'assets',
    'item-type-indicator/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
