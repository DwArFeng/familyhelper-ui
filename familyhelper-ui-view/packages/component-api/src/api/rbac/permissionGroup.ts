// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type PermissionGroupKey } from './key'
import { type Scope } from './scope'

export type PermissionGroup = {
  key: PermissionGroupKey
  parent_key: PermissionGroupKey
  name: string
  remark: string
}

export type DispPermissionGroup = PermissionGroup & {
  scope: Scope
  parent: PermissionGroup | null
  root_flag: boolean
  has_no_child: boolean
}

export type PermissionGroupCreateResult = {
  key: PermissionGroupKey
}

export type PermissionGroupCreateInfo = {
  key: PermissionGroupKey
  parent_key: PermissionGroupKey | null
  name: string
  remark: string
}

export type PermissionGroupUpdateInfo = {
  key: PermissionGroupKey
  parent_key: PermissionGroupKey | null
  name: string
  remark: string
}

export type PermissionGroupRemoveInfo = {
  key: PermissionGroupKey
}

export function exists(scopeId: string, permissionGroupId: string): Pres<boolean> {
  return http
    .generalClient()
    .get('rbac', `permission-group/${scopeId}%26${permissionGroupId}/exists`, {}, 'json')
}

export function get(scopeId: string, permissionGroupId: string): Pres<PermissionGroup> {
  return http
    .generalClient()
    .get('rbac', `permission-group/${scopeId}%26${permissionGroupId}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'rbac',
    'permission-group/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForScope(
  scopeKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/permission-group`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParent(
  parentKey: PermissionGroupKey,
  pagingInfo: PagingInfo,
): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `permission-group/${parentKey.scope_string_id}%26${parentKey.permission_group_string_id}/children`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function permissionGroupStringIdLike(
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'rbac',
    'permission-group/permission-group-string-id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParentPermissionGroupStringIdLike(
  parentKey: PermissionGroupKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `permission-group/${parentKey.scope_string_id}%26${parentKey.permission_group_string_id}/children/permission-group-string-id-like`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nameLike(pattern: string, pagingInfo: PagingInfo): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'rbac',
    'permission-group/name-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParentNameLike(
  parentKey: PermissionGroupKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `permission-group/${parentKey.scope_string_id}%26${parentKey.permission_group_string_id}/children/name-like`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForScopeRoot(
  scopeKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/permission-group/root`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(scopeId: string, permissionGroupId: string): Pres<DispPermissionGroup> {
  return http
    .generalClient()
    .get('rbac', `permission-group/${scopeId}%26${permissionGroupId}/disp`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'rbac',
    'permission-group/all/disp',
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
): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/permission-group/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParentDisp(
  parentKey: PermissionGroupKey,
  pagingInfo: PagingInfo,
): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `permission-group/${parentKey.scope_string_id}%26${parentKey.permission_group_string_id}/children/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function permissionGroupStringIdLikeDisp(
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'rbac',
    'permission-group/permission-group-string-id-like/disp',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParentPermissionGroupStringIdLikeDisp(
  parentKey: PermissionGroupKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `permission-group/${parentKey.scope_string_id}%26${parentKey.permission_group_string_id}/children/permission-group-string-id-like/disp`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nameLikeDisp(pattern: string, pagingInfo: PagingInfo): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'rbac',
    'permission-group/name-like/disp',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParentNameLikeDisp(
  parentKey: PermissionGroupKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `permission-group/${parentKey.scope_string_id}%26${parentKey.permission_group_string_id}/children/name-like/disp`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForScopeRootDisp(
  scopeKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'rbac',
    `scope/${scopeKey.string_id}/permission-group/root/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function pathFromRoot(permissionGroupKey: PermissionGroupKey): Prespa<PermissionGroup> {
  return http
    .generalClient()
    .get(
      'rbac',
      `permission-group/${permissionGroupKey.scope_string_id}%26${permissionGroupKey.permission_group_string_id}/path-from-root`,
      {},
      'json',
    )
}

export function pathFromRootDisp(
  permissionGroupKey: PermissionGroupKey,
): Prespa<DispPermissionGroup> {
  return http
    .generalClient()
    .get(
      'rbac',
      `permission-group/${permissionGroupKey.scope_string_id}%26${permissionGroupKey.permission_group_string_id}/path-from-root/disp`,
      {},
      'json',
    )
}

export function create(createInfo: PermissionGroupCreateInfo): Pres<PermissionGroupCreateResult> {
  return http
    .generalClient()
    .post('rbac', 'permission-group/create', createInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: PermissionGroupUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .patch('rbac', 'permission-group/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(removeInfo: PermissionGroupRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('rbac', 'permission-group/remove', removeInfo, 'application/json;charset=UTF-8')
}
