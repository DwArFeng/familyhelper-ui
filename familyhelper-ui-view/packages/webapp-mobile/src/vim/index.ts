// noinspection DuplicatedCode

// 导入 App 组件。
import App from '@/App.vue'
// 导入 createApp 函数。
import { createApp } from 'vue'

// 导入 VimApplicationContext 类型。
import type { Vim, VimApplicationContext } from '@/vim/types.ts'

// 导入 api 模块。
import api from '@/api'
import type { VimApi } from '@/api/types.ts'

// 导入 library 模块。
import library from '@/library'
import type { VimLibrary } from '@/library/types.ts'

// 导入 navigation 模块。
import navigation from '@/navigation'
import type { VimNavigation } from '@/navigation/types.ts'

// 导入 router 模块。
import router from '@/router'
import type { VimRouter } from '@/router/types.ts'

// 导入 store 模块。
import store from '@/store'
import type { VimStore } from '@/store/types.ts'

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'

/**
 * VIM 应用上下文。
 */
let vimApplicationContext: VimApplicationContext | null = null

if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 status 和 vimApplicationContext。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  status = import.meta.hot.data.status ?? 'initializing'
  vimApplicationContext = import.meta.hot.data.vimApplicationContext ?? null
}

/**
 * VIM 对象。
 */
const vim: Vim = {
  init,
  ctx,
}

/**
 * 初始化。
 */
async function init(): Promise<void> {
  // 判断状态。
  if (status !== 'initializing') {
    throw new Error('只能在 initializing 状态下初始化')
  }

  // 创建 Vue 应用实例。
  const app = createApp(App)

  // 设置 VIM 应用上下文。
  vimApplicationContext = {
    status: 'initializing',
    app: app,
    api: provideApi,
    library: provideLibrary,
    navigation: provideNavigation,
    router: provideRouter,
    store: provideStore,
    registerVimInitializedHook,
    registerWindowLoadHook,
    registerWindowBeforeUnloadHook,
  }

  // 将 vimApplicationContext.status 设置为 'initializing'。
  vimApplicationContext.status = 'initializing'

  // 定义 Promise 数组。
  const promises: Promise<void>[] = []

  // 定义组件初始化的返回值。
  let mayPromise: void | Promise<void>

  // 初始化 api 模块。
  mayPromise = api.init(vimApplicationContext)
  if (mayPromise instanceof Promise) {
    promises.push(mayPromise)
  }

  // 初始化 library 模块。
  mayPromise = library.init(vimApplicationContext)
  if (mayPromise instanceof Promise) {
    promises.push(mayPromise)
  }

  // 初始化 navigation 模块。
  mayPromise = navigation.init(vimApplicationContext)
  if (mayPromise instanceof Promise) {
    promises.push(mayPromise)
  }

  // 初始化 router 模块。
  mayPromise = router.init(vimApplicationContext)
  if (mayPromise instanceof Promise) {
    promises.push(mayPromise)
  }

  // 初始化 store 模块。
  mayPromise = store.init(vimApplicationContext)
  if (mayPromise instanceof Promise) {
    promises.push(mayPromise)
  }

  // 等待所有 Promise 完成。
  await Promise.all(promises)

  // 将 vimApplicationContext.status 设置为 'initialized'。
  vimApplicationContext.status = 'initialized'

  // 排序，并依次调用钩子列表中的 hook。
  vimLoadedHooks.sort((a, b) => a.order - b.order)
  for (const { hook } of vimLoadedHooks) {
    hook()
  }

  // 向 window 添加 load 事件监听器。
  window.addEventListener('load', () => {
    // 排序，并依次调用钩子列表中的 hook。
    windowLoadHooks.sort((a, b) => a.order - b.order)
    for (const { hook } of windowLoadHooks) {
      hook()
    }
  })

  // 向 window 添加 beforeunload 事件监听器。
  window.addEventListener('beforeunload', () => {
    // 排序，并依次调用钩子列表中的 hook。
    windowBeforeUnloadHooks.sort((a, b) => a.order - b.order)
    for (const { hook } of windowBeforeUnloadHooks) {
      hook()
    }
  })

  // 设置状态。
  status = 'initialized'

  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 status 和 vimApplicationContext 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.status = status
    import.meta.hot.data.vimApplicationContext = vimApplicationContext
  }
}

/**
 * 提供 Api。
 */
function provideApi(): Omit<VimApi, 'init'> {
  if (!vimApplicationContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (vimApplicationContext.status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 api')
  }
  return api
}

/**
 * 提供 Library。
 */
function provideLibrary(): Omit<VimLibrary, 'init'> {
  if (!vimApplicationContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (vimApplicationContext.status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 library')
  }
  return library
}

/**
 * 提供 Navigation。
 */
function provideNavigation(): Omit<VimNavigation, 'init'> {
  if (!vimApplicationContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (vimApplicationContext.status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 navigation')
  }
  return navigation
}

/**
 * 提供 Router。
 */
function provideRouter(): Omit<VimRouter, 'init'> {
  if (!vimApplicationContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (vimApplicationContext.status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 router')
  }
  return router
}

/**
 * 提供 Store。
 */
function provideStore(): Omit<VimStore, 'init'> {
  if (!vimApplicationContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (vimApplicationContext.status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 store')
  }
  return store
}

// 定义钩子列表。
const vimLoadedHooks: { hook: () => void; order: number }[] = []
const windowLoadHooks: { hook: () => void; order: number }[] = []
const windowBeforeUnloadHooks: { hook: () => void; order: number }[] = []

/**
 * 注册 VIM loaded 钩子。
 *
 * @param hook 钩子。
 * @param order 钩子执行顺序，越小则越先执行。
 */
function registerVimInitializedHook(hook: () => void, order: number = 0): void {
  if (!vimApplicationContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (vimApplicationContext.status !== 'initializing') {
    throw new Error('只能在 initializing 状态下注册 VIM loaded 钩子')
  }
  vimLoadedHooks.push({ hook, order })
}

/**
 * 注册 Window load 钩子。
 *
 * @param hook 钩子。
 * @param order 钩子执行顺序，越小则越先执行。
 */
function registerWindowLoadHook(hook: () => void, order: number = 0): void {
  if (!vimApplicationContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (vimApplicationContext.status !== 'initializing') {
    throw new Error('只能在 initializing 状态下注册 Window load 钩子')
  }
  windowLoadHooks.push({ hook, order })
}

/**
 * 注册 Window beforeunload 钩子。
 *
 * @param hook 钩子。
 * @param order 钩子执行顺序，越小则越先执行。
 */
function registerWindowBeforeUnloadHook(hook: () => void, order: number = 0): void {
  if (!vimApplicationContext) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  if (vimApplicationContext.status !== 'initializing') {
    throw new Error('只能在 initializing 状态下注册 Window beforeunload 钩子')
  }
  windowBeforeUnloadHooks.push({ hook, order })
}

/**
 * 获取 VIM 应用上下文。
 *
 * @returns VIM 应用上下文。
 */
function ctx(): VimApplicationContext {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 ctx')
  }
  if (vimApplicationContext === null) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return vimApplicationContext
}

export default vim
