// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type IahnNodeLocale = {
  key: IahnNodeLocaleKey
  label: string
  remark: string
}

export type IahnNodeLocaleKey = {
  node_string_id: string
  language: string
  country: string
  variant: string
}

export type IahnNodeLocaleQuery = {
  nodeId: string
  language: string
  country?: string
  variant?: string
}

export function exists(query: IahnNodeLocaleQuery): Pres<boolean> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node-locale/${query.nodeId}/${query.language}/exists/`,
    {
      country: query.country ?? '',
      variant: query.variant ?? '',
    },
    'json',
  )
}

export function get(query: IahnNodeLocaleQuery): Pres<IahnNodeLocale> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node-locale/${query.nodeId}/${query.language}/`,
    {
      country: query.country ?? '',
      variant: query.variant ?? '',
    },
    'json',
  )
}

export function all(pagingInfo: PagingInfo): Prespa<IahnNodeLocale> {
  return http.generalClient().get(
    'settingrepo',
    'iahn-node-locale/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNode(nodeId: string, pagingInfo: PagingInfo): Prespa<IahnNodeLocale> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node/${nodeId}/iahn-node-locale/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForNodeOrdered(
  nodeId: string,
  pagingInfo: PagingInfo,
): Prespa<IahnNodeLocale> {
  return http.generalClient().get(
    'settingrepo',
    `iahn-node/${nodeId}/iahn-node-locale/ordered/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}
