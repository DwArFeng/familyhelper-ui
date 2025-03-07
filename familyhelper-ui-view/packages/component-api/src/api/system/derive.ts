// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey } from '../subgrade/key'
import type { Pres } from '../../util/response'

export type DynamicDeriveInfo = {
  login_state_key: LongIdKey
  remark: string
}

export type DeriveResponse = {
  account_id: string
  token: string
  expire_date: number
}

export type StaticDeriveInfo = {
  login_state_key: LongIdKey
  expire_date: number
  remark: string
}

export type StaticDeriveResponse = {
  account_id: string
  token: string
  expire_date: number
}

export function dynamicDerive(dynamicDeriveInfo: DynamicDeriveInfo): Pres<DeriveResponse> {
  return http
    .generalClient()
    .post('system', 'derive/dynamic-derive', dynamicDeriveInfo, 'application/json;charset=UTF-8')
}

export function staticDerive(staticDeriveInfo: StaticDeriveInfo): Pres<StaticDeriveResponse> {
  return http
    .generalClient()
    .post('system', 'derive/static-derive', staticDeriveInfo, 'application/json;charset=UTF-8')
}
