// noinspection DuplicatedCode

import vim from '@/vim'

import type { VimRouterGuard } from '@/router/types.ts'

import type { LnpStore } from '@/store/modules/lnp.ts'
import type { NavigationStore } from '@/store/modules/navigation.ts'
import type { NavigationEzNavStore } from '@/store/modules/navigationEzNav.ts'

type VimRouterGuardMeta = {
  permissionRequired: boolean
  permissionNode?: string
  ezNav: boolean
}

const simpleGuard: VimRouterGuard<object> = (to, from, next) => {
  next()
}

const vimGuard: VimRouterGuard<VimRouterGuardMeta> = (to, from, next) => {
  const lnpStore = vim.ctx().store().vueStore<'lnp', LnpStore>('lnp')
  const navigationStore = vim.ctx().store().vueStore<'navigation', NavigationStore>('navigation')
  const navigationEzNavStore = vim
    .ctx()
    .store()
    .vueStore<'navigation-ez-nav', NavigationEzNavStore>('navigation-ez-nav')

  // 判断是否登录，如果没有登录，直接跳转到登录页面。
  if (!lnpStore.isLogin) {
    next({ name: 'vim.login' })
    return
  }

  // 检查页面的权限。
  const permissionRequired = to.meta.permissionRequired
  const permissionNode = to.meta.permissionNode
  // 如果权限不存在，跳转到权限不存在相应页面。
  if (permissionRequired && (!permissionNode || !lnpStore.hasPermission(permissionNode))) {
    next({ name: 'vim.pageForbidden' })
    return
  }

  // 设置 navigation 模块的当前 navigation 参数为最新的 navigation 参数。
  navigationStore.setCurrentNodeKey(to.name as string)

  // 判断 navigation 的 ezNav 是否生效，如生效，对 ezNav 进行相应操作。
  if (vim.ctx().navigation().setting.ezNavEnabled && to.meta.ezNav) {
    const _to = to ?? {}
    const _from = from ?? {}
    navigationEzNavStore.pushLocateInfo({ from: _from, to: _to })
  }

  // 所有判断通过后，放行页面跳转。
  next()
}

const errorGuard: VimRouterGuard<object> = (to, from, next) => {
  next()
}

// 此处类型确实需要使用 any，故抑制警告。
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const guards: Record<string, VimRouterGuard<any>> = {
  simple: simpleGuard,
  vim: vimGuard,
  error: errorGuard,
}

export default guards
