// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type KvNode = {
  key: StringIdKey
  count: number
}

export type KvNodeCountInfo = {
  category: string
  args: string[]
}

export type KvNodeCountResult = {
  count: number
}

export type KvNodeInspectInfo = {
  category: string
  args: string[]
}

export type KvNodeInspectResult = {
  items: KvNodeInspectResultItem[]
}

export type KvNodeInspectResultItem = {
  item_string_id: string
  value: string | null
}

export type KvNodeItemInspectInfo = {
  category: string
  args: string[]
  item_string_id: string
}

export type KvNodeItemInspectResult = {
  value: string | null
}

export type KvNodeItemPutInfo = {
  category: string
  args: string[]
  item_string_id: string
  value: string
}

export type KvNodeItemRemoveInfo = {
  category: string
  args: string[]
  item_string_id: string
}

export type KvNodeClearInfo = {
  category: string
  args: string[]
}

export type PublicKvNodeCountInfo = {
  category: string
  args: string[]
}

export type PublicKvNodeInspectInfo = {
  category: string
  args: string[]
}

export type PublicKvNodeItemInspectInfo = {
  category: string
  args: string[]
  item_string_id: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('settingrepo', `kv-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<KvNode> {
  return http.generalClient().get('settingrepo', `kv-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<KvNode> {
  return http.generalClient().get(
    'settingrepo',
    'kv-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateCount(countInfo: KvNodeCountInfo): Pres<KvNodeCountResult> {
  return http
    .generalClient()
    .post('settingrepo', 'kv-node/count/', countInfo, 'application/json;charset=UTF-8')
}

export function operateInspect(inspectInfo: KvNodeInspectInfo): Pres<KvNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'kv-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function operateInspectItem(
  inspectInfo: KvNodeItemInspectInfo,
): Pres<KvNodeItemInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'kv-node/inspect-item/', inspectInfo, 'application/json;charset=UTF-8')
}

export function operatePutItem(putInfo: KvNodeItemPutInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'kv-node/put-item/', putInfo, 'application/json;charset=UTF-8')
}

export function operateRemoveItem(removeInfo: KvNodeItemRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'kv-node/remove-item/', removeInfo, 'application/json;charset=UTF-8')
}

export function operateClear(clearInfo: KvNodeClearInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'kv-node/clear/', clearInfo, 'application/json;charset=UTF-8')
}

export function operateClearCache(clearCacheInfo: KvNodeClearInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'kv-node/clear-cache/', clearCacheInfo, 'application/json;charset=UTF-8')
}

export function operateCountForPublic(
  countInfo: PublicKvNodeCountInfo,
): Pres<KvNodeCountResult | null> {
  return http
    .publicClient()
    .post('settingrepo', 'kv-node/count-for-public/', countInfo, 'application/json;charset=UTF-8')
}

export function operateInspectForPublic(
  inspectInfo: PublicKvNodeInspectInfo,
): Pres<KvNodeInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'kv-node/inspect-for-public/',
      inspectInfo,
      'application/json;charset=UTF-8',
    )
}

export function operateInspectItemForPublic(
  inspectInfo: PublicKvNodeItemInspectInfo,
): Pres<KvNodeItemInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'kv-node/inspect-item-for-public/',
      inspectInfo,
      'application/json;charset=UTF-8',
    )
}
