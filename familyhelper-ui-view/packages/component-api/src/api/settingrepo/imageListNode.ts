// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { Base64 } from 'js-base64'

export type ImageListNode = {
  key: StringIdKey
  size: number
}

export type ImageListNodeSizeInfo = {
  category: string
  args: string[]
}

export type ImageListNodeSizeResult = {
  size: number
}

export type ImageListNodeInspectInfo = {
  category: string
  args: string[]
}

export type ImageListNodeInspectResult = {
  items: ImageListNodeInspectResultItem[]
}

export type ImageListNodeInspectResultItem = {
  null_flag: boolean
  origin_name: string
  length: number
}

export type ImageListNodeFileDownloadInfo = {
  category: string
  args: string[]
  index: number
}

export type ImageListNodeThumbnailDownloadInfo = {
  category: string
  args: string[]
  index: number
}

export type ImageListNodeChangeOrderInfo = {
  category: string
  args: string[]
  old_index: number
  neo_index: number
}

export type ImageListNodeRemoveInfo = {
  category: string
  args: string[]
  index: number
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `image-list-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<ImageListNode> {
  return http.generalClient().get('settingrepo', `image-list-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ImageListNode> {
  return http.generalClient().get(
    'settingrepo',
    'image-list-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function size(sizeInfo: ImageListNodeSizeInfo): Pres<ImageListNodeSizeResult> {
  return http
    .generalClient()
    .post('settingrepo', 'image-list-node/size/', sizeInfo, 'application/json;charset=UTF-8')
}

export function operateInspect(
  inspectInfo: ImageListNodeInspectInfo,
): Pres<ImageListNodeInspectResult> {
  return http
    .generalClient()
    .post('settingrepo', 'image-list-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(downloadInfo: ImageListNodeFileDownloadInfo): Promise<Blob> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'image-list-node/download-file/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function requestFileStreamVoucher(
  downloadInfo: ImageListNodeFileDownloadInfo,
): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'image-list-node/request-file-stream-voucher/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadThumbnail(downloadInfo: ImageListNodeThumbnailDownloadInfo): Promise<Blob> {
  return http.generalClient().get(
    'settingrepo',
    'image-list-node/download-thumbnail/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function upload(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'image-list-node/upload/', formData, 'multipart/form-data')
}

export function uploadStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'image-list-node/upload-stream/', formData, 'multipart/form-data')
}

export function update(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'image-list-node/update/', formData, 'multipart/form-data')
}

export function updateStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'image-list-node/update-stream/', formData, 'multipart/form-data')
}

export function changeOrder(changeOrderInfo: ImageListNodeChangeOrderInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'image-list-node/change-order/',
      changeOrderInfo,
      'application/json;charset=UTF-8',
    )
}

export function remove(removeInfo: ImageListNodeRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'image-list-node/remove/', removeInfo, 'application/json;charset=UTF-8')
}
