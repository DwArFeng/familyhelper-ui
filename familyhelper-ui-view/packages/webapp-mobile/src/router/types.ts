import type { VimComponent } from '@/vim/types.ts'
import type { Router } from 'vue-router'

// -----------------------------------------------------------VIM 组件定义-----------------------------------------------------------
/**
 * VIM Router。
 */
export interface VimRouter extends VimComponent {
  vueRouter: () => Router
}

/**
 * VIM 路由守卫。
 */
export type VimRouterGuard<M> = (
  to: VimRouterLocation<M>,
  from: VimRouterLocation<M>,
  next: VimRouterNext,
) => void

/**
 * VIM 路由地址。
 */
export type VimRouterLocation<M> = {
  name: string
  meta: M
  params?: object
  query?: object
}

/**
 * VIM 路由 Next。
 */
export type VimRouterNext = {
  (): void
  (location: VimRouterLocate): void
}

/**
 * VIM 路由定位。
 */
export type VimRouterLocate = {
  name: string
  param?: object
  query?: object
}
