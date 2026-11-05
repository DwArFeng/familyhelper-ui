// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type IahnNodeMek = {
  key: IahnNodeMekKey
  label: string
  default_message: string
  remark: string
}

export type IahnNodeMekKey = {
  node_string_id: string
  mek_id: string
}

export function exists(nodeId: string, mekId: string): Pres<boolean> {
  return http
    .generalClient()
    .get('settingrepo', `iahn-node-mek/${nodeId}/${mekId}/exists/`, {}, 'json')
}

export function get(nodeId: string, mekId: string): Pres<IahnNodeMek> {
  return http.generalClient().get('settingrepo', `iahn-node-mek/${nodeId}/${mekId}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<IahnNodeMek> {
  return http.generalClient().get(
    'settingrepo',
    'iahn-node-mek/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNode(nodeId: string, pagingInfo: PagingInfo): Prespa<IahnNodeMek> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node/${nodeId}/iahn-node-mek/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNodeOrdered(nodeId: string, pagingInfo: PagingInfo): Prespa<IahnNodeMek> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node/${nodeId}/iahn-node-mek/ordered/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
