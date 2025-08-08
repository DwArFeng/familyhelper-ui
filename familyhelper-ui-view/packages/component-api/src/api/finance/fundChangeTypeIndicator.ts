// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type FundChangeTypeIndicator = {
  key: StringIdKey
  label: string
  remark: string
}

export type InsertFundChangeTypeIndicator = FundChangeTypeIndicator

export type UpdateFundChangeTypeIndicator = FundChangeTypeIndicator

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('finance', `fund-change-type-indicator/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<FundChangeTypeIndicator> {
  return http
    .generalClient()
    .get('finance', `fund-change-type-indicator/${key.string_id}/`, {}, 'json')
}

export function insert(fundChangeTypeIndicator: InsertFundChangeTypeIndicator): Pres<StringIdKey> {
  return http
    .generalClient()
    .post(
      'finance',
      'fund-change-type-indicator/',
      fundChangeTypeIndicator,
      'application/json;charset=UTF-8',
    )
}

export function update(fundChangeTypeIndicator: UpdateFundChangeTypeIndicator): Pres<null> {
  return http
    .generalClient()
    .patch(
      'finance',
      'fund-change-type-indicator/',
      fundChangeTypeIndicator,
      'application/json;charset=UTF-8',
    )
}

export function remove(key: StringIdKey): Pres<null> {
  return http
    .generalClient()
    .del('finance', `fund-change-type-indicator/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<FundChangeTypeIndicator> {
  return http.generalClient().get(
    'finance',
    'fund-change-type-indicator/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
