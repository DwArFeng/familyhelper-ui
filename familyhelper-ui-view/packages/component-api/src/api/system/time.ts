// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type ResponseData } from '../../util/response'

export function currentDate(): Promise<ResponseData<number>> {
  return http.publicClient().post('system', 'current-date', {}, 'application/json;charset=UTF-8')
}
