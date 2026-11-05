// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type WarmupSetting = {
  key: LongIdKey
  type: number
  targetStringAlpha: string
  targetStringBravo: string
  targetStringCharlie: string
  targetStringDelta: string
  targetStringEcho: string
  targetStringArrayAlpha: string[]
  enabled: boolean
  remark: string
}

export type InsertWarmupSetting = Omit<WarmupSetting, 'key'> & { key: LongIdKey | null }

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `warmup-setting/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<WarmupSetting> {
  return http.generalClient().get('settingrepo', `warmup-setting/${key.long_id}/`, {}, 'json')
}

export function insert(warmupSetting: InsertWarmupSetting): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('settingrepo', 'warmup-setting/', warmupSetting, 'application/json;charset=UTF-8')
}

export function update(warmupSetting: WarmupSetting): Pres<null> {
  return http
    .generalClient()
    .patch('settingrepo', 'warmup-setting/', warmupSetting, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('settingrepo', `warmup-setting/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<WarmupSetting> {
  return http.generalClient().get(
    'settingrepo',
    'warmup-setting/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function enabled(pagingInfo: PagingInfo): Prespa<WarmupSetting> {
  return http.generalClient().get(
    'settingrepo',
    'warmup-setting/enabled/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
