// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type ReaderSupport = {
  key: StringIdKey
  label: string
  description: string
  example_param: string
  example_metadata: string
}

export function exists(id: string): Pres<boolean> {
  return http.generalClient().get('fileio', `reader-support/${id}/exists`, {}, 'json')
}

export function get(id: string): Pres<ReaderSupport> {
  return http.generalClient().get('fileio', `reader-support/${id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ReaderSupport> {
  return http.generalClient().get(
    'fileio',
    'reader-support/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<ReaderSupport> {
  return http.generalClient().get(
    'fileio',
    'reader-support/id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
