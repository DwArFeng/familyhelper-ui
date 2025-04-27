// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type CertificateFileInfo = {
  key: LongIdKey
  certificate_key: LongIdKey
  origin_name: string
  length: number
  upload_date: number
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('clannad', `certificate-file/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<CertificateFileInfo> {
  return http.generalClient().get('clannad', `certificate-file/${key.long_id}/`, {}, 'json')
}

export function childForCertificate(
  certificateKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<CertificateFileInfo> {
  return http.generalClient().get(
    'clannad',
    `certificate/${certificateKey.long_id}/certificate-file/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function downloadFile(key: LongIdKey): Promise<Blob> {
  return http
    .generalClient()
    .get('clannad', `certificate-file/${key.long_id}/download-file/`, {}, 'blob')
}

export function requestCertificateFileStreamVoucher(
  certificateFileKey: LongIdKey,
): Pres<LongIdKey> {
  return http
    .generalClient()
    .post(
      'clannad',
      `certificate-file/${certificateFileKey.long_id}/request-certificate-file-stream-voucher/`,
      {},
      'application/json;charset=UTF-8',
    )
}

export function downloadThumbnail(key: LongIdKey): Promise<Blob> {
  return http
    .generalClient()
    .get('clannad', `certificate-file/${key.long_id}/download-thumbnail/`, {}, 'json')
}

export function upload(certificateKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'clannad',
      `certificate/${certificateKey.long_id}/certificate-file/upload/`,
      formData,
      'multipart/form-data',
    )
}

export function uploadStream(certificateKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'clannad',
      `certificate/${certificateKey.long_id}/certificate-file/upload-stream/`,
      formData,
      'multipart/form-data',
    )
}

export function remove(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'certificate-file/remove/', key, 'application/json;charset=UTF-8')
}
