// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type NavigationNode = {
  key: StringIdKey
  size: number
  content: string
}

export type NavigationNodeSizeInfo = {
  category: string
  args: string[]
}

export type NavigationNodeSizeResult = {
  size: number
}

export type NavigationNodeInspectInfo = {
  category: string
  args: string[]
}

export type NavigationNodeInspectResult = {
  count: number
  content: string
  children: NavigationNodeInspectResultItem[]
}

export type NavigationNodeInspectResultItem = {
  key: LongIdKey
  parent_item_key: LongIdKey | null
  index: number
  name: string
  content: string
  remark: string
  children: NavigationNodeInspectResultItem[]
}

export type NavigationNodeUpdateInfo = {
  category: string
  args: string[]
  content: string
}

export type NavigationNodeItemInsertInfo = {
  category: string
  args: string[]
  parent_item_key: LongIdKey | null
  index: number
  name: string
  content: string
  remark: string
}

export type NavigationNodeItemInsertResult = {
  category: string
  args: string[]
  item_key: LongIdKey
}

export type NavigationNodeItemUpdateInfo = {
  category: string
  args: string[]
  item_key: LongIdKey
  parent_item_key: LongIdKey | null
  index: number
  name: string
  content: string
  remark: string
}

export type NavigationNodeItemRemoveInfo = {
  category: string
  args: string[]
  item_key: LongIdKey
}

export type NavigationNodeFormatIndexInfo = {
  category: string
  args: string[]
  parent_item_key: LongIdKey | null
}

export type PublicNavigationNodeSizeInfo = {
  category: string
  args: string[]
}

export type PublicNavigationNodeInspectInfo = {
  category: string
  args: string[]
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `navigation-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<NavigationNode> {
  return http.generalClient().get('settingrepo', `navigation-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<NavigationNode> {
  return http.generalClient().get(
    'settingrepo',
    'navigation-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function size(sizeInfo: NavigationNodeSizeInfo): Pres<NavigationNodeSizeResult> {
  return http
    .generalClient()
    .post('settingrepo', 'navigation-node/size/', sizeInfo, 'application/json;charset=UTF-8')
}

export function operateInspect(
  inspectInfo: NavigationNodeInspectInfo,
): Pres<NavigationNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'navigation-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function updateNode(updateInfo: NavigationNodeUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'navigation-node/update-node/',
      updateInfo,
      'application/json;charset=UTF-8',
    )
}

export function insertItem(
  insertInfo: NavigationNodeItemInsertInfo,
): Pres<NavigationNodeItemInsertResult> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'navigation-node/insert-item/',
      insertInfo,
      'application/json;charset=UTF-8',
    )
}

export function updateItem(updateInfo: NavigationNodeItemUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'navigation-node/update-item/',
      updateInfo,
      'application/json;charset=UTF-8',
    )
}

export function removeItem(removeInfo: NavigationNodeItemRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'navigation-node/remove-item/',
      removeInfo,
      'application/json;charset=UTF-8',
    )
}

export function formatIndex(formatIndexInfo: NavigationNodeFormatIndexInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'navigation-node/format-index/',
      formatIndexInfo,
      'application/json;charset=UTF-8',
    )
}

export function sizeForPublic(
  sizeInfo: PublicNavigationNodeSizeInfo,
): Pres<NavigationNodeSizeResult> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'navigation-node/size-for-public/',
      sizeInfo,
      'application/json;charset=UTF-8',
    )
}

export function operateInspectForPublic(
  inspectInfo: PublicNavigationNodeInspectInfo,
): Pres<NavigationNodeInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'navigation-node/inspect-for-public/',
      inspectInfo,
      'application/json;charset=UTF-8',
    )
}
