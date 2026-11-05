// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type WarmupDriverSupport = {
  key: StringIdKey
  label: string
  description: string
  example_param: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `warmup-driver-support/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<WarmupDriverSupport> {
  return http
    .generalClient()
    .get('settingrepo', `warmup-driver-support/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<WarmupDriverSupport> {
  return http.generalClient().get(
    'settingrepo',
    'warmup-driver-support/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<WarmupDriverSupport> {
  return http.generalClient().get(
    'settingrepo',
    'warmup-driver-support/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function labelLike(pattern: string, pagingInfo: PagingInfo): Prespa<WarmupDriverSupport> {
  return http.generalClient().get(
    'settingrepo',
    'warmup-driver-support/label-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
