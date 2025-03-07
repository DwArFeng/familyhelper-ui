// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { PagingInfo } from '../../util/request'
import type { Pres, Prespa } from '../../util/response'

export type PermissionGroup = {
  key: StringIdKey
  parent_key: StringIdKey | null
  name: string
  remark: string
}

export type InsertPermissionGroup = PermissionGroup

export type UpdatePermissionGroup = PermissionGroup

export type DispPermissionGroup = PermissionGroup & {
  parent_permission_group: PermissionGroup | null
  root_flag: boolean
  has_no_child: boolean
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('system', `permission-group/${key.string_id}/exists`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<PermissionGroup> {
  return http.generalClient().get('system', `permission-group/${key.string_id}`, {}, 'json')
}

export function insert(permissionGroup: InsertPermissionGroup): Pres<StringIdKey> {
  return http
    .generalClient()
    .post('system', 'permission-group/', permissionGroup, 'application/json;charset=UTF-8')
}

export function update(permissionGroup: UpdatePermissionGroup): Pres<null> {
  return http
    .generalClient()
    .patch('system', 'permission-group/', permissionGroup, 'application/json;charset=UTF-8')
}

export function remove(key: StringIdKey, nested: boolean): Pres<null> {
  return http.generalClient().del(
    'system',
    `permission-group/${key.string_id}/`,
    {
      nested,
    },
    'json',
  )
}

export function all(pagingInfo: PagingInfo): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'system',
    'permission-group/all',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function idLike(pattern: string, pagingInfo: PagingInfo): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'system',
    'permission-group/id-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForParent(
  parentKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'system',
    `permission-group/${parentKey.string_id}/child`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForRoot(pagingInfo: PagingInfo): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'system',
    'permission-group//child',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nameLike(pattern: string, pagingInfo: PagingInfo): Prespa<PermissionGroup> {
  return http.generalClient().get(
    'system',
    'permission-group/name-like',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: StringIdKey): Pres<DispPermissionGroup> {
  return http.generalClient().get('system', `permission-group/${key.string_id}/disp`, {}, 'json')
}

export function childForParentDisp(
  parentKey: StringIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'system',
    `permission-group/${parentKey.string_id}/child/disp`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForRootDisp(pagingInfo: PagingInfo): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'system',
    'permission-group//child/disp',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function nameLikeDisp(pattern: string, pagingInfo: PagingInfo): Prespa<DispPermissionGroup> {
  return http.generalClient().get(
    'system',
    'permission-group/name-like/disp',
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function pathFromRoot(key: StringIdKey): Prespa<PermissionGroup> {
  return http
    .generalClient()
    .get('system', `permission-group/${key.string_id}/path-from-root/`, {}, 'json')
}

export function pathFromRootDisp(key: StringIdKey): Prespa<DispPermissionGroup> {
  return http
    .generalClient()
    .get('system', `permission-group/${key.string_id}/path-from-root/disp/`, {}, 'json')
}
