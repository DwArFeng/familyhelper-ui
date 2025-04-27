// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type App } from 'vue'
import { type VimApi } from '@/api/types.ts'
import { type VimLibrary } from '@/library/types.ts'
import { type VimNavigation } from '@/navigation/types.ts'
import { type VimRouter } from '@/router/types.ts'
import { type VimStore } from '@/store/types.ts'

/**
 * VIM API。
 */
export interface Vim {
  /**
   * 初始化 VIM。
   *
   * 该字段对应的值是一个函数，调用后返回一个 Promise 对象，`Promise.resolve()` 时表示 VIM 初始化完成。
   *
   * 该方法只应该由 VIM 框架内部调用，开发人员不应该调用该方法。
   */
  init: () => Promise<void>

  /**
   * 获取 VIM 应用上下文。
   *
   * 该字段对应的值是一个函数，调用后返回 VIM 应用上下文对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   */
  ctx: () => VimApplicationContext
}

/**
 * VIM 应用上下文。
 */
export interface VimApplicationContext {
  /**
   * VimApplicationContext 的状态。
   *
   * 可选的值为：
   * - `initializing`：正在初始化。
   * - `initialized`：已初始化。
   */
  status: 'initializing' | 'initialized'

  /**
   * VIM 中的 Vue 应用实例。
   */
  app: App

  /**
   * VIM 中的 api 模块对象。
   *
   * 该字段对应的值是一个函数，调用后返回 VIM 中的 api 模块对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   */
  api: () => Omit<VimApi, 'init'>

  /**
   * VIM 中的 library 模块对象。
   *
   * 该字段对应的值是一个函数，调用后返回 VIM 中的 library 模块对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   */
  library: () => Omit<VimLibrary, 'init'>

  /**
   * VIM 中的 navigation 模块对象。
   *
   * 该字段对应的值是一个函数，调用后返回 VIM 中的 navigation 模块对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   */
  navigation: () => Omit<VimNavigation, 'init'>

  /**
   * VIM 中的 router 模块对象。
   *
   * 该字段对应的值是一个函数，调用后返回 VIM 中的 router 模块对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   */
  router: () => Omit<VimRouter, 'init'>

  /**
   * VIM 中的 store 模块对象。
   *
   * 该字段对应的值是一个函数，调用后返回 VIM 中的 store 模块对象。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   */
  store: () => Omit<VimStore, 'init'>

  /**
   * 注册 VIM 初始化完成的钩子函数。
   *
   * 注册的钩子函数会在 VIM 初始化完成后被调用。
   *
   * 使用该方法注册的钩子的顺序为 `0`，如果没有 `order < 0` 的钩子，则该钩子会在所有钩子之前被调用。
   *
   * 该方法只能在 VIM 初始化过程中调用，即在 `status` 为 `initializing` 时调用。
   *
   * @param hook 钩子函数。
   */
  registerVimInitializedHook(hook: () => void): void

  /**
   * 注册 VIM 初始化完成的钩子函数。
   *
   * 注册的钩子函数会在 VIM 初始化完成后被调用。
   *
   * 钩子函数的执行顺序由 `order` 参数决定，值越小则越先执行。
   *
   * 该方法只能在 VIM 初始化过程中调用，即在 `status` 为 `initializing` 时调用。
   *
   * @param hook 钩子函数。
   * @param order 钩子执行顺序，越小则越先执行。
   */
  registerVimInitializedHook(hook: () => void, order: number): void

  /**
   * 注册窗口加载完成的钩子函数。
   *
   * 注册的钩子函数会在前端页面的 windows 窗口加载完成后被调用。
   *
   * 使用该方法注册的钩子的顺序为 `0`，如果没有 `order < 0` 的钩子，则该钩子会在所有钩子之前被调用。
   *
   * 该方法只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   *
   * @param hook 钩子函数。
   */
  registerWindowLoadHook(hook: () => void): void

  /**
   * 注册窗口加载完成的钩子函数。
   *
   * 注册的钩子函数会在前端页面的 windows 窗口加载完成后被调用。
   *
   * 钩子函数的执行顺序由 `order` 参数决定，值越小则越先执行。
   *
   * 该方法只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   *
   * @param hook 钩子函数。
   * @param order 钩子执行顺序，越小则越先执行。
   */
  registerWindowLoadHook(hook: () => void, order: number): void

  /**
   * 注册窗口卸载的钩子函数。
   *
   * 注册的钩子函数会在前端页面的 windows 窗口卸载前被调用。
   *
   * 使用该方法注册的钩子的顺序为 `0`，如果没有 `order < 0` 的钩子，则该钩子会在所有钩子之前被调用。
   *
   * 该方法只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   *
   * @param hook 钩子函数。
   */
  registerWindowBeforeUnloadHook(hook: () => void): void

  /**
   * 注册窗口卸载的钩子函数。
   *
   * 注册的钩子函数会在前端页面的 windows 窗口卸载前被调用。
   *
   * 钩子函数的执行顺序由 `order` 参数决定，值越小则越先执行。
   *
   * 该方法只能在 VIM 初始化完成后调用，即在 `status` 为 `initialized` 时调用。
   *
   * @param hook 钩子函数。
   * @param order 钩子执行顺序，越小则越先执行。
   */
  registerWindowBeforeUnloadHook(hook: () => void, order: number): void
}

/**
 * VIM 组件。
 */
export interface VimComponent {
  /**
   * 初始化。
   *
   * @param ctx VIM 应用上下文。
   */
  init(ctx: VimApplicationContext): void | Promise<void>
}

/**
 * VIM 组件模块。
 */
export interface VimComponentModule {
  /**
   * 初始化。
   *
   * @param ctx VIM 应用上下文。
   */
  init(ctx: VimApplicationContext): void | Promise<void>
}
