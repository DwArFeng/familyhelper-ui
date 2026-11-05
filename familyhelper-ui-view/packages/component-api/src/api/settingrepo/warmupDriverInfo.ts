// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type WarmupSetting } from './warmupSetting.ts'

export type WarmupDriverInfo = {
  key: LongIdKey
  warmup_setting_key: LongIdKey
  enabled: boolean
  type: string
  param: string
  remark: string
}

export type InsertWarmupDriverInfo = Omit<WarmupDriverInfo, 'key'> & { key: LongIdKey | null }

export type DispWarmupDriverInfo = WarmupDriverInfo & {
  warmup_setting: WarmupSetting | null
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `warmup-driver-info/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<WarmupDriverInfo> {
  return http.generalClient().get('settingrepo', `warmup-driver-info/${key.long_id}/`, {}, 'json')
}

export function insert(warmupDriverInfo: InsertWarmupDriverInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('settingrepo', 'warmup-driver-info/', warmupDriverInfo, 'application/json;charset=UTF-8')
}

export function update(warmupDriverInfo: WarmupDriverInfo): Pres<null> {
  return http
    .generalClient()
    .patch('settingrepo', 'warmup-driver-info/', warmupDriverInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('settingrepo', `warmup-driver-info/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<WarmupDriverInfo> {
  return http.generalClient().get(
    'settingrepo',
    'warmup-driver-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForWarmupSetting(
  warmupSettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<WarmupDriverInfo> {
  return http.generalClient().get(
    'settingrepo',
    `warmup-setting/${warmupSettingKey.long_id}/warmup-driver-info/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForWarmupSettingEnabled(
  warmupSettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<WarmupDriverInfo> {
  return http.generalClient().get(
    'settingrepo',
    `warmup-setting/${warmupSettingKey.long_id}/warmup-driver-info/enabled/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispWarmupDriverInfo> {
  return http
    .generalClient()
    .get('settingrepo', `warmup-driver-info/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispWarmupDriverInfo> {
  return http.generalClient().get(
    'settingrepo',
    'warmup-driver-info/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForWarmupSettingDisp(
  warmupSettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispWarmupDriverInfo> {
  return http.generalClient().get(
    'settingrepo',
    `warmup-setting/${warmupSettingKey.long_id}/warmup-driver-info/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForWarmupSettingEnabledDisp(
  warmupSettingKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispWarmupDriverInfo> {
  return http.generalClient().get(
    'settingrepo',
    `warmup-setting/${warmupSettingKey.long_id}/warmup-driver-info/enabled/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
