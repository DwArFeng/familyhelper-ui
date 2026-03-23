// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres } from '../../util/response'

import { type LoginResponseCode } from './loginHistory'

export type DynamicLoginInfo = {
  account_key: StringIdKey
  password: string
  remark?: string
  extra_params?: Record<string, string>
}

export type StaticLoginInfo = {
  account_key: StringIdKey
  password: string
  expire_date: number
  remark?: string
  extra_params?: Record<string, string>
}

export type LogoutInfo = {
  login_state_key: StringIdKey
}

export type PostponeInfo = {
  login_state_key: StringIdKey
}

export type LoginResult = {
  login_state_key: StringIdKey
  account_key: StringIdKey
  expire_date: number
  generated_date: number
  type: LoginResponseCode
  remark: string
}

export function dynamicLogin(info: DynamicLoginInfo): Pres<LoginResult> {
  return http
    .publicClient()
    .post('acckeeper', 'access/dynamic-login/', info, 'application/json;charset=UTF-8')
}

export function staticLogin(info: StaticLoginInfo): Pres<LoginResult> {
  return http
    .publicClient()
    .post('acckeeper', 'access/static-login/', info, 'application/json;charset=UTF-8')
}

export function logout(info: LogoutInfo): Pres<null> {
  return http
    .generalClient()
    .post('acckeeper', 'access/logout/', info, 'application/json;charset=UTF-8')
}

export function postpone(info: PostponeInfo): Pres<LoginResult> {
  return http
    .generalClient()
    .post('acckeeper', 'access/postpone/', info, 'application/json;charset=UTF-8')
}
