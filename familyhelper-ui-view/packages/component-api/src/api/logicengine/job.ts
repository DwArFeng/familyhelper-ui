// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres } from '../../util/response'

export type JobExecuteInfo = {
  task_key: LongIdKey
}

export function execute(jobExecuteInfo: JobExecuteInfo): Pres<null> {
  return http
    .generalClient()
    .post('logicengine', 'job/execute/', jobExecuteInfo, 'application/json;charset=UTF-8')
}
