// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type TextListNode = {
  key: StringIdKey
}

export type TextListNodeSizeInfo = {
  category: string
  args: string[]
}

export type TextListNodeSizeResult = {
  size: number
}

export type TextListNodeInspectInfo = {
  category: string
  args: string[]
}

export type TextListNodeInspectResult = {
  items: TextListNodeInspectResultItem[]
}

export type TextListNodeInspectResultItem = {
  index: number
  null_flag: boolean
}

export type TextListNodeTextFetchInfo = {
  category: string
  args: string[]
  index: number
}

export type TextListNodeTextFetchResult = {
  content: string
}

export type TextListNodeTextInsertInfo = {
  category: string
  args: string[]
  index: number
  content: string
}

export type TextListNodeTextUpdateInfo = {
  category: string
  args: string[]
  index: number
  content: string
}

export type TextListNodeChangeOrderInfo = {
  category: string
  args: string[]
  old_index: number
  neo_index: number
}

export type TextListNodeRemoveInfo = {
  category: string
  args: string[]
  index: number
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `text-list-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<TextListNode> {
  return http.generalClient().get('settingrepo', `text-list-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<TextListNode> {
  return http.generalClient().get(
    'settingrepo',
    'text-list-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateSize(sizeInfo: TextListNodeSizeInfo): Pres<TextListNodeSizeResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'text-list-node/size/', sizeInfo, 'application/json;charset=UTF-8')
}

export function operateInspect(
  inspectInfo: TextListNodeInspectInfo,
): Pres<TextListNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'text-list-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function operateFetchText(
  fetchInfo: TextListNodeTextFetchInfo,
): Pres<TextListNodeTextFetchResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'text-list-node/fetch-text/', fetchInfo, 'application/json;charset=UTF-8')
}

export function operateInsertText(insertInfo: TextListNodeTextInsertInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'text-list-node/insert-text/',
      insertInfo,
      'application/json;charset=UTF-8',
    )
}

export function operateUpdateText(updateInfo: TextListNodeTextUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'text-list-node/update-text/',
      updateInfo,
      'application/json;charset=UTF-8',
    )
}

export function operateChangeOrder(changeOrderInfo: TextListNodeChangeOrderInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'text-list-node/change-order/',
      changeOrderInfo,
      'application/json;charset=UTF-8',
    )
}

export function operateRemove(removeInfo: TextListNodeRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'text-list-node/remove/', removeInfo, 'application/json;charset=UTF-8')
}
