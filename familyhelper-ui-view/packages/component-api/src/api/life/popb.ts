// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type DispPbSet } from './pbSet'
import { type DispAccount } from '../system/account'

export type PopbPermissionLevelOwner = 0
export type PopbPermissionLevelGuest = 1

export type PopbPermissionLevel = PopbPermissionLevelOwner | PopbPermissionLevelGuest

export type PopbKey = {
  pb_long_id: string
  user_string_id: string
}

export type Popb = {
  key: PopbKey
  permission_level: PopbPermissionLevel
  remark: string
}

export type DispPopb = Popb & {
  pb_set: DispPbSet
  account: DispAccount
}

export function exists(key: PopbKey): Pres<boolean> {
  return http
    .generalClient()
    .get('life', `popb/${key.pb_long_id}%26${key.user_string_id}/exists`, {}, 'json')
}

export function inspect(key: PopbKey): Pres<Popb> {
  return http
    .generalClient()
    .get('life', `popb/${key.pb_long_id}%26${key.user_string_id}`, {}, 'json')
}

export function inspectDisp(key: PopbKey): Pres<DispPopb> {
  return http
    .generalClient()
    .get('life', `popb/${key.pb_long_id}%26${key.user_string_id}/disp`, {}, 'json')
}

export function childForPbSet(pbSetKey: LongIdKey, pagingInfo: PagingInfo): Prespa<Popb> {
  return http.generalClient().get(
    'life',
    `pb-set/${pbSetKey.long_id}/popb`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbSetDisp(pbSetKey: LongIdKey, pagingInfo: PagingInfo): Prespa<DispPopb> {
  return http.generalClient().get(
    'life',
    `pb-set/${pbSetKey.long_id}/popb/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
