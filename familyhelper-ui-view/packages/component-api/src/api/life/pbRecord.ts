// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type PbRecord = {
  key: LongIdKey
  item_key: LongIdKey
  value: number | null
  recorded_date: number
  remark: string
}

export type PbRecordCreateInfo = {
  itemKey: LongIdKey
  value: number | null
  remark: string
}

export type PbRecordUpdateInfo = {
  key: LongIdKey
  value: number | null
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('life', `pb-record/${key.long_id}/exists`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<PbRecord> {
  return http.generalClient().get('life', `pb-record/${key.long_id}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<PbRecord> {
  return http.generalClient().get(
    'life',
    'pb-record/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbItemRecordedDateAsc(
  pbItemKey: LongIdKey | null,
  pagingInfo: PagingInfo,
): Prespa<PbRecord> {
  const path = pbItemKey
    ? `pb-item/${pbItemKey.long_id}/pb-record/recorded-date-asc`
    : 'pb-item//pb-record/recorded-date-asc'
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

export function childForPbItemRecordedDateDesc(
  pbItemKey: LongIdKey | null,
  pagingInfo: PagingInfo,
): Prespa<PbRecord> {
  const path = pbItemKey
    ? `pb-item/${pbItemKey.long_id}/pb-record/recorded-date-desc`
    : 'pb-item//pb-record/recorded-date-desc'
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

export function createPbRecord(createInfo: PbRecordCreateInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('life', 'pb-record/create', createInfo, 'application/json;charset=UTF-8')
}

export function updatePbRecord(updateInfo: PbRecordUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('life', 'pb-record/update', updateInfo, 'application/json;charset=UTF-8')
}

export function removePbRecord(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('life', 'pb-record/remove', key, 'application/json;charset=UTF-8')
}
