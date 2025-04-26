// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type DispAssetCatalog } from './assetCatalog'
import { type ItemTypeIndicator } from './itemTypeIndicator'
import { type ItemLabel } from './itemLabel'

export type ItemLifeCyclePreparing = 0
export type ItemLifeCycleUsing = 1
export type ItemLifeCycleDisabled = 2
export type ItemLifeCycleScrapped = 3

export type ItemLifeCycle =
  | ItemLifeCyclePreparing
  | ItemLifeCycleUsing
  | ItemLifeCycleDisabled
  | ItemLifeCycleScrapped

export type Item = {
  key: LongIdKey
  parent_key: LongIdKey | null
  asset_catalog_key: LongIdKey
  name: string
  item_type: string
  created_date: number
  modified_date: number | null
  scrapped_date: number | null
  life_cycle: ItemLifeCycle
  remark: string
}

export type DispItem = Item & {
  asset_catalog: DispAssetCatalog | null
  type_indicator: ItemTypeIndicator | null
  labels: ItemLabel[]
  root_flag: boolean
  has_no_child: boolean
}

export type ItemCreateInfo = {
  asset_catalog_key: LongIdKey
  parent_key: LongIdKey | null
  label_keys: StringIdKey[]
  name: string
  type: string
  life_cycle: ItemLifeCycle
  remark: string
}

export type ItemUpdateInfo = {
  item_key: LongIdKey
  parent_key: LongIdKey | null
  label_keys: StringIdKey[]
  name: string
  type: string
  life_cycle: ItemLifeCycle
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('assets', `item/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<Item> {
  return http.generalClient().get('assets', `item/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Item> {
  return http.generalClient().get(
    'assets',
    'item/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAssetCatalog(
  assetCatalogKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<Item> {
  return http.generalClient().get(
    'assets',
    `asset-catalog/${assetCatalogKey.long_id}/item/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAssetCatalogRoot(
  assetCatalogKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<Item> {
  return http.generalClient().get(
    'assets',
    `asset-catalog/${assetCatalogKey.long_id}/item/root/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParent(parentKey: LongIdKey, pagingInfo: PagingInfo): Prespa<Item> {
  return http.generalClient().get(
    'assets',
    `item/${parentKey.long_id}/child/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAssetCatalogNameLike(
  assetCatalogKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<Item> {
  return http.generalClient().get(
    'assets',
    `asset-catalog/${assetCatalogKey.long_id}/item/name-like/`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispItem> {
  return http.generalClient().get('assets', `item/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispItem> {
  return http.generalClient().get(
    'assets',
    'item/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAssetCatalogDisp(
  assetCatalogKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispItem> {
  return http.generalClient().get(
    'assets',
    `asset-catalog/${assetCatalogKey.long_id}/item/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAssetCatalogRootDisp(
  assetCatalogKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispItem> {
  return http.generalClient().get(
    'assets',
    `asset-catalog/${assetCatalogKey.long_id}/item/root/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParentDisp(parentKey: LongIdKey, pagingInfo: PagingInfo): Prespa<DispItem> {
  return http.generalClient().get(
    'assets',
    `item/${parentKey.long_id}/child/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAssetCatalogNameLikeDisp(
  assetCatalogKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispItem> {
  return http.generalClient().get(
    'assets',
    `asset-catalog/${assetCatalogKey.long_id}/item/name-like/disp/`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function pathFromRoot(key: LongIdKey): Prespa<Item> {
  return http.generalClient().get('assets', `item/${key.long_id}/path-from-root/`, {}, 'json')
}

export function pathFromRootDisp(key: LongIdKey): Prespa<DispItem> {
  return http.generalClient().get('assets', `item/${key.long_id}/path-from-root/disp/`, {}, 'json')
}

export function create(createInfo: ItemCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('assets', 'item/create/', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: ItemUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('assets', 'item/update/', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().post('assets', 'item/remove/', key, 'application/json;charset=UTF-8')
}
