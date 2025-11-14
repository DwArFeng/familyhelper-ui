// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type DispAccount } from '../system/account'
import { type PopbPermissionLevel } from './popb'

export type PbSet = {
  key: LongIdKey
  name: string
  remark: string
  created_date: number
  item_count: number
  last_recorded_date: number | null
}

export type DispPbSet = PbSet & {
  owner_account: DispAccount | null
  permission_level: PopbPermissionLevel | null
}

export type PbSetCreateInfo = {
  name: string
  remark: string
}

export type PbSetUpdateInfo = {
  pb_set_key: LongIdKey
  name: string
  remark: string
}

export type PbSetPermissionUpsertInfo = {
  pb_set_key: LongIdKey
  user_key: StringIdKey
  permission_level: PopbPermissionLevel
}

export type PbSetPermissionRemoveInfo = {
  pb_set_key: LongIdKey
  user_key: StringIdKey
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('life', `pb-set/${key.long_id}/exists`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<PbSet> {
  return http.generalClient().get('life', `pb-set/${key.long_id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<PbSet> {
  return http.generalClient().get(
    'life',
    'pb-set/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispPbSet> {
  return http.generalClient().get('life', `pb-set/${key.long_id}/disp`, {}, 'json')
}

export function allPermittedDisp(pagingInfo: PagingInfo): Prespa<DispPbSet> {
  return http.generalClient().get(
    'life',
    'pb-set/all-permitted/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function allOwnedDisp(pagingInfo: PagingInfo): Prespa<DispPbSet> {
  return http.generalClient().get(
    'life',
    'pb-set/all-owned/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function createPbSet(createInfo: PbSetCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('life', 'pb-set/create', createInfo, 'application/json;charset=UTF-8')
}

export function updatePbSet(updateInfo: PbSetUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('life', 'pb-set/update', updateInfo, 'application/json;charset=UTF-8')
}

export function removePbSet(key: LongIdKey): Pres<null> {
  return http.generalClient().post('life', 'pb-set/remove', key, 'application/json;charset=UTF-8')
}

export function upsertPermission(upsertInfo: PbSetPermissionUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post('life', 'pb-set/upsert-permission', upsertInfo, 'application/json;charset=UTF-8')
}

export function removePermission(removeInfo: PbSetPermissionRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('life', 'pb-set/remove-permission', removeInfo, 'application/json;charset=UTF-8')
}
