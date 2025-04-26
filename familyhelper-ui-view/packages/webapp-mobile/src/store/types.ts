// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { VimComponent, VimComponentModule } from '@/vim/types.ts'
import {
  type _ExtractActionsFromSetupStore,
  type _ExtractGettersFromSetupStore,
  type _ExtractStateFromSetupStore,
  type Store,
  type StoreDefinition,
} from 'pinia'

// -----------------------------------------------------------VIM 组件定义-----------------------------------------------------------
/**
 * VIM Store。
 */
export interface VimStore extends VimComponent {
  /**
   * 获取 Vue Store 定义。
   */
  vueStoreDefinition: <ID extends string, SS>(id: ID) => SimplyStoreDefinition<ID, SS>

  /**
   * 获取 Vue Store。
   */
  vueStore: <ID extends string, SS>(id: ID) => SimplyStore<ID, SS>
}

/**
 * 简化 Store 定义。
 */
export type SimplyStoreDefinition<ID extends string, SS> = StoreDefinition<
  ID,
  _ExtractStateFromSetupStore<SS>,
  _ExtractGettersFromSetupStore<SS>,
  _ExtractActionsFromSetupStore<SS>
>

/**
 * 简化 Store。
 */
export type SimplyStore<ID extends string, SS> = Store<
  ID,
  _ExtractStateFromSetupStore<SS>,
  _ExtractGettersFromSetupStore<SS>,
  _ExtractActionsFromSetupStore<SS>
>

// -----------------------------------------------------------模块定义-----------------------------------------------------------
/**
 * VIM Store 模块。
 */
export interface VimStoreModule extends VimComponentModule {
  /**
   * 提供 Store Setup。
   */
  provideStoreSetup(): StoreSetup
}

/**
 * Store Setup。
 */
export type StoreSetup = {
  /**
   * Store Setup 函数。
   */
  (): unknown
}

/**
 * Store Hook。
 */
export type StoreHook = {
  postConstructHook?: () => void
  loadHook?: () => void
  beforeUnloadHook?: () => void
}
