// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { LongIdKey, StringIdKey } from '../subgrade/key'
import type { Pres } from '../../util/response'

export type DynamicLoginInfo = {
  account_key: StringIdKey
  password: string
  remark: string
  extra_params: Record<string, string>
}

export type DynamicLoginResponse = {
  account_id: string
  token: string
  expire_date: number
}

export type StaticLoginInfo = {
  account_key: StringIdKey
  password: string
  expire_date: number
  remark: string
  extra_params: Record<string, string>
}

export type StaticLoginResponse = {
  account_id: string
  token: string
  expire_date: number
}

export type LoginResponse = {
  account_id: string
  token: string
  expire_date: number
}

export function dynamicLogin(dynamicLoginInfo: DynamicLoginInfo): Pres<DynamicLoginResponse> {
  return http
    .generalClient()
    .post('system', 'login/dynamic-login', dynamicLoginInfo, 'application/json;charset=UTF-8')
}

export function staticLogin(staticLoginInfo: StaticLoginInfo): Pres<StaticLoginResponse> {
  return http
    .generalClient()
    .post('system', 'login/static-login', staticLoginInfo, 'application/json;charset=UTF-8')
}

export function postpone(loginStateKey: LongIdKey): Pres<LoginResponse> {
  return http
    .generalClient()
    .post('system', 'login/postpone', loginStateKey, 'application/json;charset=UTF-8')
}

export function logout(loginStateKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('system', 'login/logout', loginStateKey, 'application/json;charset=UTF-8')
}
