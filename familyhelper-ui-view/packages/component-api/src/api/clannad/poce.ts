// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { DispCertificate } from './certificate'
import { DispAccount } from '../system/account'

export type PoceKey = {
  certificate_id: string
  user_id: string
}

export type Poce = {
  key: PoceKey
  permission_level: number
  remark: string
}

export type DispPoce = Poce & {
  account_book: DispCertificate
  account: DispAccount
}

export function exists(key: PoceKey): Pres<boolean> {
  return http
    .generalClient()
    .get('clannad', `poce/${key.certificate_id}%26${key.user_id}/exists/`, {}, 'json')
}

export function inspect(key: PoceKey): Pres<Poce> {
  return http
    .generalClient()
    .get('clannad', `poce/${key.certificate_id}%26${key.user_id}/`, {}, 'json')
}

export function inspectDisp(key: PoceKey): Pres<DispPoce> {
  return http
    .generalClient()
    .get('clannad', `poce/${key.certificate_id}%26${key.user_id}/disp/`, {}, 'json')
}

export function childForCertificate(
  certificateKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<Poce> {
  return http.generalClient().get(
    'clannad',
    `certificate/${certificateKey.long_id}/poce/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForCertificateDisp(
  certificateKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispPoce> {
  return http.generalClient().get(
    'clannad',
    `certificate/${certificateKey.long_id}/poce/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
