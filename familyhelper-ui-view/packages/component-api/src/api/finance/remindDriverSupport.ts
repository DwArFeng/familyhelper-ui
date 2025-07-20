// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type RemindDriverSupport = {
  key: StringIdKey
  label: string
  description: string
  example_param: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('finance', `remind-driver-support/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<RemindDriverSupport> {
  return http.generalClient().get('finance', `remind-driver-support/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<RemindDriverSupport> {
  return http.generalClient().get(
    'finance',
    'remind-driver-support/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<RemindDriverSupport> {
  return http.generalClient().get(
    'finance',
    'remind-driver-support/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
