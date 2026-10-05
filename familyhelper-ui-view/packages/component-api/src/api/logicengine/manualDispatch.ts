// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres } from '../../util/response'

export type ManualDispatchInfo = {
  section_key: LongIdKey
}

export function dispatch(manualDispatchInfo: ManualDispatchInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'logicengine',
      'manual-dispatch/dispatch/',
      manualDispatchInfo,
      'application/json;charset=UTF-8',
    )
}
