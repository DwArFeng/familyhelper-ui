// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

import { type StringIdKey } from '../subgrade/key'
import { type PermissionKey } from './key'
import { type User } from './user'
import { type Role } from './role'
import { type Permission } from './permission'

export type ScopedRoleKey = {
  scope_string_id: string
  role_string_id: string
}

export type ScopedUserKey = {
  scope_string_id: string
  user_string_id: string
}

/**
 * 权限视角下的用户查看结果。
 * 对应 FastJsonUserViewOfPermissionInspectResult。
 */
export type UserViewOfPermissionInspectResult = {
  matched_users: User[] | null
  matched_flag: boolean
  accepted_roles: Role[] | null
  rejected_roles: Role[] | null
}

/**
 * 角色视角下的权限查看结果。
 * 对应 FastJsonPermissionViewOfRoleInspectResult。
 */
export type PermissionViewOfRoleInspectResult = {
  matched_permissions: Permission[] | null
  matched_flag: boolean
  accepted_permissions: Permission[] | null
  rejected_permissions: Permission[] | null
  global_rejected_permissions: Permission[] | null
}

export type PermissionViewOfUserInspectResultRoleDetail = {
  role: Role
  accepted_permissions: Permission[] | null
  rejected_permissions: Permission[] | null
  global_rejected_permissions: Permission[] | null
}

export type PermissionViewOfUserInspectResult = {
  matched_permissions: Permission[] | null
  matched_flag: boolean
  role_details: PermissionViewOfUserInspectResultRoleDetail[] | null
}

export type UserViewOfPermissionInspectInfo = {
  permission_key: PermissionKey
  user_key_matched?: StringIdKey
  all_of_user_keys_matched?: StringIdKey[]
  any_of_user_keys_matched?: StringIdKey[]
  detail_mode: boolean
}

export type PermissionViewOfRoleInspectInfo = {
  scoped_role_key: ScopedRoleKey
  permission_key_matched?: PermissionKey
  all_of_permission_keys_matched?: PermissionKey[]
  any_of_permission_keys_matched?: PermissionKey[]
  detail_mode: boolean
}

export type PermissionViewOfUserInspectInfo = {
  scoped_user_key: ScopedUserKey
  permission_key_matched?: PermissionKey
  all_of_permission_keys_matched?: PermissionKey[]
  any_of_permission_keys_matched?: PermissionKey[]
  detail_mode: boolean
}

/**
 * 查看权限视角下的用户。
 * 对应 POST /inspect/user-view-of-permission
 */
export function inspectUserViewOfPermission(
  info: UserViewOfPermissionInspectInfo,
): Pres<UserViewOfPermissionInspectResult> {
  return http
    .generalClient()
    .post('rbac', 'inspect/user-view-of-permission', info, 'application/json;charset=UTF-8')
}

/**
 * 查看角色视角下的权限。
 * 对应 POST /inspect/permission-view-of-role
 */
export function inspectPermissionViewOfRole(
  info: PermissionViewOfRoleInspectInfo,
): Pres<PermissionViewOfRoleInspectResult> {
  return http
    .generalClient()
    .post('rbac', 'inspect/permission-view-of-role', info, 'application/json;charset=UTF-8')
}

/**
 * 查看用户视角下的权限。
 * 对应 POST /inspect/permission-view-of-user
 */
export function inspectPermissionViewOfUser(
  info: PermissionViewOfUserInspectInfo,
): Pres<PermissionViewOfUserInspectResult> {
  return http
    .generalClient()
    .post('rbac', 'inspect/permission-view-of-user', info, 'application/json;charset=UTF-8')
}
