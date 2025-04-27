// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { Base64 } from 'js-base64'

export type ImageNode = {
  key: StringIdKey
  origin_name: string
  store_name: string
  length: number
}

export type ImageNodeInspectInfo = {
  category: string
  args: string[]
}

export type ImageNodeInspectResult = {
  origin_name: string
  length: number
}

export type ImageNodeFileDownloadInfo = {
  category: string
  args: string[]
}

export type ImageNodeThumbnailDownloadInfo = {
  category: string
  args: string[]
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('settingrepo', `image-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<ImageNode> {
  return http.generalClient().get('settingrepo', `image-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<ImageNode> {
  return http.generalClient().get(
    'settingrepo',
    'image-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateInspect(inspectInfo: ImageNodeInspectInfo): Pres<ImageNodeInspectResult> {
  return http
    .generalClient()
    .post('settingrepo', 'image-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(downloadInfo: ImageNodeFileDownloadInfo): Promise<Blob> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'image-node/download-file/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function requestFileStreamVoucher(downloadInfo: ImageNodeFileDownloadInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'image-node/request-file-stream-voucher/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadThumbnail(downloadInfo: ImageNodeThumbnailDownloadInfo): Promise<Blob> {
  return http.generalClient().get(
    'settingrepo',
    'image-node/download-thumbnail/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function upload(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'image-node/upload/', formData, 'multipart/form-data')
}

export function uploadStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'image-node/upload-stream/', formData, 'multipart/form-data')
}
