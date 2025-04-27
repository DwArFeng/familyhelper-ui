// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type SettingNodeTypeText = 0
export type SettingNodeTypeLongText = 1
export type SettingNodeTypeImage = 2
export type SettingNodeTypeImageList = 3

export type SettingNodeType =
  | SettingNodeTypeText
  | SettingNodeTypeLongText
  | SettingNodeTypeImage
  | SettingNodeTypeImageList

export type SettingNode = {
  key: StringIdKey
  type: SettingNodeType
  last_modified_date: number
  remark: string
  reachable: boolean
  category: string
  args: string[]
}

export type SettingNodeInspectInfo = {
  category: string
  args: string[]
}

export type SettingNodeInitInfo = {
  category: string
  args: string[]
  type: SettingNodeType
  remark: string
}

export type SettingNodeRemoveInfo = {
  category: string
  args: string[]
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `setting-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<SettingNode> {
  return http.generalClient().get('settingrepo', `setting-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<SettingNode> {
  return http.generalClient().get(
    'settingrepo',
    'setting-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<SettingNode> {
  return http.generalClient().get(
    'settingrepo',
    'setting-node/id-like/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function reachable(pagingInfo: PagingInfo): Prespa<SettingNode> {
  return http.generalClient().get(
    'settingrepo',
    'setting-node/reachable/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLikeReachable(pattern: string, pagingInfo: PagingInfo): Prespa<SettingNode> {
  return http.generalClient().get(
    'settingrepo',
    'setting-node/id-like-reachable/',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateInspect(inspectInfo: SettingNodeInspectInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'setting-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function operateInit(initInfo: SettingNodeInitInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'setting-node/init/', initInfo, 'application/json;charset=UTF-8')
}

export function operateRemove(removeInfo: SettingNodeRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'setting-node/remove/', removeInfo, 'application/json;charset=UTF-8')
}
