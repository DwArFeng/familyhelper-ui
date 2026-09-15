// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres } from '../../util/response'

export type InspectionJobExecuteInfo = {
  inspection_task_key: LongIdKey
}

export function execute(info: InspectionJobExecuteInfo): Pres<null> {
  return http
    .generalClient()
    .post('audit', 'inspection-job/execute/', info, 'application/json;charset=UTF-8')
}
