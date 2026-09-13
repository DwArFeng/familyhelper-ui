// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type ImporterSupport = {
  key: StringIdKey
  label: string
  description: string
  example_param: string
  example_metadata: string
}

export function exists(id: string): Pres<boolean> {
  return http.generalClient().get('fileio', `importer-support/${id}/exists`, {}, 'json')
}

export function get(id: string): Pres<ImporterSupport> {
  return http.generalClient().get('fileio', `importer-support/${id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ImporterSupport> {
  return http.generalClient().get(
    'fileio',
    'importer-support/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<ImporterSupport> {
  return http.generalClient().get(
    'fileio',
    'importer-support/id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
