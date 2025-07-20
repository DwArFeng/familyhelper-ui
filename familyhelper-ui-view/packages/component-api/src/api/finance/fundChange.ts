// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import { type LongIdKey } from '../subgrade/key'
import { type Pres, type Prespa } from '../../util/response'
import { type PagingInfo } from '../../util/request'

import { type DispAccountBook } from './accountBook'
import { type FundChangeTypeIndicator } from './fundChangeTypeIndicator'

export type FundChange = {
  key: LongIdKey
  account_book_key: LongIdKey
  delta: number
  change_type: string
  happened_date: number
  remark: string
  recorded_date: number
}

export type DispFundChange = FundChange & {
  account_book: DispAccountBook
  type_indicator: FundChangeTypeIndicator
}

export type FundChangeRecordInfo = {
  account_book_key: LongIdKey
  delta: number
  change_type: string
  remark: string
  happened_date: number | null
}

export type FundChangeUpdateInfo = {
  fund_change_key: LongIdKey
  delta: number
  change_type: string
  remark: string
  happened_date: number | null
}

export function exists(key: LongIdKey): Pres<boolean> {
  return http.generalClient().get('finance', `fund-change/${key.long_id}/exists/`, {}, 'json')
}

export function inspect(key: LongIdKey): Pres<FundChange> {
  return http.generalClient().get('finance', `fund-change/${key.long_id}/`, {}, 'json')
}

export function all(pagingInfo: PagingInfo): Prespa<FundChange> {
  return http.generalClient().get(
    'finance',
    'fund-change/all/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBook(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<FundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookDesc(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<FundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/desc`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookTypeEquals(
  accountBookKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<FundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/type-equals`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookTypeEqualsDesc(
  accountBookKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<FundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/type-equals-desc`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookWithConditionDisplay(
  accountBookKey: LongIdKey,
  changeType: string,
  remarkPattern: string,
  pagingInfo: PagingInfo,
): Prespa<FundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/with-condition-display`,
    {
      'change-type': changeType,
      'remark-pattern': remarkPattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function inspectDisp(key: LongIdKey): Pres<DispFundChange> {
  return http.generalClient().get('finance', `fund-change/${key.long_id}/disp/`, {}, 'json')
}

export function allDisp(pagingInfo: PagingInfo): Prespa<DispFundChange> {
  return http.generalClient().get(
    'finance',
    'fund-change/all/disp/',
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookDisp(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispFundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookDescDisp(
  accountBookKey: LongIdKey,
  pagingInfo: PagingInfo,
): Prespa<DispFundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/desc/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookTypeEqualsDisp(
  accountBookKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispFundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/type-equals/disp`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookTypeEqualsDescDisp(
  accountBookKey: LongIdKey,
  pattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispFundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/type-equals-desc/disp`,
    {
      pattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountBookWithConditionDisplayDisp(
  accountBookKey: LongIdKey,
  changeType: string,
  remarkPattern: string,
  pagingInfo: PagingInfo,
): Prespa<DispFundChange> {
  return http.generalClient().get(
    'finance',
    `account-book/${accountBookKey.long_id}/fund-change/with-condition-display/disp`,
    {
      'change-type': changeType,
      'remark-pattern': remarkPattern,
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function record(recordInfo: FundChangeRecordInfo): Pres<LongIdKey> {
  return http
    .generalClient()
    .post('finance', 'fund-change/record', recordInfo, 'application/json;charset=UTF-8')
}

export function update(updateInfo: FundChangeUpdateInfo): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'fund-change/update', updateInfo, 'application/json;charset=UTF-8')
}

export function remove(fundChangeKey: LongIdKey): Pres<null> {
  return http
    .generalClient()
    .post('finance', 'fund-change/remove', fundChangeKey, 'application/json;charset=UTF-8')
}
