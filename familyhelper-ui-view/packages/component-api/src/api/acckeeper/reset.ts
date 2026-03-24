// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

export function resetProtect(): Pres<null> {
  return http
    .generalClient()
    .post('acckeeper', 'reset-protect', {}, 'application/json;charset=UTF-8')
}
