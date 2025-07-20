// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type BillFile = {
  key: LongIdKey
  fund_change_key: LongIdKey
  origin_name: string
  index: number
  length: number
  created_date: number
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('finance', `bill-file/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<BillFile> {
  return http.generalClient().get('finance', `bill-file/${key.long_id}/`, {}, 'json')
}

export function childForFundChange(
  fundChangeKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<BillFile> {
  return http.generalClient().get(
    'finance',
    `fund-change/${fundChangeKey.long_id}/bill-file/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForFundChangeIndexAsc(
  fundChangeKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<BillFile> {
  return http.generalClient().get(
    'finance',
    `fund-change/${fundChangeKey.long_id}/bill-file/index-asc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function download(key: LongIdKey): Promise<Blob> {
  return http.generalClient().get('finance', `bill-file/${key.long_id}/download/`, {}, 'blob')
}

export function upload(fundChangeKey: LongIdKey, formData: FormData): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'finance',
      `fund-change/${fundChangeKey.long_id}/bill-file/upload/`,
      formData,
      'multipart/form-data',
    )
}

export function remove(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'bill-file/remove/', key, 'application/json;charset=UTF-8')
}
