// noinspection DuplicatedCode

import type { VimApplicationContext } from '@/vim/types.ts'
import type { StoreSetup, VimStoreModule } from '@/store/types.ts'

import { computed, type ComputedRef, ref } from 'vue'

/**
 * Page Error Store。
 */
export type PageErrorStore = {
  errorText: ComputedRef<string>
  setErrorText: (value: string) => void
}

/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerVimInitializedHook(vimInitializedLoadHook)
  ctx.registerWindowBeforeUnloadHook(windowBeforeUnloadHook)
}

// -----------------------------------------------------------Pinia 定义开始-----------------------------------------------------------
// Store 区域。
const _errorText = ref<string>('')

// 错误文本。
const errorText = computed<string>(() => _errorText.value)

function setErrorText(value: string): void {
  _errorText.value = value
}

// -----------------------------------------------------------Pinia 定义结束-----------------------------------------------------------

// 存储在 LocalStorage 中的持久化主键
const PERSISTENCE_DATA_KEY = 'store.persistence_data.page_error'

/**
 * VIM 初始化钩子。
 */
function vimInitializedLoadHook(): void {
  // 复位参数。
  const persistenceDataJson = localStorage.getItem(PERSISTENCE_DATA_KEY)
  if (persistenceDataJson !== null && persistenceDataJson !== undefined) {
    // 从 JSON 里反序列化的对象不可靠，应以 any 对待，故消除相关警告。
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const persistenceData: any = JSON.parse(persistenceDataJson)
    _errorText.value = persistenceData?.errorText ?? ''
  }
}

/**
 * Window 卸载钩子。
 */
function windowBeforeUnloadHook(): void {
  // 存储参数。
  window.localStorage.setItem(
    PERSISTENCE_DATA_KEY,
    JSON.stringify({
      errorText: _errorText.value,
    }),
  )
}

/**
 * 提供 Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): PageErrorStore => ({
    errorText,
    setErrorText,
  })
}

/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup,
}

// noinspection JSUnusedGlobalSymbols
export default vimStoreModule
