// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type IahnNodeMessage = {
  key: IahnNodeMessageKey
  message: string
}

export type IahnNodeMessageKey = {
  node_string_id: string
  language: string
  country: string
  variant: string
  mek_id: string
}

export type IahnNodeMessageQuery = {
  nodeId: string
  language: string
  mekId: string
  country?: string
  variant?: string
}

export type IahnNodeMessageLocaleQuery = {
  nodeId: string
  language: string
  country?: string
  variant?: string
}

export function exists(query: IahnNodeMessageQuery): Pres<boolean> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node-message/${query.nodeId}/${query.language}/${query.mekId}/exists/`,
    {
      country: query.country ?? '',
      variant: query.variant ?? '',
    },
    'json',
  )
}

export function get(query: IahnNodeMessageQuery): Pres<IahnNodeMessage> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node-message/${query.nodeId}/${query.language}/${query.mekId}/`,
    {
      country: query.country ?? '',
      variant: query.variant ?? '',
    },
    'json',
  )
}

export function all(pagingInfo: PagingInfo): Prespa<IahnNodeMessage> {
  return http.generalClient().get(
    'settingrepo',
    'iahn-node-message/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNode(nodeId: string, pagingInfo: PagingInfo): Prespa<IahnNodeMessage> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node/${nodeId}/iahn-node-message/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForLocale(
  query: IahnNodeMessageLocaleQuery,
  pagingInfo: PagingInfo,
): Prespa<IahnNodeMessage> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node-locale/${query.nodeId}/${query.language}/iahn-node-message/`,
    {
      country: query.country ?? '',
      variant: query.variant ?? '',
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForMek(
  nodeId: string,
  mekId: string,
  pagingInfo: PagingInfo,
): Prespa<IahnNodeMessage> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node-mek/${nodeId}/${mekId}/iahn-node-message/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
