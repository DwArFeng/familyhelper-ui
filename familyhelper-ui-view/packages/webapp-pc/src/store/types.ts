// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimComponent, type VimComponentModule } from '@/vim/types.ts'
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
   * Vue Store 定义。
   *
   * 该字段对应的值是一个函数，接受 id，返回对应的 Pinia Store 定义对象。
   *
   * 该字段的值对应的函数中，id 必须是一个 `./modules` 目录下的合法模块名称。
   * 模块名称与 `./modules` 目录的文件名的 `kebab-case` 形式相同。
   *
   * 例如：
   * ```
   * . - modules 目录
   * ├─── foo.ts - foo 模块（假设该模块是合法的）
   * ├─── bar.ts - bar 模块 （假设该模块是合法的）
   * └─── fooBarBaz.ts - foo-bar-baz 模块 （假设该模块是合法的）
   * ```
   *
   * 在上面的例子中，id  的值可以是 `foo`， `bar` 或 `foo-bar-baz`。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  vueStoreDefinition: <ID extends string, SS>(id: ID) => SimplyStoreDefinition<ID, SS>

  /**
   * 获取 Vue Store。
   *
   * 该字段对应的值是一个函数，接受 id，返回对应的 Pinia Store 实例。
   *
   * 该字段的值对应的函数中，id 必须是一个 `./modules` 目录下的合法模块名称。
   * 模块名称与 `./modules` 目录的文件名的 `kebab-case` 形式相同。
   *
   * 例如：
   * ```
   * . - modules 目录
   * ├─── foo.ts - foo 模块（假设该模块是合法的）
   * ├─── bar.ts - bar 模块 （假设该模块是合法的）
   * └─── fooBarBaz.ts - foo-bar-baz 模块 （假设该模块是合法的）
   * ```
   *
   * 在上面的例子中，id  的值可以是 `foo`， `bar` 或 `foo-bar-baz`。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  vueStore: <ID extends string, SS>(id: ID) => SimplyStore<ID, SS>
}

/**
 * 简化 Store 定义。
 *
 * 该类型表示一个简化的 Pinia Store 定义对象。
 */
export type SimplyStoreDefinition<ID extends string, SS> = StoreDefinition<
  ID,
  _ExtractStateFromSetupStore<SS>,
  _ExtractGettersFromSetupStore<SS>,
  _ExtractActionsFromSetupStore<SS>
>

/**
 * 简化 Store。
 *
 * 该类型表示一个简化的 Pinia Store 实例。
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
 *
 * 该类型是一个函数，有以下重载：
 * 1. 无参数调用，返回一个 unknown 类型的值，表示 Store 的状态、getters 和 actions。
 */
export type StoreSetup = {
  (): unknown
}
