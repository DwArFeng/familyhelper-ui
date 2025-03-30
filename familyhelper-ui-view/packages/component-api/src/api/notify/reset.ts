// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { Pres } from '../../util/response'

export function resetRoute(): Pres<null> {
  return http.generalClient().post('notify', 'reset-route/', {}, 'application/json;charset=UTF-8')
}

export function resetDispatch(): Pres<null> {
  return http
    .generalClient()
    .post('notify', 'reset-dispatch/', {}, 'application/json;charset=UTF-8')
}

export function resetSend(): Pres<null> {
  return http.generalClient().post('notify', 'reset-send/', {}, 'application/json;charset=UTF-8')
}
