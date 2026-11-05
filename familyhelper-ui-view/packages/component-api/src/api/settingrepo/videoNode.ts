// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { Base64 } from 'js-base64'

export type VideoNode = {
  key: StringIdKey
  origin_name: string
  length: number
}

export type VideoNodeInspectInfo = {
  category: string
  args: string[]
}

export type VideoNodeInspectResult = {
  origin_name: string
  length: number
}

export type VideoNodeFileDownloadInfo = {
  category: string
  args: string[]
}

export type VideoNodeThumbnailDownloadInfo = {
  category: string
  args: string[]
}

type PublicVideoNodeInspectInfo = {
  category: string
  args: string[]
}

type PublicVideoNodeFileDownloadInfo = {
  category: string
  args: string[]
}

type PublicVideoNodeThumbnailDownloadInfo = {
  category: string
  args: string[]
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('settingrepo', `video-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<VideoNode> {
  return http.generalClient().get('settingrepo', `video-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<VideoNode> {
  return http.generalClient().get(
    'settingrepo',
    'video-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateInspect(
  inspectInfo: VideoNodeInspectInfo,
): Pres<VideoNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(downloadInfo: VideoNodeFileDownloadInfo): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'video-node/download-file/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucher(
  downloadInfo: VideoNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'video-node/request-file-stream-voucher/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadFileByVoucher(voucherId: LongIdKey): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'video-node/download-file-by-voucher/',
    {
      'voucher-id': voucherId.long_id,
    },
    'blob',
  )
}

export function downloadThumbnail(
  downloadInfo: VideoNodeThumbnailDownloadInfo,
): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'video-node/download-thumbnail/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function upload(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-node/upload/', formData, 'multipart/form-data')
}

export function uploadStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-node/upload-stream/', formData, 'multipart/form-data')
}

export function inspectForPublic(
  inspectInfo: PublicVideoNodeInspectInfo,
): Pres<VideoNodeInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'video-node/inspect-for-public/',
      inspectInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadFileForPublic(
  downloadInfo: PublicVideoNodeFileDownloadInfo,
): Promise<Blob | null> {
  return http.publicClient().get(
    'settingrepo',
    'video-node/download-file-for-public/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucherForPublic(
  downloadInfo: PublicVideoNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'video-node/request-file-stream-voucher-for-public/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadThumbnailForPublic(
  downloadInfo: PublicVideoNodeThumbnailDownloadInfo,
): Promise<Blob | null> {
  return http.publicClient().get(
    'settingrepo',
    'video-node/download-thumbnail-for-public/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}
