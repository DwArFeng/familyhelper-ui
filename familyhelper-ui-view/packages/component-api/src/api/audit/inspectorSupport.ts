// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type InspectorSupport = {
  key: StringIdKey
  label: string
  description: string
  example_param: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('audit', `inspector-support/${key.string_id}/exists/`, {}, 'json')
}

export function get(key: StringIdKey): Pres<InspectorSupport> {
  return http.generalClient().get('audit', `inspector-support/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<InspectorSupport> {
  return http.generalClient().get(
    'audit',
    'inspector-support/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
