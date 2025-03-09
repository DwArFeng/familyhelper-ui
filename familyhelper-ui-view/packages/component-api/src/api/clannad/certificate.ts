// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey, StringIdKey } from '../subgrade/key'
import type { Pres, Prespa } from '../../util/response'
import type { PagingInfo } from '../../util/request'

import { DispAccount } from '../system/account'

export type Certificate = {
  key: LongIdKey
  name: string
  remark: string
}

export type DispCertificate = Certificate & {
  owner_account: DispAccount
  permission_level: number
}

export type CertificateCreateInfo = {
  name: string
  remark: string
}

export type CertificateUpdateInfo = {
  certificate_key: LongIdKey
  name: string
  remark: string
}

export type CertificatePermissionUpsertInfo = {
  certificate_key: LongIdKey
  user_key: StringIdKey
  permission_level: number
}

export type CertificatePermissionRemoveInfo = {
  certificate_key: LongIdKey
  user_key: StringIdKey
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('clannad', `certificate/${key.long_id}/exists/`, {}, 'blob')
}

export function inspect(key: LongIdKey): Pres<Certificate> {
  return http.generalClient().get('clannad', `certificate/${key.long_id}/`, {}, 'blob')
}

export function all(pagingInfo: PagingInfo): Prespa<Certificate> {
  return http.generalClient().get(
    'clannad',
    'certificate/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function allPermitted(pagingInfo: PagingInfo): Prespa<Certificate> {
  return http.generalClient().get(
    'clannad',
    'certificate/all-permitted/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function allOwned(pagingInfo: PagingInfo): Prespa<Certificate> {
  return http.generalClient().get(
    'clannad',
    'certificate/all-owned/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispCertificate> {
  return http.generalClient().get('clannad', `certificate/${key.long_id}/disp/`, {}, 'json')
}

export function allPermittedDisp(pagingInfo: PagingInfo): Prespa<DispCertificate> {
  return http.generalClient().get(
    'clannad',
    'certificate/all-permitted/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function allOwnedDisp(pagingInfo: PagingInfo): Prespa<DispCertificate> {
  return http.generalClient().get(
    'clannad',
    'certificate/all-owned/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: CertificateCreateInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'certificate/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: CertificateUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'certificate/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'certificate/remove', key, 'application/json;charset=UTF-8')
}

export function upsertPermission(upsertInfo: CertificatePermissionUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'certificate/upsert-permission', upsertInfo, 'application/json;charset=UTF-8')
}

export function removePermission(removeInfo: CertificatePermissionRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'certificate/remove-permission', removeInfo, 'application/json;charset=UTF-8')
}
