// noinspection JSUnusedGlobalSymbols

import vim from '@/vim'

import type { LnpStore } from '@/store/modules/lnp.ts'

import {
  operateInspect,
  operatePut,
} from '@dwarfeng/familyhelper-ui-component-api/src/api/settingrepo/textNode.ts'
import { resolveResponse } from '@/util/response.ts'

export type UseUserPreferenceResult = {
  loadUserPreference: () => Promise<void>
  saveUserPreference: () => Promise<void>
}

/**
 * 使用用户偏好设置。
 *
 * 用户偏好是 VIM 框架中的一个机制，这个机制允许根据以用户为区分记录同一项
 * `UPSC (User Preference Setting Category)` 的不同值。
 *
 * 该机制可以用于用户的个性化设置，如用户使用的语言、主题、字体，乃至表格某一列的宽度等等。
 *
 * 该方法可以简化用户偏好的使用，只需提供以下的参数，便可实现完整的用户偏好功能：
 * - `upscProvider`：用户偏好设置分类的提供者，被调用时应返回一个字符串，作为 `UPSC` 的值。
 *   之所以使用函数而不是直接传入字符串，是因为使用用户偏好机制的对象可能是个通用组件，
 *   通用组件的 `UPSC` 通常是调用的父组件决定的，在这种情况下，
 *   当父组件的传值变化后，`UPSC` 也应该对应地发送变化。如果使用字符串，而不使用函数，
 *   则会导致传入的 `UPSC` 为 `null`。
 * - `defaultUserPreference`：用户偏好的默认值，通常是一个对象，在存储用户偏好时，如果没有用户偏好，
 *   则使用该值。
 * - `userPreferenceProvide`：用户偏好获取函数，返回当前的用户偏好，当用户偏好不存在时，返回 `null`。
 * - `userPreferenceApply`：用户偏好应用函数，接受用户偏好的值，通常是一个对象，用于在读取用户偏好后，
 *   将持久化的用户偏好值应用到当前场景中。
 *
 * 返回的结果中：
 * - `loadUserPreference`：加载用户偏好的方法，调用该方法后，会从持久化存储中加载用户偏好。
 * - `saveUserPreference`：保存用户偏好的方法，调用该方法后，会将当前的用户偏好持久化到存储中。
 *
 * @param upscProvider 用户偏好的分类提供者。
 * @param defaultUserPreference 用户偏好的默认值。
 * @param userPreferenceProvide 用户偏好获取函数。
 * @param userPreferenceApply 用户偏好应用函数。
 * @returns 调用方法后的返回结果。
 */
export function useUserPreference<UP extends Record<string, unknown>>(
  upscProvider: () => string,
  defaultUserPreference: UP,
  userPreferenceProvide: () => UP | null,
  userPreferenceApply: (userPreference: UP) => void,
): UseUserPreferenceResult {
  async function loadUserPreference(): Promise<void> {
    const upsc: string = upscProvider()

    if (!upsc) {
      throw new Error('不能在 upsc 为空的情况下调用 loadUserPreference')
    }

    const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')
    const res = await resolveResponse(
      operateInspect({
        category: upsc,
        args: [lnpStore.me],
      }),
    )
    const userPreferenceString = res?.value ?? null
    let userPreference: UP
    if (userPreferenceString === null) {
      userPreference = Object.assign({}, defaultUserPreference)
    } else {
      userPreference = Object.assign({}, defaultUserPreference)
      Object.assign(userPreference, JSON.parse(userPreferenceString))
    }
    userPreferenceApply(userPreference)
  }

  async function saveUserPreference(): Promise<void> {
    const upsc: string = upscProvider()

    if (!upsc) {
      throw new Error('不能在 upsc 为空的情况下调用 saveUserPreference')
    }

    const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')
    let userPreference: UP | null = userPreferenceProvide()
    if (!userPreference) {
      userPreference = Object.assign({}, defaultUserPreference)
    }
    await resolveResponse(
      operatePut({
        category: upsc,
        args: [lnpStore.me],
        value: JSON.stringify(userPreference),
      }),
    )
  }

  return {
    loadUserPreference,
    saveUserPreference,
  } as UseUserPreferenceResult
}
