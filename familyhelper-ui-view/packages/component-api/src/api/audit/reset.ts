// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

export function resetAuditRecord(): Pres<null> {
  return http
    .generalClient()
    .post('audit', 'reset-audit-record/', {}, 'application/json;charset=UTF-8')
}

export function resetInspectionSupervise(): Pres<null> {
  return http
    .generalClient()
    .post('audit', 'reset-inspection-supervise/', {}, 'application/json;charset=UTF-8')
}

export function resetInspectionJob(): Pres<null> {
  return http
    .generalClient()
    .post('audit', 'reset-inspection-job/', {}, 'application/json;charset=UTF-8')
}
