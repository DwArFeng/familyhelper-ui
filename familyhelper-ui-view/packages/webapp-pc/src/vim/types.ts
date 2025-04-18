// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { App } from 'vue'
import type { VimApi } from '@/api/types.ts'
import type { VimLibrary } from '@/library/types.ts'
import type { VimNavigation } from '@/navigation/types.ts'
import type { VimRouter } from '@/router/types.ts'
import type { VimStore } from '@/store/types.ts'

/**
 * VIM API。
 */
export interface Vim {
  init: () => Promise<void>
  ctx: () => VimApplicationContext
}

/**
 * VIM 应用上下文。
 */
export interface VimApplicationContext {
  status: 'initializing' | 'initialized'
  app: App
  api: () => Omit<VimApi, 'init'>
  library: () => Omit<VimLibrary, 'init'>
  navigation: () => Omit<VimNavigation, 'init'>
  router: () => Omit<VimRouter, 'init'>
  store: () => Omit<VimStore, 'init'>
  registerVimInitializedHook(hook: () => void): void
  registerVimInitializedHook(hook: () => void, order: number): void
  registerWindowLoadHook(hook: () => void): void
  registerWindowLoadHook(hook: () => void, order: number): void
  registerWindowBeforeUnloadHook(hook: () => void): void
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
