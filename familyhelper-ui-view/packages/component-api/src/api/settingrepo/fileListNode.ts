// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { Base64 } from 'js-base64'

export type FileListNode = {
  key: StringIdKey
  size: number
}

export type FileListNodeSizeInfo = {
  category: string
  args: string[]
}

export type FileListNodeSizeResult = {
  size: number
}

export type FileListNodeInspectInfo = {
  category: string
  args: string[]
}

export type FileListNodeInspectResult = {
  items: FileListNodeInspectResultItem[]
}

export type FileListNodeInspectResultItem = {
  null_flag: boolean
  origin_name: string
  length: number
}

export type FileListNodeFileDownloadInfo = {
  category: string
  args: string[]
  index: number
}

export type FileListNodeChangeOrderInfo = {
  category: string
  args: string[]
  old_index: number
  neo_index: number
}

export type FileListNodeRemoveInfo = {
  category: string
  args: string[]
  index: number
}

export type PublicFileListNodeSizeInfo = {
  category: string
  args: string[]
}

export type PublicFileListNodeInspectInfo = {
  category: string
  args: string[]
}

export type PublicFileListNodeFileDownloadInfo = {
  category: string
  args: string[]
  index: number
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `file-list-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<FileListNode> {
  return http.generalClient().get('settingrepo', `file-list-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<FileListNode> {
  return http.generalClient().get(
    'settingrepo',
    'file-list-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function size(sizeInfo: FileListNodeSizeInfo): Pres<FileListNodeSizeResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-list-node/size/', sizeInfo, 'application/json;charset=UTF-8')
}

export function operateInspect(
  inspectInfo: FileListNodeInspectInfo,
): Pres<FileListNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-list-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(downloadInfo: FileListNodeFileDownloadInfo): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'file-list-node/download-file/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucher(
  downloadInfo: FileListNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'file-list-node/request-file-stream-voucher/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function upload(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-list-node/upload/', formData, 'multipart/form-data')
}

export function uploadStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-list-node/upload-stream/', formData, 'multipart/form-data')
}

export function update(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-list-node/update/', formData, 'multipart/form-data')
}

export function updateStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-list-node/update-stream/', formData, 'multipart/form-data')
}

export function changeOrder(changeOrderInfo: FileListNodeChangeOrderInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'file-list-node/change-order/',
      changeOrderInfo,
      'application/json;charset=UTF-8',
    )
}

export function remove(removeInfo: FileListNodeRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-list-node/remove/', removeInfo, 'application/json;charset=UTF-8')
}

export function sizeForPublic(
  sizeInfo: PublicFileListNodeSizeInfo,
): Pres<FileListNodeSizeResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'file-list-node/size-for-public/',
      sizeInfo,
      'application/json;charset=UTF-8',
    )
}

export function inspectForPublic(
  inspectInfo: PublicFileListNodeInspectInfo,
): Pres<FileListNodeInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'file-list-node/inspect-for-public/',
      inspectInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadFileForPublic(
  downloadInfo: PublicFileListNodeFileDownloadInfo,
): Promise<Blob | null> {
  return http.publicClient().get(
    'settingrepo',
    'file-list-node/download-file-for-public/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucherForPublic(
  downloadInfo: PublicFileListNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'file-list-node/request-file-stream-voucher-for-public/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}
