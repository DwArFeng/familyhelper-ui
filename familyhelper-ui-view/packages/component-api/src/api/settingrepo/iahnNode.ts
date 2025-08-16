// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type StringIdKey } from '../subgrade/key'
import { type PagingInfo } from '../../util/request'
import { type Pres, type Prespa } from '../../util/response'

export type IahnNode = {
  key: StringIdKey
}

export type IahnNodeMessageInspectInfo = {
  category: string
  args: string[]
  language: string
  country: string
  variant: string
  mek_id: string
}

export type IahnNodeMessageInspectResult = {
  message: string
}

export type IahnNodeMessageInspectByLocaleInfo = {
  category: string
  args: string[]
  language: string
  country: string
  variant: string
}

export type IahnNodeMessageInspectByLocaleResult = {
  items: IahnNodeMessageInspectByLocaleResultItem[]
}

export type IahnNodeMessageInspectByLocaleResultItem = {
  mek_id: string
  message: string
}

export type IahnNodeLocaleListInspectInfo = {
  category: string
  args: string[]
}

export type IahnNodeLocaleListInspectResult = {
  items: IahnNodeLocaleListInspectResultItem[]
}

export type IahnNodeLocaleListInspectResultItem = {
  language: string
  country: string
  variant: string
  label: string
  remark: string
}

export type IahnNodeMekListInspectInfo = {
  category: string
  args: string[]
}

export type IahnNodeMekListInspectResult = {
  items: IahnNodeMekListInspectResultItem[]
}

export type IahnNodeMekListInspectResultItem = {
  mek_id: string
  label: string
  default_message: string
  remark: string
}

export type IahnNodeMessageTableInspectInfo = {
  category: string
  args: string[]
}

export type IahnNodeMessageTableInspectResult = {
  columns: IahnNodeMessageTableInspectResultColumn[]
  rows: IahnNodeMessageTableInspectResultRow[]
}

export type IahnNodeMessageTableInspectResultColumn = {
  language: string
  country: string
  variant: string
  label: string
  remark: string
}

export type IahnNodeMessageTableInspectResultRow = {
  mek_id: string
  label: string
  default_message: string
  remark: string
  row_datas: IahnNodeMessageTableInspectResultRowData[]
}

export type IahnNodeMessageTableInspectResultRowData = {
  message: string
}

export type IahnNodeLocalePutInfo = {
  category: string
  args: string[]
  language: string
  country: string
  variant: string
  label: string
  remark: string
}

export type IahnNodeLocaleRemoveInfo = {
  category: string
  args: string[]
  language: string
  country: string
  variant: string
}

export type IahnNodeMekPutInfo = {
  category: string
  args: string[]
  mek_id: string
  label: string
  default_message: string
  remark: string
}

export type IahnNodeMekRemoveInfo = {
  category: string
  args: string[]
  mek_id: string
}

export type IahnNodeMessageUpsertInfo = {
  category: string
  args: string[]
  language: string
  country: string
  variant: string
  mek_id: string
  message: string
}

export type IahnNodeMessageUpsertByLocaleInfo = {
  category: string
  args: string[]
  language: string
  country: string
  variant: string
  items: IahnNodeMessageUpsertByLocaleInfoItem[]
}

export type IahnNodeMessageUpsertByLocaleInfoItem = {
  mek_id: string
  message: string
}

export type IahnNodeMessageUpsertByMekInfo = {
  category: string
  args: string[]
  mek_id: string
  items: IahnNodeMessageUpsertByMekInfoItem[]
}

export type IahnNodeMessageUpsertByMekInfoItem = {
  language: string
  country: string
  variant: string
  message: string
}

export type PublicIahnNodeMessageInspectInfo = {
  category: string
  args: string[]
  language: string
  country: string
  variant: string
  mek_id: string
}

export type PublicIahnNodeMessageInspectByLocaleInfo = {
  category: string
  args: string[]
  language: string
  country: string
  variant: string
}

export type PublicIahnNodeLocaleListInspectInfo = {
  category: string
  args: string[]
}

export type PublicIahnNodeMekListInspectInfo = {
  category: string
  args: string[]
}

export type PublicIahnNodeMessageTableInspectInfo = {
  category: string
  args: string[]
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('settingrepo', `iahn-node/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<IahnNode> {
  return http.generalClient().get('settingrepo', `iahn-node/${key.string_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<IahnNode> {
  return http.generalClient().get(
    'settingrepo',
    'iahn-node/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectMessage(
  info: IahnNodeMessageInspectInfo,
): Pres<IahnNodeMessageInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/inspect-message/', info, 'application/json;charset=UTF-8')
}

export function batchInspectMessageByLocale(
  info: IahnNodeMessageInspectByLocaleInfo,
): Pres<IahnNodeMessageInspectByLocaleResult | null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'iahn-node/batch-inspect-message-by-locale/',
      info,
      'application/json;charset=UTF-8',
    )
}

export function inspectLocaleList(
  info: IahnNodeLocaleListInspectInfo,
): Pres<IahnNodeLocaleListInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/inspect-locale-list/', info, 'application/json;charset=UTF-8')
}

export function inspectMekList(
  info: IahnNodeMekListInspectInfo,
): Pres<IahnNodeMekListInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/inspect-mek-list/', info, 'application/json;charset=UTF-8')
}

export function inspectMessageTable(
  info: IahnNodeMessageTableInspectInfo,
): Pres<IahnNodeMessageTableInspectResult | null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/inspect-message-table/', info, 'application/json;charset=UTF-8')
}

export function putLocale(info: IahnNodeLocalePutInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/put-locale/', info, 'application/json;charset=UTF-8')
}

export function removeLocale(info: IahnNodeLocaleRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/remove-locale/', info, 'application/json;charset=UTF-8')
}

export function putMek(info: IahnNodeMekPutInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/put-mek/', info, 'application/json;charset=UTF-8')
}

export function removeMek(info: IahnNodeMekRemoveInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/remove-mek/', info, 'application/json;charset=UTF-8')
}

export function upsertMessage(info: IahnNodeMessageUpsertInfo): Pres<null> {
  return http
    .generalClient()
    .post('settingrepo', 'iahn-node/upsert-message/', info, 'application/json;charset=UTF-8')
}

export function batchUpsertMessageByLocale(info: IahnNodeMessageUpsertByLocaleInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'iahn-node/batch-upsert-message-by-locale/',
      info,
      'application/json;charset=UTF-8',
    )
}

export function batchUpsertMessageByMek(info: IahnNodeMessageUpsertByMekInfo): Pres<null> {
  return http
    .generalClient()
    .post(
      'settingrepo',
      'iahn-node/batch-upsert-message-by-mek/',
      info,
      'application/json;charset=UTF-8',
    )
}

export function inspectMessageForPublic(
  info: PublicIahnNodeMessageInspectInfo,
): Pres<IahnNodeMessageInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'iahn-node/inspect-message-for-public/',
      info,
      'application/json;charset=UTF-8',
    )
}

export function batchInspectMessageByLocaleForPublic(
  info: PublicIahnNodeMessageInspectByLocaleInfo,
): Pres<IahnNodeMessageInspectByLocaleResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'iahn-node/batch-inspect-message-by-locale-for-public/',
      info,
      'application/json;charset=UTF-8',
    )
}

export function inspectLocaleListForPublic(
  info: PublicIahnNodeLocaleListInspectInfo,
): Pres<IahnNodeLocaleListInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'iahn-node/inspect-locale-list-for-public/',
      info,
      'application/json;charset=UTF-8',
    )
}

export function inspectMekListForPublic(
  info: PublicIahnNodeMekListInspectInfo,
): Pres<IahnNodeMekListInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'iahn-node/inspect-mek-list-for-public/',
      info,
      'application/json;charset=UTF-8',
    )
}

export function inspectMessageTableForPublic(
  info: PublicIahnNodeMessageTableInspectInfo,
): Pres<IahnNodeMessageTableInspectResult | null> {
  return http
    .publicClient()
    .post(
      'settingrepo',
      'iahn-node/inspect-message-table-for-public/',
      info,
      'application/json;charset=UTF-8',
    )
}
