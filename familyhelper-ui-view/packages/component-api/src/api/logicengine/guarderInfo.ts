// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Section } from './section'
import { type State, type StateKey } from './state'

export type GuarderInfo = {
  key: LongIdKey
  section_key: LongIdKey
  anchor_state_key: StateKey
  target_state_key: StateKey
  index: number
  enabled: boolean
  type: string
  param: string
  remark: string
}

export type InsertGuarderInfo = Omit<GuarderInfo, 'key'> & { key: LongIdKey | null }

export type UpdateGuarderInfo = GuarderInfo

export type DispGuarderInfo = GuarderInfo & {
  section: Section
  anchor_state: State
  target_state: State
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('logicengine', `guarder-info/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<GuarderInfo> {
  return http.generalClient().get('logicengine', `guarder-info/${key.long_id}/`, {}, 'json')
}

export function insert(guarderInfo: InsertGuarderInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('logicengine', 'guarder-info/', guarderInfo, 'application/json;charset=UTF-8')
}

export function update(guarderInfo: UpdateGuarderInfo): Pres<null> {
  return http
    .generalClient()
    .patch('logicengine', 'guarder-info/', guarderInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('logicengine', `guarder-info/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<GuarderInfo> {
  return http.generalClient().get(
    'logicengine',
    'guarder-info/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSectionDisp(
  sectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispGuarderInfo> {
  return http.generalClient().get(
    'logicengine',
    `guarder-info/child-for-section/${sectionKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAnchorStateDisp(
  anchorStateKey: StateKey,
  pagingInfo: PagingInfo,
): Prespa<DispGuarderInfo> {
  return http.generalClient().get(
    'logicengine',
    `guarder-info/child-for-anchor-state/${anchorStateKey.section_long_id}%26${anchorStateKey.state_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTargetStateDisp(
  targetStateKey: StateKey,
  pagingInfo: PagingInfo,
): Prespa<DispGuarderInfo> {
  return http.generalClient().get(
    'logicengine',
    `guarder-info/child-for-target-state/${targetStateKey.section_long_id}%26${targetStateKey.state_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispGuarderInfo> {
  return http.generalClient().get('logicengine', `guarder-info/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispGuarderInfo> {
  return http.generalClient().get(
    'logicengine',
    'guarder-info/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSection(
  sectionKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<GuarderInfo> {
  return http.generalClient().get(
    'logicengine',
    `guarder-info/child-for-section/${sectionKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAnchorState(
  anchorStateKey: StateKey,
  pagingInfo: PagingInfo,
): Prespa<GuarderInfo> {
  return http.generalClient().get(
    'logicengine',
    `guarder-info/child-for-anchor-state/${anchorStateKey.section_long_id}%26${anchorStateKey.state_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForTargetState(
  targetStateKey: StateKey,
  pagingInfo: PagingInfo,
): Prespa<GuarderInfo> {
  return http.generalClient().get(
    'logicengine',
    `guarder-info/child-for-target-state/${targetStateKey.section_long_id}%26${targetStateKey.state_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
