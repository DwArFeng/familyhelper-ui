// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

export function resetSupervise(): Pres<null> {
  return http
    .generalClient()
    .post('logicengine', 'reset-supervise/', {}, 'application/json;charset=UTF-8')
}

export function resetJob(): Pres<null> {
  return http
    .generalClient()
    .post('logicengine', 'reset-job/', {}, 'application/json;charset=UTF-8')
}
