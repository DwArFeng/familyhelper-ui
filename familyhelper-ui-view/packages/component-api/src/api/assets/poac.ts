// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type DispAssetCatalog } from './assetCatalog'
import { type DispAccount } from '../system/account'

export type PoacPermissionLevelOwner = 0
export type PoacPermissionLevelGuest = 1

export type PoacPermissionLevel = PoacPermissionLevelOwner | PoacPermissionLevelGuest

export type PoacKey = {
  long_id: number
  string_id: string
}

export type Poac = {
  key: PoacKey
  permission_level: PoacPermissionLevel
  remark: string
}

export type DispPoac = Poac & {
  asset_catalog: DispAssetCatalog
  account: DispAccount
}

export function exists(key: PoacKey): Pres<boolean> {
  return http
    .generalClient()
    .get('assets', `poac/${key.long_id}%26${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: PoacKey): Pres<Poac> {
  return http.generalClient().get('assets', `poac/${key.long_id}%26${key.string_id}/`, {}, 'json')
}

export function inspectDisp(key: PoacKey): Pres<DispPoac> {
  return http
    .generalClient()
    .get('assets', `poac/${key.long_id}%26${key.string_id}/disp/`, {}, 'json')
}

export function childForAssetCatalog(
  assetCatalogKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<Poac> {
  return http.generalClient().get(
    'assets',
    `asset-catalog/${assetCatalogKey.long_id}/poac/`,
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
): Prespa<DispPoac> {
  return http.generalClient().get(
    'assets',
    `asset-catalog/${assetCatalogKey.long_id}/poac/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
