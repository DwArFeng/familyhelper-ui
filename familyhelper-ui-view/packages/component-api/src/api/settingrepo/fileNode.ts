// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { Base64 } from 'js-base64'

export type FileNode = {
  key: StringIdKey
  origin_name: string
  store_name: string
  length: number
}

export type FileNodeInspectInfo = {
  category: string
  args: string[]
}

export type FileNodeInspectResult = {
  origin_name: string
  length: number
}

export type FileNodeFileDownloadInfo = {
  category: string
  args: string[]
}

export type PublicFileNodeInspectInfo = {
  category: string
  args: string[]
}

export type PublicFileNodeFileDownloadInfo = {
  category: string
  args: string[]
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('settingrepo', `file-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<FileNode> {
  return http.generalClient().get('settingrepo', `file-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<FileNode> {
  return http.generalClient().get(
    'settingrepo',
    'file-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateInspect(
  inspectInfo: FileNodeInspectInfo,
): Pres<FileNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function downloadFile(downloadInfo: FileNodeFileDownloadInfo): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'file-node/download-file/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucher(
  downloadInfo: FileNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'file-node/request-file-stream-voucher/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function upload(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-node/upload/', formData, 'multipart/form-data')
}

export function uploadStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'file-node/upload-stream/', formData, 'multipart/form-data')
}

export function inspectForPublic(
  inspectInfo: PublicFileNodeInspectInfo,
): Pres<FileNodeInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'file-node/inspect-for-public/',
      inspectInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadFileForPublic(
  downloadInfo: PublicFileNodeFileDownloadInfo,
): Promise<Blob | null> {
  return http.publicClient().get(
    'settingrepo',
    'file-node/download-file-for-public/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestFileStreamVoucherForPublic(
  downloadInfo: PublicFileNodeFileDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'file-node/request-file-stream-voucher-for-public/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}
