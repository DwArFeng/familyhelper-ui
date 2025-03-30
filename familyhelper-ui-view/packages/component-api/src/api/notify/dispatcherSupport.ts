// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { PagingInfo } from '../../util/request'
import type { Pres, Prespa } from '../../util/response'

export type DispatcherSupport = {
  key: StringIdKey
  label: string
  description: string
  example_param: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('notify', `dispatcher-support/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<DispatcherSupport> {
  return http.generalClient().get('notify', `dispatcher-support/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<DispatcherSupport> {
  return http.generalClient().get(
    'notify',
    'dispatcher-support/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<DispatcherSupport> {
  return http.generalClient().get(
    'notify',
    'dispatcher-support/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
