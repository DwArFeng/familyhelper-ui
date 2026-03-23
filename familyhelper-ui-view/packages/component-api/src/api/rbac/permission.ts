// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type PermissionKey, type PermissionGroupKey } from './key'
import { type PermissionGroup } from './permissionGroup'

export type Permission = {
  key: PermissionKey
  group_key: PermissionGroupKey | null
  name: string
  remark: string
  level: number
  group_path: string[]
}

export type DispPermission = Permission & {
  group: PermissionGroup | null
}

export type PermissionCreateResult = {
  key: PermissionKey
}

export type PermissionCreateInfo = {
  key: PermissionKey
  group_key: PermissionGroupKey | null
  name: string
  remark: string
  level: number
}

export type PermissionUpdateInfo = {
  key: PermissionKey
  group_key: PermissionGroupKey | null
  name: string
  remark: string
  level: number
}

export type PermissionRemoveInfo = {
  key: PermissionKey
}

export function exists(scopeId: string, permissionStringId: string): Pres<boolean> {
  return http
    .generalClient()
    .get('rbac', `permission/${scopeId}%26${permissionStringId}/exists`, {}, 'json')
}

export function get(scopeId: string, permissionStringId: string): Pres<Permission> {
  return http
    .generalClient()
    .get('rbac', `permission/${scopeId}%26${permissionStringId}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<Permission> {
  return http.generalClient().get(
    'rbac',
    'permission/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForScope(scopeKey: StringIdKey, pagingInfo: PagingInfo): Prespa<Permission> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/permission`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForGroup(
  groupKey: PermissionGroupKey,
  pagingInfo: PagingInfo,
): Prespa<Permission> {
  return http.generalClient().get(
    'rbac',
    `permission-group/${groupKey.scope_string_id}%26${groupKey.permission_group_string_id}/permission`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function permissionStringIdLike(
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<Permission> {
  return http.generalClient().get(
    'rbac',
    'permission/permission-string-id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nameLike(pattern: string, pagingInfo: PagingInfo): Prespa<Permission> {
  return http.generalClient().get(
    'rbac',
    'permission/name-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForScopePermissionStringIdLike(
  scopeKey: StringIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<Permission> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/permission/permission-string-id-like`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function create(createInfo: PermissionCreateInfo): Pres<PermissionCreateResult> {
  return http
    .generalClient()
    .post('rbac', 'permission/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: PermissionUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .patch('rbac', 'permission/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(removeInfo: PermissionRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('rbac', 'permission/remove', removeInfo, 'application/json;charset=UTF-8')
}

export function getDisp(scopeId: string, permissionStringId: string): Pres<DispPermission> {
  return http
    .generalClient()
    .get('rbac', `permission/${scopeId}%26${permissionStringId}/disp`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispPermission> {
  return http.generalClient().get(
    'rbac',
    'permission/all/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForScopeDisp(
  scopeKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispPermission> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/permission/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForGroupDisp(
  groupKey: PermissionGroupKey,
  pagingInfo: PagingInfo,
): Prespa<DispPermission> {
  return http.generalClient().get(
    'rbac',
    `permission-group/${groupKey.scope_string_id}%26${groupKey.permission_group_string_id}/permission/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function permissionStringIdLikeDisp(
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispPermission> {
  return http.generalClient().get(
    'rbac',
    'permission/permission-string-id-like/disp',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nameLikeDisp(pattern: string, pagingInfo: PagingInfo): Prespa<DispPermission> {
  return http.generalClient().get(
    'rbac',
    'permission/name-like/disp',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
