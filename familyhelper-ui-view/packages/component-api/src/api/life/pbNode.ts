// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type DispPbSet } from './pbSet'

export type PbNode = {
  key: LongIdKey
  parent_key: LongIdKey | null
  set_key: LongIdKey
  name: string
  remark: string
}

export type DispPbNode = PbNode & {
  set: DispPbSet
  root_flag: boolean
  has_no_child: boolean
}

export type PbNodeCreateInfo = {
  set_key: LongIdKey
  parent_key: LongIdKey | null
  name: string
  remark: string
}

export type PbNodeUpdateInfo = {
  key: LongIdKey
  parent_key: LongIdKey | null
  name: string
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('life', `pb-node/${key.long_id}/exists`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<PbNode> {
  return http.generalClient().get('life', `pb-node/${key.long_id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<PbNode> {
  return http.generalClient().get(
    'life',
    'pb-node/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSet(pbSetKey: LongIdKey | null, pagingInfo: PagingInfo): Prespa<PbNode> {
  const path = pbSetKey ? `pb-set/${pbSetKey.long_id}/pb-node` : 'pb-set//pb-node'
  return http.generalClient().get(
    'life',
    path,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSetRoot(pbSetKey: LongIdKey, pagingInfo: PagingInfo): Prespa<PbNode> {
  return http.generalClient().get(
    'life',
    `pb-set/${pbSetKey.long_id}/pb-node/root`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParent(parentKey: LongIdKey, pagingInfo: PagingInfo): Prespa<PbNode> {
  return http.generalClient().get(
    'life',
    `pb-node/${parentKey.long_id}/child`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSetNameLike(
  pbSetKey: LongIdKey | null,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<PbNode> {
  const path = pbSetKey
    ? `pb-set/${pbSetKey.long_id}/pb-node/name-like`
    : 'pb-set//pb-node/name-like'
  return http.generalClient().get(
    'life',
    path,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispPbNode> {
  return http.generalClient().get('life', `pb-node/${key.long_id}/disp`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispPbNode> {
  return http.generalClient().get(
    'life',
    'pb-node/all/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSetDisp(
  pbSetKey: LongIdKey | null,
  pagingInfo: PagingInfo,
): Prespa<DispPbNode> {
  const path = pbSetKey ? `pb-set/${pbSetKey.long_id}/pb-node/disp` : 'pb-set//pb-node/disp'
  return http.generalClient().get(
    'life',
    path,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSetRootDisp(
  pbSetKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispPbNode> {
  return http.generalClient().get(
    'life',
    `pb-set/${pbSetKey.long_id}/pb-node/root/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParentDisp(
  parentKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispPbNode> {
  return http.generalClient().get(
    'life',
    `pb-node/${parentKey.long_id}/child/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSetNameLikeDisp(
  pbSetKey: LongIdKey | null,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispPbNode> {
  const path = pbSetKey
    ? `pb-set/${pbSetKey.long_id}/pb-node/name-like/disp`
    : 'pb-set//pb-node/name-like/disp'
  return http.generalClient().get(
    'life',
    path,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nodePathFromRoot(key: LongIdKey): Prespa<PbNode> {
  return http.generalClient().get('life', `pb-node/${key.long_id}/path-from-root`, {}, 'json')
}

export function nodePathFromRootDisp(key: LongIdKey): Prespa<DispPbNode> {
  return http.generalClient().get('life', `pb-node/${key.long_id}/path-from-root/disp`, {}, 'json')
}

export function itemPathFromRoot(itemKey: LongIdKey): Prespa<PbNode> {
  return http.generalClient().get('life', `pb-item/${itemKey.long_id}/path-from-root`, {}, 'json')
}

export function itemPathFromRootDisp(itemKey: LongIdKey): Prespa<DispPbNode> {
  return http
    .generalClient()
    .get('life', `pb-item/${itemKey.long_id}/path-from-root/disp`, {}, 'json')
}

export function createPbNode(createInfo: PbNodeCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('life', 'pb-node/create', createInfo, 'application/json;charset=UTF-8')
}

export function updatePbNode(updateInfo: PbNodeUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('life', 'pb-node/update', updateInfo, 'application/json;charset=UTF-8')
}

export function removePbNode(key: LongIdKey): Pres<null> {
  return http.generalClient().post('life', 'pb-node/remove', key, 'application/json;charset=UTF-8')
}
