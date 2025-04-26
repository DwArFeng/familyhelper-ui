// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { VimApplicationContext } from '@/vim/types.ts'
import type { StoreSetup, VimStoreModule } from '@/store/types.ts'

import type { ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'
import { ExecutableActionHandleImpl } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'

import type { LnpStore } from '@/store/modules/lnp.ts'

import { computed, type ComputedRef, ref } from 'vue'

import { childForUserUnread } from '@dwarfeng/familyhelper-ui-component-api/src/api/clannad/notification.ts'
import { resolveResponse } from '@/util/response.ts'

// -----------------------------------------------------------初始化逻辑-----------------------------------------------------------
/**
 * VIM 应用上下文。
 */
let ctx: VimApplicationContext | null = null

function init(_ctx: VimApplicationContext): void {
  ctx = _ctx
  ctx.registerVimInitializedHook(vimInitializedLoadHook)
  ctx.registerWindowLoadHook(windowLoadHook)
  ctx.registerWindowBeforeUnloadHook(windowUnloadHook)
}

// -----------------------------------------------------------Store 定义-----------------------------------------------------------
/**
 * Notification Store。
 */
export type NotificationStore = {
  unreadCount: ComputedRef<number>
  setUnreadCount: (value: number) => void
  willUpdateUnreadCount: () => ExecutableActionHandle<void, void, void>
}

// Store 区域。
const _unreadCount = ref<number>(0)

// 未读计数。
const unreadCount = computed<number>(() => _unreadCount.value)

function setUnreadCount(value: number): void {
  _unreadCount.value = value
}

function willUpdateUnreadCount(): ExecutableActionHandle<void, void, void> {
  return new ExecutableActionHandleImpl(() => updateUnreadCount())
}

async function updateUnreadCount(): Promise<void> {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  if (!lnpStore.isLogin) {
    return
  }
  return resolveResponse(childForUserUnread({ string_id: lnpStore.me }, { rows: 0, page: 0 })).then(
    (res) => {
      setUnreadCount(Number(res.count))
    },
  )
}

/**
 * 提供 Store Setup。
 *
 * @returns Store Setup。
 */
function provideStoreSetup(): StoreSetup {
  return (): NotificationStore => ({
    unreadCount,
    setUnreadCount,
    willUpdateUnreadCount,
  })
}

// -----------------------------------------------------------钩子逻辑-----------------------------------------------------------
let unreadUpdateTimer: number

let lnpStoreLoginActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 lnpStoreLoginActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  lnpStoreLoginActionHandle = import.meta.hot.data.lnpStoreLoginActionHandle ?? (() => {})
}

/**
 * VIM 初始化钩子。
 */
function vimInitializedLoadHook(): void {
  // 添加登录监听器。
  addLnpStoreLoginActionListener()
}

function addLnpStoreLoginActionListener(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处，请联系开发人员')
  }

  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  lnpStoreLoginActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willLogin') {
      return
    }
    after((result: ExecutableActionHandle<void, void, void>) => {
      result.registerAfterHook(async () => {
        resolveResponse(childForUserUnread({ string_id: lnpStore.me }, { rows: 0, page: 0 })).then(
          (res) => {
            setUnreadCount(parseInt(res.count))
          },
        )
      })
    })
  })
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreLoginActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLoginActionHandle = lnpStoreLoginActionHandle
  }
}

/**
 * Window 加载钩子。
 */
function windowLoadHook(): void {
  // 初始化 unreadUpdateTimer。
  initUnreadUpdateTimer()
  // 根据登录状态选择性更新未读提醒。
  mayUpdateUnreadCount()
}

function initUnreadUpdateTimer(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  // 设置未阅读提醒更新计时器。
  unreadUpdateTimer = setInterval(() => {
    if (!lnpStore.isLogin) {
      return
    }
    resolveResponse(childForUserUnread({ string_id: lnpStore.me }, { rows: 0, page: 0 })).then(
      (res) => {
        setUnreadCount(Number(res.count))
      },
    )
  }, 30000)
}

function mayUpdateUnreadCount(): void {
  if (!ctx) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  // 如果没有登录，则不更新未读提醒。
  if (!lnpStore.isLogin) {
    return
  }
  // 更新未读提醒。
  resolveResponse(childForUserUnread({ string_id: lnpStore.me }, { rows: 0, page: 0 })).then(
    (res) => {
      setUnreadCount(Number(res.count))
    },
  )
}

/**
 * Window 卸载钩子。
 */
function windowUnloadHook(): void {
  // 清除未阅读提醒更新计时器。
  clearInterval(unreadUpdateTimer)
}

/**
 * VIM Store 模块。
 */
const vimStoreModule: VimStoreModule = {
  init,
  provideStoreSetup,
}

export default vimStoreModule
