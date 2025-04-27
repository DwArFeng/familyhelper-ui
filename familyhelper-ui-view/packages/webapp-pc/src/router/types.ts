// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimComponent } from '@/vim/types.ts'
import { type Router } from 'vue-router'

// -----------------------------------------------------------VIM 组件定义-----------------------------------------------------------
/**
 * VIM Router。
 */
export interface VimRouter extends VimComponent {
  /**
   * Vue 路由。
   *
   * 该字段对应的值是一个函数，调用后返回一个 Vue 的 Router 实例。
   *
   * 该字段对应的值只能在 VIM 初始化完成后调用，
   * 即在 `VimApplicationContext.status` 为 `initialized` 时调用。
   */
  vueRouter: () => Router
}

/**
 * VIM 路由守卫。
 *
 * 该类型是一个函数，传入 `to`，`from` 和 `next` 三个参数，返回 `void`。
 *
 * 参数说明如下：
 * - `to`：目标路由地址。
 * - `from`：原路由地址。
 * - `next`：路由跳转函数。
 */
export type VimRouterGuard<M> = (
  to: VimRouterLocation<M>,
  from: VimRouterLocation<M>,
  next: VimRouterNext,
) => void

/**
 * VIM 路由地址。
 *
 * @template M 路由元数据类型
 */
export type VimRouterLocation<M> = {
  /**
   * 名称。
   */
  name: string

  /**
   * 元数据。
   */
  meta: M

  /**
   * 参数。
   */
  params?: object

  /**
   * 查询。
   */
  query?: object
}

/**
 * VIM 路由跳转。
 *
 * 该类型是一个函数，有以下重载：
 * 1. 无参数调用，表示跳转到目标路由地址。
 * 2. 传入一个 `VimRouterLocate` 对象，表示跳转到指定的路由地址。
 */
export type VimRouterNext = {
  (): void
  (location: VimRouterLocate): void
}

/**
 * VIM 路由地址。
 */
export type VimRouterLocate = {
  /**
   * 名称。
   */
  name: string

  /**
   * 参数。
   */
  params?: object

  /**
   * 查询。
   */
  query?: object
}
