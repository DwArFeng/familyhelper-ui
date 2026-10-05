// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Section } from './section'
import { type State, type StateKey } from './state'

export type PerformerInfo = {
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

export type InsertPerformerInfo = Omit<PerformerInfo, 'key'> & { key: LongIdKey | null }

export type UpdatePerformerInfo = PerformerInfo

export type DispPerformerInfo = PerformerInfo & {
  section: Section
  anchor_state: State
  target_state: State
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http
    .generalClient()
    .get('logicengine', `performer-info/${key.long_id}/exists/`, {}, 'json')
}

export function get(key: LongIdKey): Pres<PerformerInfo> {
  return http.generalClient().get('logicengine', `performer-info/${key.long_id}/`, {}, 'json')
}

export function insert(performerInfo: InsertPerformerInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('logicengine', 'performer-info/', performerInfo, 'application/json;charset=UTF-8')
}

export function update(performerInfo: UpdatePerformerInfo): Pres<null> {
  return http
    .generalClient()
    .patch('logicengine', 'performer-info/', performerInfo, 'application/json;charset=UTF-8')
}

export function remove(key: LongIdKey): Pres<null> {
  return http.generalClient().del('logicengine', `performer-info/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<PerformerInfo> {
  return http.generalClient().get(
    'logicengine',
    'performer-info/all/',
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
): Prespa<DispPerformerInfo> {
  return http.generalClient().get(
    'logicengine',
    `performer-info/child-for-section/${sectionKey.long_id}/disp/`,
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
): Prespa<DispPerformerInfo> {
  return http.generalClient().get(
    'logicengine',
    `performer-info/child-for-anchor-state/${anchorStateKey.section_long_id}%26${anchorStateKey.state_id}/disp/`,
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
): Prespa<DispPerformerInfo> {
  return http.generalClient().get(
    'logicengine',
    `performer-info/child-for-target-state/${targetStateKey.section_long_id}%26${targetStateKey.state_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: LongIdKey): Pres<DispPerformerInfo> {
  return http.generalClient().get('logicengine', `performer-info/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispPerformerInfo> {
  return http.generalClient().get(
    'logicengine',
    'performer-info/all/disp/',
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
): Prespa<PerformerInfo> {
  return http.generalClient().get(
    'logicengine',
    `performer-info/child-for-section/${sectionKey.long_id}/`,
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
): Prespa<PerformerInfo> {
  return http.generalClient().get(
    'logicengine',
    `performer-info/child-for-anchor-state/${anchorStateKey.section_long_id}%26${anchorStateKey.state_id}/`,
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
): Prespa<PerformerInfo> {
  return http.generalClient().get(
    'logicengine',
    `performer-info/child-for-target-state/${targetStateKey.section_long_id}%26${targetStateKey.state_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
