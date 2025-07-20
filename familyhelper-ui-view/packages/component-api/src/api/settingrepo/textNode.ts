// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type TextNode = {
  key: StringIdKey
  value: string
}

export type TextNodeInspectInfo = {
  category: string
  args: string[]
}

export type TextNodeInspectResult = {
  value: string
}

export type TextNodePutInfo = {
  category: string
  args: string[]
  value: string
}

export type PublicTextNodeInspectInfo = {
  args: string[]
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('settingrepo', `text-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<TextNode> {
  return http.generalClient().get('settingrepo', `text-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<TextNode> {
  return http.generalClient().get(
    'settingrepo',
    'text-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateInspect(info: TextNodeInspectInfo): Pres<TextNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'text-node/inspect/', info, 'application/json;charset=UTF-8')
}

export function operatePut(info: TextNodePutInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'text-node/put/', info, 'application/json;charset=UTF-8')
}

export function operateInspectForPublic(
  info: PublicTextNodeInspectInfo,
): Pres<TextNodeInspectResult | null> {
  return http
    .publicClient()
    .post('settingrepo', 'text-node/inspect-for-public/', info, 'application/json;charset=UTF-8')
}
