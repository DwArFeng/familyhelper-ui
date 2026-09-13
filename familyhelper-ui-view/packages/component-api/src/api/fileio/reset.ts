// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type Pres } from '../../util/response'

export function resetExport(): Pres<null> {
  return http.generalClient().post('fileio', 'reset-export', {}, 'application/json;charset=UTF-8')
}

export function resetImport(): Pres<null> {
  return http.generalClient().post('fileio', 'reset-import', {}, 'application/json;charset=UTF-8')
}
