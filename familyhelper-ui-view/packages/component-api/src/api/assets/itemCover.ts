// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

export type ItemCoverInfo = {
  key: LongIdKey
  item_key: LongIdKey | null
  origin_name: string
  length: number
  created_date: number
  modified_date: number
  remark: string
  index: number
}

export type ItemCoverOrderUpdateInfo = {
  item_cover_keys: LongIdKey[]
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('assets', `item-cover/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<ItemCoverInfo> {
  return http.generalClient().get('assets', `item-cover/${key.long_id}/`, {}, 'json')
}

export function childForItem(itemKey: LongIdKey, pagingInfo: PagingInfo): Prespa<ItemCoverInfo> {
  return http.generalClient().get(
    'assets',
    `item/${itemKey.long_id}/item-cover/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function download(key: LongIdKey): Promise<Blob> {
  return http.generalClient().get('assets', `item-cover/${key.long_id}/download/`, {}, 'blob')
}

export function upload(itemKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('assets', `item/${itemKey.long_id}/item-cover/upload/`, formData, 'multipart/form-data')
}

export function remove(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('assets', 'item-cover/remove/', key, 'application/json;charset=UTF-8')
}

export function updateOrder(info: ItemCoverOrderUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('assets', 'item-cover/update-order/', info, 'application/json;charset=UTF-8')
}
