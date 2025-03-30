// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { PagingInfo } from '../../util/request'
import type { Pres, Prespa } from '../../util/response'

export type RouterSupport = {
  key: StringIdKey
  label: string
  description: string
  example_param: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('notify', `router-support/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<RouterSupport> {
  return http.generalClient().get('notify', `router-support/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<RouterSupport> {
  return http.generalClient().get(
    'notify',
    'router-support/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<RouterSupport> {
  return http.generalClient().get(
    'notify',
    'router-support/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
