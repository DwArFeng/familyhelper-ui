// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

import { type Role } from './role'
import { type User } from './user'

export type RoleUserRelationKey = {
  role_string_id: string
  user_string_id: string
}

export type RoleUserRelation = {
  key: RoleUserRelationKey
  enabled: boolean
  remark: string
}

export type DispRoleUserRelation = RoleUserRelation & {
  role: Role
  user: User
}

export function exists(roleId: string, userId: string): Pres<boolean> {
  return http
    .generalClient()
    .get('rbac', `role-user-relation/${roleId}%26${userId}/exists`, {}, 'json')
}

export function get(roleId: string, userId: string): Pres<RoleUserRelation> {
  return http.generalClient().get('rbac', `role-user-relation/${roleId}%26${userId}`, {}, 'json')
}

export function insert(roleUserRelation: RoleUserRelation): Pres<RoleUserRelationKey> {
  return http
    .generalClient()
    .post('rbac', 'role-user-relation', roleUserRelation, 'application/json;charset=UTF-8')
}

export function update(roleUserRelation: RoleUserRelation): Pres<null> {
  return http
    .generalClient()
    .patch('rbac', 'role-user-relation', roleUserRelation, 'application/json;charset=UTF-8')
}

export function remove(roleId: string, userId: string): Pres<null> {
  return http.generalClient().del('rbac', `role-user-relation/${roleId}%26${userId}`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<RoleUserRelation> {
  return http.generalClient().get(
    'rbac',
    'role-user-relation/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForRole(
  roleKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<RoleUserRelation> {
  return http.generalClient().get(
    'rbac',
    `role/${roleKey.string_id}/role-user-relation`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForUser(
  userKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<RoleUserRelation> {
  return http.generalClient().get(
    'rbac',
    `user/${userKey.string_id}/role-user-relation`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(roleId: string, userId: string): Pres<DispRoleUserRelation> {
  return http
    .generalClient()
    .get('rbac', `role-user-relation/${roleId}%26${userId}/disp`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispRoleUserRelation> {
  return http.generalClient().get(
    'rbac',
    'role-user-relation/all/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForRoleDisp(
  roleKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispRoleUserRelation> {
  return http.generalClient().get(
    'rbac',
    `role/${roleKey.string_id}/role-user-relation/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForUserDisp(
  userKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispRoleUserRelation> {
  return http.generalClient().get(
    'rbac',
    `user/${userKey.string_id}/role-user-relation/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
