// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type PbFileInfo = {
  key: LongIdKey
  record_key: LongIdKey
  origin_name: string
  length: number
  uploaded_date: number
  inspected_date: number | null
  remark: string
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('life', `pb-file/${key.long_id}/exists`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<PbFileInfo> {
  return http.generalClient().get('life', `pb-file/${key.long_id}`, {}, 'json')
}

export function childForPbRecord(
  pbRecordKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<PbFileInfo> {
  return http.generalClient().get(
    'life',
    `pb-record/${pbRecordKey.long_id}/pb-file/default`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbRecordInspectedDateDesc(
  pbRecordKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<PbFileInfo> {
  return http.generalClient().get(
    'life',
    `pb-record/${pbRecordKey.long_id}/pb-file/inspected-date-desc`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbRecordOriginNameAsc(
  pbRecordKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<PbFileInfo> {
  return http.generalClient().get(
    'life',
    `pb-record/${pbRecordKey.long_id}/pb-file/origin-name-asc`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForPbRecordUploadedDateAsc(
  pbRecordKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<PbFileInfo> {
  return http.generalClient().get(
    'life',
    `pb-record/${pbRecordKey.long_id}/pb-file/uploaded-date-asc`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function downloadPbFile(pbFileKey: LongIdKey): Promise<Blob | null> {
  return http.generalClient().get('life', `pb-file/${pbFileKey.long_id}/download`, {}, 'blob')
}

export function uploadPbFile(pbRecordKey: LongIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post(
      'life',
      `pb-record/${pbRecordKey.long_id}/pb-file/upload`,
      formData,
      'multipart/form-data',
    )
}

export function removePbFile(key: LongIdKey): Pres<null> {
  return http.generalClient().post('life', 'pb-file/remove', key, 'application/json;charset=UTF-8')
}
