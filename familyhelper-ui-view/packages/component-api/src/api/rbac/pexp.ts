// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type Scope } from './scope'
import { type Role } from './role'

export type PexpKey = {
  scope_string_id: string
  role_string_id: string
  pexp_string_id: string
}

export type Pexp = {
  key: PexpKey
  content: string
  remark: string
}

export type DispPexp = Pexp & {
  scope: Scope
  role: Role
}

export type PexpCreateResult = {
  key: PexpKey
}

export type PexpCreateInfo = {
  key: PexpKey
  content: string
  remark: string
}

export type PexpUpdateInfo = {
  key: PexpKey
  content: string
  remark: string
}

export type PexpRemoveInfo = {
  key: PexpKey
}

export function exists(scopeId: string, roleId: string, pexpStringId: string): Pres<boolean> {
  return http
    .generalClient()
    .get('rbac', `pexp/${scopeId}%26${roleId}%26${pexpStringId}/exists`, {}, 'json')
}

export function get(scopeId: string, roleId: string, pexpStringId: string): Pres<Pexp> {
  return http
    .generalClient()
    .get('rbac', `pexp/${scopeId}%26${roleId}%26${pexpStringId}`, {}, 'json')
}

export function childForScope(scopeKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Pexp> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/pexp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForRole(roleKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Pexp> {
  return http.generalClient().get(
    'rbac',
    `role/${roleKey.string_id}/pexp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForScopeChildForRole(
  scopeKey: StringIdKey,
  roleKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<Pexp> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/role/${roleKey.string_id}/pexp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(scopeId: string, roleId: string, pexpStringId: string): Pres<DispPexp> {
  return http
    .generalClient()
    .get('rbac', `pexp/${scopeId}%26${roleId}%26${pexpStringId}/disp`, {}, 'json')
}

export function childForScopeDisp(scopeKey: StringIdKey, pagingInfo: PagingInfo): Prespa<DispPexp> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/pexp/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForRoleDisp(roleKey: StringIdKey, pagingInfo: PagingInfo): Prespa<DispPexp> {
  return http.generalClient().get(
    'rbac',
    `role/${roleKey.string_id}/pexp/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForScopeChildForRoleDisp(
  scopeKey: StringIdKey,
  roleKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispPexp> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/role/${roleKey.string_id}/pexp/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: PexpCreateInfo): Pres<PexpCreateResult> {
  return http
    .generalClient()
    .post('rbac', 'pexp/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: PexpUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .patch('rbac', 'pexp/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(removeInfo: PexpRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('rbac', 'pexp/remove', removeInfo, 'application/json;charset=UTF-8')
}
