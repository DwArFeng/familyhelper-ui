// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

import { type StringIdKey } from '../subgrade/key'

export type LoginStateTypeDynamic = 0
export type LoginStateTypeStatic = 10
export type LoginStateType = LoginStateTypeDynamic | LoginStateTypeStatic

export type LoginInfo = {
  account_key: StringIdKey
  password: string
}

export type LoginResult = {
  login_state_key: StringIdKey
  account_key: StringIdKey
  expire_date: number
  generated_date: number
  type: LoginStateType
  remark: string
}

export type LogoutInfo = {
  login_state_key: StringIdKey
}

export type PostponeInfo = {
  login_state_key: StringIdKey
}

export type PostponeResult = {
  login_state_key: StringIdKey
  account_key: StringIdKey
  expire_date: number
  generated_date: number
  type: LoginStateType
  remark: string
}

export function login(webInput: LoginInfo): Pres<LoginResult> {
  return http.publicClient().post('system', 'login', webInput, 'application/json;charset=UTF-8')
}

export function logoutMe(): Pres<null> {
  return http.generalClient().post('system', 'logout-me', {}, 'application/json;charset=UTF-8')
}

export function postponeMe(): Pres<PostponeResult> {
  return http.generalClient().post('system', 'postpone-me', {}, 'application/json;charset=UTF-8')
}
