// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type Section } from './section'

export type StateTypeInitial = 0
export type StateTypeNormal = 1
export type StateTypeTerminal = 2

export type StateType = StateTypeInitial | StateTypeNormal | StateTypeTerminal

export type StateKey = {
  section_long_id: string
  state_id: string
}

export type State = {
  key: StateKey
  name: string
  type: StateType
  first_spin_delay: string
  spin_interval: string
  remark: string
}

export type InsertState = State

export type UpdateState = State

export type DispState = State & {
  section: Section
}

export function exists(key: StateKey): Pres<boolean> {
  return http
    .generalClient()
    .get('logicengine', `state/${key.section_long_id}%26${key.state_id}/exists/`, {}, 'json')
}

export function get(key: StateKey): Pres<State> {
  return http
    .generalClient()
    .get('logicengine', `state/${key.section_long_id}%26${key.state_id}/`, {}, 'json')
}

export function insert(state: InsertState): Pres<StateKey> {
  return http.generalClient().post('logicengine', 'state/', state, 'application/json;charset=UTF-8')
}

export function update(state: UpdateState): Pres<null> {
  return http
    .generalClient()
    .patch('logicengine', 'state/', state, 'application/json;charset=UTF-8')
}

export function remove(key: StateKey): Pres<null> {
  return http
    .generalClient()
    .del('logicengine', `state/${key.section_long_id}%26${key.state_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<State> {
  return http.generalClient().get(
    'logicengine',
    'state/all/',
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
): Prespa<DispState> {
  return http.generalClient().get(
    'logicengine',
    `state/child-for-section/${sectionKey.long_id}/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function getDisp(key: StateKey): Pres<DispState> {
  return http
    .generalClient()
    .get('logicengine', `state/${key.section_long_id}%26${key.state_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispState> {
  return http.generalClient().get(
    'logicengine',
    'state/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForSection(sectionKey: LongIdKey, pagingInfo: PagingInfo): Prespa<State> {
  return http.generalClient().get(
    'logicengine',
    `state/child-for-section/${sectionKey.long_id}/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
