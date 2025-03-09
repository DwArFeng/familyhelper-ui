// noinspection NpmUsedModulesInstalled,JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { Pres } from '../../util/response'

export type AvatarInfo = {
  key: StringIdKey
  origin_name: string
  length: number
  upload_date: number
  remark: string
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('clannad', `avatar/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<AvatarInfo> {
  return http.generalClient().get('clannad', `avatar/${key.string_id}/`, {}, 'json')
}

export function download(key: StringIdKey): Promise<Blob> {
  return http.generalClient().get('clannad', `avatar/${key.string_id}/download/`, {}, 'blob')
}

export function upload(key: StringIdKey, formData: FormData): Pres<null> {
  return http
    .generalClient()
    .post('clannad', `avatar/${key.string_id}/upload/`, formData, 'multipart/form-data')
}
