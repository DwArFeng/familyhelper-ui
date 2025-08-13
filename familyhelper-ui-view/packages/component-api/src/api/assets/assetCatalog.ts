// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type PoacPermissionLevel } from './poac'
import { type DispAccount } from '../system/account'

export type AssetCatalog = {
  key: LongIdKey
  name: string
  remark: string
  item_count: number
  created_date: number
}

export type DispAssetCatalog = AssetCatalog & {
  owner_account: DispAccount | null
  permission_level: PoacPermissionLevel | null
}

export type AssetCatalogCreateInfo = {
  name: string
  remark: string
}

export type AssetCatalogUpdateInfo = {
  asset_catalog_key: LongIdKey
  name: string
  remark: string
}

export type AssetCatalogPermissionUpsertInfo = {
  asset_catalog_key: LongIdKey
  user_key: StringIdKey
  permission_level: PoacPermissionLevel
}

export type AssetCatalogPermissionRemoveInfo = {
  asset_catalog_key: LongIdKey
  user_key: StringIdKey
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('assets', `asset-catalog/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<AssetCatalog> {
  return http.generalClient().get('assets', `asset-catalog/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<AssetCatalog> {
  return http.generalClient().get(
    'assets',
    'asset-catalog/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispAssetCatalog> {
  return http.generalClient().get('assets', `asset-catalog/${key.long_id}/disp/`, {}, 'json')
}

export function allPermittedDisp(pagingInfo: PagingInfo): Prespa<DispAssetCatalog> {
  return http.generalClient().get(
    'assets',
    'asset-catalog/all-permitted/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function allOwnedDisp(pagingInfo: PagingInfo): Prespa<DispAssetCatalog> {
  return http.generalClient().get(
    'assets',
    'asset-catalog/all-owned/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: AssetCatalogCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('assets', 'asset-catalog/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: AssetCatalogUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('assets', 'asset-catalog/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('assets', 'asset-catalog/remove', key, 'application/json;charset=UTF-8')
}

export function upsertPermission(upsertInfo: AssetCatalogPermissionUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post('assets', 'asset-catalog/upsert-permission', upsertInfo, 'application/json;charset=UTF-8')
}

export function removePermission(removeInfo: AssetCatalogPermissionRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('assets', 'asset-catalog/remove-permission', removeInfo, 'application/json;charset=UTF-8')
}
