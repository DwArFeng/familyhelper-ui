// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

export function resetFormat(): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'reset-format/', {}, 'application/json;charset=UTF-8')
}
