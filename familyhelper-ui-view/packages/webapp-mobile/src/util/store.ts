// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { computed, type ComputedRef } from 'vue'

import vim from '@/vim'

import { type SimplyStore } from '@/store/types.ts'

/**
 * 表示"所有带 `ready` 属性的 store 是否都已就绪"的计算属性。
 *
 * 遍历 store 中已注册的所有 SimplyStoreDefinition 对应实例，
 * 若实例上存在 `ready` 属性则参与判断：仅当这些 `ready` 均为 `true` 时返回 `true`，否则返回 `false`；
 * 无 `ready` 的 store 不参与判断。
 */
export const ready: ComputedRef<boolean> = computed(() => {
  const ids: string[] = vim.ctx().store().storeIds()
  for (const id of ids) {
    const s: SimplyStore<string, unknown> = vim.ctx().store().vueStore(id)
    if (!('ready' in s) || s.ready === undefined) {
      continue
    }
    const value: unknown = s.ready
    const readyValue =
      typeof value === 'object' && value !== null && 'value' in value
        ? (value as { value: boolean }).value
        : (value as boolean)
    if (!readyValue) {
      return false
    }
  }
  return true
})
