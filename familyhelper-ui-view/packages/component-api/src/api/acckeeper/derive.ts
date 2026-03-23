// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres } from '../../util/response'

import { type DeriveResponseCode } from './deriveHistory'

export type WebInputDynamicDeriveInfo = {
  login_state_key: StringIdKey
  remark?: string
}

export type WebInputStaticDeriveInfo = {
  login_state_key: StringIdKey
  expire_date: number
  remark?: string
}

export type DynamicDeriveResult = {
  login_state_key: StringIdKey
  account_key: StringIdKey
  expire_date: number
  generated_date: number
  type: DeriveResponseCode
  remark: string
}

export type StaticDeriveResult = {
  login_state_key: StringIdKey
  account_key: StringIdKey
  expire_date: number
  generated_date: number
  type: DeriveResponseCode
  remark: string
}

export function dynamicDerive(webInput: WebInputDynamicDeriveInfo): Pres<DynamicDeriveResult> {
  return http
    .generalClient()
    .post('acckeeper', 'derive/dynamic-derive/', webInput, 'application/json;charset=UTF-8')
}

export function staticDerive(webInput: WebInputStaticDeriveInfo): Pres<StaticDeriveResult> {
  return http
    .generalClient()
    .post('acckeeper', 'derive/static-derive/', webInput, 'application/json;charset=UTF-8')
}
