// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey, type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { Base64 } from 'js-base64'

export type LongTextNode = {
  key: StringIdKey
}

export type LongTextNodeInspectInfo = {
  category: string
  args: string[]
}

export type LongTextNodeInspectResult = {
  null_flag: boolean
  preview: string
  length: number
}

export type LongTextNodeTextDownloadInfo = {
  category: string
  args: string[]
}

export type PublicLongTextNodeTextDownloadInfo = {
  category: string
  args: string[]
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `long-text-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<LongTextNode> {
  return http.generalClient().get('settingrepo', `long-text-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<LongTextNode> {
  return http.generalClient().get(
    'settingrepo',
    'long-text-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function operateInspect(
  inspectInfo: LongTextNodeInspectInfo,
): Pres<LongTextNodeInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'long-text-node/inspect/', inspectInfo, 'application/json;charset=UTF-8')
}

export function downloadText(downloadInfo: LongTextNodeTextDownloadInfo): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'long-text-node/download-text/',
    {
      'download-info': Base64.encode(JSON.stringify(downloadInfo)),
    },
    'blob',
  )
}

export function requestTextStreamVoucher(
  downloadInfo: LongTextNodeTextDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'long-text-node/request-text-stream-voucher/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}

export function downloadTextByVoucher(voucherId: LongIdKey): Promise<Blob | null> {
  return http.generalClient().get(
    'settingrepo',
    'long-text-node/download-text-by-voucher/',
    {
      'voucher-id': voucherId.long_id,
    },
    'blob',
  )
}

export function upload(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'long-text-node/upload/', formData, 'multipart/form-data')
}

export function uploadStream(formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'long-text-node/upload-stream/', formData, 'multipart/form-data')
}

export function requestTextStreamVoucherForPublic(
  downloadInfo: PublicLongTextNodeTextDownloadInfo,
): Pres<LongIdKey | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'long-text-node/request-text-stream-voucher-for-public/',
      downloadInfo,
      'application/json;charset=UTF-8',
    )
}
