// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type FilterSupport = {
  key: StringIdKey
  label: string
  description: string
  example_pattern: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('rbac', `filter-support/${key.string_id}/exists`, {}, 'json')
}

export function get(key: StringIdKey): Pres<FilterSupport> {
  return http.generalClient().get('rbac', `filter-support/${key.string_id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<FilterSupport> {
  return http.generalClient().get(
    'rbac',
    'filter-support/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<FilterSupport> {
  return http.generalClient().get(
    'rbac',
    'filter-support/id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function labelLike(pattern: string, pagingInfo: PagingInfo): Prespa<FilterSupport> {
  return http.generalClient().get(
    'rbac',
    'filter-support/label-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
