// noinspection JSUnusedGlobalSymbols

import http from '../../util/http'
import type { StringIdKey } from '../subgrade/key'
import type { PagingInfo } from '../../util/request'
import type { Pres } from '../../util/response'
import { ProfileIndicator } from './profileTypeIndicator'

export type Profile = {
  key: StringIdKey
  name: string
  id_number: string
  id_type: string
  birthday: string
  gender: string
  blood_type: string
  nationality: string
  family_address: string
  phone_number: string
  email_address: string
  employer: string
  job_position: string
  employer_address: string
  job_title: string
  latest_school_name: string
  educational_level: string
  educational_background: string
  political_status: string
  marital_status: string
  remark: string
}

export type UpdateProfile = Profile

export type DispProfile = Profile & {
  id_type_indicator: ProfileIndicator
  gender_indicator: ProfileIndicator
  blood_type_indicator: ProfileIndicator
  nationality_indicator: ProfileIndicator
  educational_level_indicator: ProfileIndicator
  educational_background_indicator: ProfileIndicator
  political_status_indicator: ProfileIndicator
  marital_status_indicator: ProfileIndicator
}

export function exists(key: StringIdKey): Pres<boolean> {
  return http.generalClient().get('clannad', `profile/${key.string_id}/exists/`, {}, 'json')
}

export function inspect(key: StringIdKey): Pres<Profile> {
  return http.generalClient().get('clannad', `profile/${key.string_id}/`, {}, 'json')
}

export function inspectDisp(key: StringIdKey): Pres<Profile> {
  return http.generalClient().get('clannad', `profile/${key.string_id}/disp/`, {}, 'json')
}

export function childForAccountGuest(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Pres<Profile> {
  return http.generalClient().get(
    'clannad',
    `account/${accountKey.string_id}/profile/permitted/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function childForAccountGuestDisp(
  accountKey: StringIdKey,
  pagingInfo: PagingInfo,
): Pres<DispProfile> {
  return http.generalClient().get(
    'clannad',
    `account/${accountKey.string_id}/profile/permitted/disp/`,
    {
      page: pagingInfo.page,
      rows: pagingInfo.rows,
    },
    'json',
  )
}

export function updateProfile(profile: UpdateProfile): Pres<null> {
  return http
    .generalClient()
    .patch('clannad', 'profile/update', profile, 'application/json;charset=UTF-8')
}

export function resetGuestPermission(guests: StringIdKey[]): Pres<null> {
  return http
    .generalClient()
    .post('clannad', 'profile/reset-guest-permission', guests, 'application/json;charset=UTF-8')
}
