// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { Base64 } from 'js-base64'

export type VideoListNode = {
  key: StringIdKey
  size: number
}

export type VideoListNodeSizeInfo = {
  category: string
  args: string[]
}

export type VideoListNodeSizeResult = {
  size: number
}

export type VideoListNodeInspectInfo = {
  category: string
  args: string[]
}

export type VideoListNodeInspectResult = {
  items: VideoListNodeInspectResultItem[]
}

export type VideoListNodeInspectResultItem = {
  null_flag: boolean
  origin_name: string
  length: number
}

export type VideoListNodeFileDownloadInfo = {
  category: string
  args: string[]
  index: number
}

export type VideoListNodeThumbnailDownloadInfo = {
  category: string
  args: string[]
  index: number
}

export type VideoListNodeChangeOrderInfo = {
  category: string
  args: string[]
  old_index: number
  neo_index: number
}

export type VideoListNodeRemoveInfo = {
  category: string
  args: string[]
  index: number
}

export type PublicVideoListNodeSizeInfo = {
  category: string
  args: string[]
}

export type PublicVideoListNodeInspectInfo = {
  category: string
  args: string[]
}

export type PublicVideoListNodeFileDownloadInfo = {
  category: string
  args: string[]
  index: number
}

export type PublicVideoListNodeThumbnailDownloadInfo = {
  category: string
  args: string[]
  index: number
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `video-list-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<VideoListNode> {
  return http.generalClient().get('settingrepo', `video-list-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<VideoListNode> {
  return http.generalClient().get(
    'settingrepo',
    'video-list-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateSize(sizeInfo: VideoListNodeSizeInfo): Pres<VideoListNodeSizeResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-list-node/size/', sizeInfo, 'application/json;charset=UTF-8')
}

export function operateInspect(
  inspectInfo: VideoListNodeInspectInfo,
): Pres<VideoListNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-list-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(downloadInfo: VideoListNodeFileDownloadInfo): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'video-list-node/download-file/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucher(
  downloadInfo: VideoListNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'video-list-node/request-file-stream-voucher/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadFileByVoucher(voucherId: LongIdKey): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'video-list-node/download-file-by-voucher/',
    {
      'voucher-id': voucherId.long_id,
    },
    'blob',
  )
}

export function downloadThumbnail(
  downloadInfo: VideoListNodeThumbnailDownloadInfo,
): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'video-list-node/download-thumbnail/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function upload(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-list-node/upload/', formData, 'multipart/form-data')
}

export function uploadStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-list-node/upload-stream/', formData, 'multipart/form-data')
}

export function update(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-list-node/update/', formData, 'multipart/form-data')
}

export function updateStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-list-node/update-stream/', formData, 'multipart/form-data')
}

export function operateChangeOrder(changeOrderInfo: VideoListNodeChangeOrderInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'video-list-node/change-order/',
      changeOrderInfo,
      'application/json;charset=UTF-8',
    )
}

export function operateRemove(removeInfo: VideoListNodeRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'video-list-node/remove/', removeInfo, 'application/json;charset=UTF-8')
}

export function sizeForPublic(
  sizeInfo: PublicVideoListNodeSizeInfo,
): Pres<VideoListNodeSizeResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'video-list-node/size-for-public/',
      sizeInfo,
      'application/json;charset=UTF-8',
    )
}

export function inspectForPublic(
  inspectInfo: PublicVideoListNodeInspectInfo,
): Pres<VideoListNodeInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'video-list-node/inspect-for-public/',
      inspectInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadFileForPublic(
  downloadInfo: PublicVideoListNodeFileDownloadInfo,
): Promise<Blob | null> {
  return http.publicClient().get(
    'settingrepo',
    'video-list-node/download-file-for-public/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucherForPublic(
  downloadInfo: PublicVideoListNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'video-list-node/request-file-stream-voucher-for-public/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadThumbnailForPublic(
  downloadInfo: PublicVideoListNodeThumbnailDownloadInfo,
): Promise<Blob | null> {
  return http.publicClient().get(
    'settingrepo',
    'video-list-node/download-thumbnail-for-public/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}
