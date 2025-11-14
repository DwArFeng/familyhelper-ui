// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type DispPbNode } from './pbNode'

export type PbItemComparatorAsc = 0
export type PbItemComparatorDesc = 1

export type PbItemComparator = PbItemComparatorAsc | PbItemComparatorDesc

export type PbItem = {
  key: LongIdKey
  node_key: LongIdKey
  set_key: LongIdKey
  name: string
  unit: string
  comparator: PbItemComparator | null
  remark: string
}

export type DispPbItem = PbItem & {
  node: DispPbNode | null
}

export type PbItemCreateInfo = {
  set_key: LongIdKey
  node_key: LongIdKey | null
  name: string
  unit: string
  comparator: PbItemComparator | null
  remark: string
}

export type PbItemUpdateInfo = {
  key: LongIdKey
  node_key: LongIdKey | null
  name: string
  unit: string
  comparator: PbItemComparator | null
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('life', `pb-item/${key.long_id}/exists`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<PbItem> {
  return http.generalClient().get('life', `pb-item/${key.long_id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<PbItem> {
  return http.generalClient().get(
    'life',
    'pb-item/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbNode(
  pbNodeKey: LongIdKey | null,
  pagingInfo: PagingInfo,
): Prespa<PbItem> {
  const path = pbNodeKey ? `pb-node/${pbNodeKey.long_id}/pb-item` : 'pb-node//pb-item'
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

export function childForPbSetRoot(pbSetKey: LongIdKey, pagingInfo: PagingInfo): Prespa<PbItem> {
  return http.generalClient().get(
    'life',
    `pb-set/${pbSetKey.long_id}/pb-item/root`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSetNameLike(
  pbSetKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<PbItem> {
  return http.generalClient().get(
    'life',
    `pb-set/${pbSetKey.long_id}/pb-item/name-like`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispPbItem> {
  return http.generalClient().get('life', `pb-item/${key.long_id}/disp`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispPbItem> {
  return http.generalClient().get(
    'life',
    'pb-item/all/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbNodeDisp(
  pbNodeKey: LongIdKey | null,
  pagingInfo: PagingInfo,
): Prespa<DispPbItem> {
  const path = pbNodeKey ? `pb-node/${pbNodeKey.long_id}/pb-item/disp` : 'pb-node//pb-item/disp'
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
): Prespa<DispPbItem> {
  return http.generalClient().get(
    'life',
    `pb-set/${pbSetKey.long_id}/pb-item/root/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSetNameLikeDisp(
  pbSetKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispPbItem> {
  return http.generalClient().get(
    'life',
    `pb-set/${pbSetKey.long_id}/pb-item/name-like/disp`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function createPbItem(createInfo: PbItemCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('life', 'pb-item/create', createInfo, 'application/json;charset=UTF-8')
}

export function updatePbItem(updateInfo: PbItemUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('life', 'pb-item/update', updateInfo, 'application/json;charset=UTF-8')
}

export function removePbItem(key: LongIdKey): Pres<null> {
  return http.generalClient().post('life', 'pb-item/remove', key, 'application/json;charset=UTF-8')
}
