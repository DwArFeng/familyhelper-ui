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

type PublicImageNodeInspectInfo = {
  category: string
  args: string[]
}

type PublicImageNodeFileDownloadInfo = {
  category: string
  args: string[]
}

type PublicImageNodeThumbnailDownloadInfo = {
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

export function operateInspect(
  inspectInfo: ImageNodeInspectInfo,
): Pres<ImageNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'image-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(downloadInfo: ImageNodeFileDownloadInfo): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'image-node/download-file/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucher(
  downloadInfo: ImageNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'image-node/request-file-stream-voucher/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadThumbnail(
  downloadInfo: ImageNodeThumbnailDownloadInfo,
): Promise<Blob | null> {
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

export function inspectForPublic(
  inspectInfo: PublicImageNodeInspectInfo,
): Pres<ImageNodeInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'image-node/inspect-for-public/',
      inspectInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadFileForPublic(
  downloadInfo: PublicImageNodeFileDownloadInfo,
): Promise<Blob | null> {
  return http.publicClient().get(
    'settingrepo',
    'image-node/download-file-for-public/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucherForPublic(
  downloadInfo: PublicImageNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'image-node/request-file-stream-voucher-for-public/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadThumbnailForPublic(
  downloadInfo: PublicImageNodeThumbnailDownloadInfo,
): Promise<Blob | null> {
  return http.publicClient().get(
    'settingrepo',
    'image-node/download-thumbnail-for-public/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}
