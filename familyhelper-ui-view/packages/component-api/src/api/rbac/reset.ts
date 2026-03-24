// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

export function resetFilter(): Pres<null> {
  return http.generalClient().post('rbac', 'reset-filter', {}, 'application/json;charset=UTF-8')
}

export function resetAnalysis(): Pres<null> {
  return http.generalClient().post('rbac', 'reset-analysis', {}, 'application/json;charset=UTF-8')
}
