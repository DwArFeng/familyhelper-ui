// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type ItemFileInfo = {
  key: LongIdKey
  item_key: LongIdKey | null
  origin_name: string
  length: number
  created_date: number
  modified_date: number
  inspected_date: number
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('assets', `item-file/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<ItemFileInfo> {
  return http.generalClient().get('assets', `item-file/${key.long_id}/`, {}, 'json')
}

export function childForItem(itemKey: LongIdKey, pagingInfo: PagingInfo): Prespa<ItemFileInfo> {
  return http.generalClient().get(
    'assets',
    `item/${itemKey.long_id}/item-file/default/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForItemInspectedDateDesc(
  itemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<ItemFileInfo> {
  return http.generalClient().get(
    'assets',
    `item/${itemKey.long_id}/item-file/inspected-date-desc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForItemModifiedDateDesc(
  itemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<ItemFileInfo> {
  return http.generalClient().get(
    'assets',
    `item/${itemKey.long_id}/item-file/modified-date-desc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForItemOriginNameAsc(
  itemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<ItemFileInfo> {
  return http.generalClient().get(
    'assets',
    `item/${itemKey.long_id}/item-file/origin-name-asc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForItemCreatedDateAsc(
  itemKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<ItemFileInfo> {
  return http.generalClient().get(
    'assets',
    `item/${itemKey.long_id}/item-file/created-date-asc/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function download(key: LongIdKey): Promise<Blob> {
  return http.generalClient().get('assets', `item-file/${key.long_id}/download/`, {}, 'blob')
}

export function requestItemFileStreamVoucher(itemFileKey: LongIdKey): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'assets',
      `item-file/${itemFileKey.long_id}/request-item-file-stream-voucher/`,
      {},
      'application/json;charset=UTF-8',
    )
}

export function upload(itemKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('assets', `item/${itemKey.long_id}/item-file/upload/`, formData, 'multipart/form-data')
}

export function uploadStream(itemKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'assets',
      `item/${itemKey.long_id}/item-file/upload-stream/`,
      formData,
      'multipart/form-data',
    )
}

export function update(itemFileKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('assets', `/item-file/${itemFileKey.long_id}/update/`, formData, 'multipart/form-data')
}

export function updateStream(itemFileKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'assets',
      `/item-file/${itemFileKey.long_id}/update-stream/`,
      formData,
      'multipart/form-data',
    )
}

export function remove(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('assets', 'item-file/remove/', key, 'application/json;charset=UTF-8')
}
