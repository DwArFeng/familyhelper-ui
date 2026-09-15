// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type Pres } from '../../util/response'

import { type AuditPropertyType } from './auditPropertyIndicator'

export type AuditRecordPropertyItem = {
  id: string
  value_type: AuditPropertyType
  value_string: string
}

export type AuditRecordInfo = {
  category_key: StringIdKey
  property_items: AuditRecordPropertyItem[]
}

export function record(info: AuditRecordInfo): Pres<null> {
  return http
    .generalClient()
    .post('audit', 'audit-record/record/', info, 'application/json;charset=UTF-8')
}
