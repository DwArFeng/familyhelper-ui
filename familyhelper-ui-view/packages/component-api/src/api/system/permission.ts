// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

import { type StringIdKey } from '../subgrade/key'
import { type Permission } from '../rbac/permission'

export type PermissionOfMeInspectInfo = {
  scope_key: StringIdKey
}

export type PermissionInspectResult = {
  permissions: Permission[]
}

export function inspectPermissionOfMe(
  info: PermissionOfMeInspectInfo,
): Pres<PermissionInspectResult | null> {
  return http
    .generalClient()
    .post('system', 'inspect-permission-of-me', info, 'application/json;charset=UTF-8')
}
