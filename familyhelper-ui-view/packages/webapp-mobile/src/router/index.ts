// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import type { VimApplicationContext } from '@/vim/types.ts'

import { noGuardNameErrorText, guardNotExistsErrorText } from './texts.ts'

import type { VimRouter, VimRouterLocation } from '@/router/types.ts'

import type { LnpStore } from '@/store/modules/lnp.ts'

import type { ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'

import type { NavigationNodeInfo } from '@/navigation/types.ts'

import type {
  NavigationGuardNext,
  RouteLocationNormalizedGeneric,
  Router,
  RouteRecordRaw,
} from 'vue-router'
import { createRouter, createWebHashHistory } from 'vue-router'

import guards from './guards.ts'
import type { PageErrorStore } from '@/store/modules/pageError.ts'

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 status。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  status = import.meta.hot.data.status ?? 'initializing'
}

/**
 * Router。
 */
const router: VimRouter = {
  init,
  vueRouter: vimRouter,
}

/**
 * Vue Router。
 */
let vueRouter: Router | null = null

/**
 * 基础路由表。
 */
const baseRoute: RouteRecordRaw = {
  name: '',
  path: '/',
  redirect: {
    name: 'vim',
  },
}

/**
 * VIM 布局路由表。
 */
const vimLayoutRoute: RouteRecordRaw = {
  name: 'vim.layout',
  path: '/vim/layout',
  component: () => import('@/views/vim/layout/Layout.vue'),
  children: [],
  meta: {
    guard: 'vim',
  },
}

/**
 * VIM 路由表。
 */
const vimRoutes: RouteRecordRaw[] = [
  {
    name: 'vim',
    path: '/vim',
    redirect: '/vim/layout',
  },
  {
    name: 'vim.login',
    path: '/vim/login',
    component: () => import('@/views/vim/login/Login.vue'),
    meta: {
      guard: 'simple',
    },
  },
  vimLayoutRoute,
  {
    name: 'vim.pageForbidden',
    path: '/vim/page-forbidden',
    component: () => import('@/views/vim/pageForbidden/PageForbidden.vue'),
    meta: {
      guard: 'error',
    },
  },
  {
    name: 'vim.pageNotFound',
    path: '/vim/page-not-found',
    component: () => import('@/views/vim/pageNotFound/PageNotFound.vue'),
    meta: {
      guard: 'error',
    },
  },
  {
    name: 'vim.pageError',
    path: '/vim/page-error',
    component: () => import('@/views/vim/pageError/PageError.vue'),
    meta: {
      guard: 'error',
    },
  },
]

/**
 * 初始化。
 *
 * @param ctx VIM 应用上下文对象。
 */
function init(ctx: VimApplicationContext): void {
  // 检查状态。
  if (status !== 'initializing') {
    throw new Error('只能在 initializing 状态下初始化')
  }

  // 注册 VIM loaded 钩子，在回调中执行初始化调度。
  ctx.registerVimInitializedHook(() => {
    addLnpStoreLoginActionListener(ctx)
    addLnpStoreLogoutActionListener(ctx)
    addLnpStoreFireKickActionListener(ctx)
    initRouter(ctx)
    finishInitializing(ctx)
  }, 1000000000)

  // 注册 Window beforeunload 钩子，在回调中执行销毁调度。
  ctx.registerWindowBeforeUnloadHook(() => {
    removeLnpStoreLoginActionListener()
    removeLnpStoreLogoutActionListener()
    removeLnpStoreFireKickActionListener()
  }, 1000000000)
}

let lnpStoreLoginActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 lnpStoreLoginActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  lnpStoreLoginActionHandle = import.meta.hot.data.lnpStoreLoginActionHandle ?? (() => {})
}

let lnpStoreLogoutActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 lnpStoreLogoutActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  lnpStoreLogoutActionHandle = import.meta.hot.data.lnpStoreLogoutActionHandle ?? (() => {})
}

let lnpStoreFireKickActionHandle: () => void = () => {}
if (import.meta.hot) {
  /*
   * 处于热模块替换环境时，从 hot.data 中还原 lnpStoreFireKickActionHandle。
   * 从而规避热模块替换时内部变量值丢失的问题。
   */
  lnpStoreFireKickActionHandle = import.meta.hot.data.lnpStoreFireKickActionHandle ?? (() => {})
}

function addLnpStoreLoginActionListener(ctx: VimApplicationContext): void {
  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  lnpStoreLoginActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willLogin') {
      return
    }
    after((result: ExecutableActionHandle<void, void, void>) => {
      result.registerAfterHook(async () => {
        if (!vueRouter) {
          throw new Error('不应该执行到此处, 请联系开发人员')
        }
        return vueRouter.push({ name: 'vim.layout' }).then(() => Promise.resolve())
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

function initRouter(ctx: VimApplicationContext): void {
  // 解析 VIM 布局路由表的重定向。
  const defaultNodeKey: string = ctx.navigation().setting.defaultNavigationKey
  vimLayoutRoute.redirect = { name: defaultNodeKey }

  // 创建 router，并设置静态路由表。
  vueRouter = createRouter({
    history: createWebHashHistory(),
    routes: [baseRoute, ...vimRoutes],
  })

  // 添加 vim 路由表。
  addVimRoutes(ctx)

  // 添加路由守卫。
  vueRouter.beforeEach(
    (
      to: RouteLocationNormalizedGeneric,
      from: RouteLocationNormalizedGeneric,
      next: NavigationGuardNext,
    ) => {
      if (!vueRouter) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }

      const pageErrorStore = ctx.store().vueStore<'page-error', PageErrorStore>('page-error')

      // 判断页面是否存在，如果页面不存在，则跳转到 vim.pageNotFound 页面。
      if (!to.name || !vueRouter.hasRoute(to.name)) {
        next({ name: 'vim.pageNotFound' })
        return
      }

      // 检查路由元数据的 guard 字段。
      const guardName: string | undefined = to.meta.guard as string | undefined
      // 如果路由没有配置权限，则跳转到内部错误页面。
      if (guardName === undefined) {
        pageErrorStore.setErrorText(noGuardNameErrorText(to))
        next({ name: 'vim.pageError' })
        return
      }
      // 从 guards 中取出对应的 guard。
      const guard = guards[guardName]
      // 如果 guard 不存在，则跳转到内部页面。
      if (!guard) {
        pageErrorStore.setErrorText(guardNotExistsErrorText(to, guardName))
        next({ name: 'vim.pageError' })
        return
      }
      // 类型处理。
      // 此处类型确实需要使用 any，故抑制警告。
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _to: VimRouterLocation<any> = {
        name: to.name as string,
        meta: to.meta,
        params: to.params,
        query: to.query,
      }
      // 此处类型确实需要使用 any，故抑制警告。
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const _from: VimRouterLocation<any> = {
        name: from.name as string,
        meta: from.meta,
        params: from.params,
        query: from.query,
      }
      // 执行代理守卫。
      guard(_to, _from, next)
    },
  )
}

function addVimRoutes(ctx: VimApplicationContext): void {
  if (!vueRouter) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  // 获取导航节点。
  const nodeInfos: Readonly<NavigationNodeInfo[]> = ctx.navigation().nodeInfos()

  // 遍历导航节点。
  for (const nodeInfo of nodeInfos) {
    // 如果节点没有 router 信息，则跳过。
    if (!nodeInfo.router.required) {
      continue
    }

    type Meta = {
      guard: 'vim'
      permissionRequired: boolean
      permissionNode?: string
      ezNav: boolean
    }

    // 构建元数据。
    const meta: Meta = {
      guard: 'vim',
      permissionRequired: nodeInfo.permission.required,
      permissionNode: nodeInfo.permission.node,
      ezNav: nodeInfo.ezNav.shown,
    }

    // 构建 vim 子路由记录。
    const vimChildRoute: RouteRecordRaw = {
      name: nodeInfo.key,
      path: '/vim/layout/' + (nodeInfo.router.path ?? ''),
      component: nodeInfo.router.component,
      meta: meta,
    }

    // 将路由记录添加到 vim 路由表中。
    vueRouter.addRoute('vim.layout', vimChildRoute)
  }
}

function addLnpStoreLogoutActionListener(ctx: VimApplicationContext): void {
  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  lnpStoreLogoutActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willLogout') {
      return
    }
    after((result: ExecutableActionHandle<void, void, void>) => {
      result.registerAfterHook(async () => {
        if (!vueRouter) {
          throw new Error('不应该执行到此处, 请联系开发人员')
        }
        return vueRouter.push({ name: 'vim.login' }).then(() => Promise.resolve())
      })
    })
  })
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreLogoutActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLogoutActionHandle = lnpStoreLogoutActionHandle
  }
}

function addLnpStoreFireKickActionListener(ctx: VimApplicationContext): void {
  const lnpStore = ctx.store().vueStore<'lnp', LnpStore>('lnp')
  lnpStoreFireKickActionHandle = lnpStore.$onAction(({ name, after }) => {
    if (name !== 'willFireKick') {
      return
    }
    after((result: ExecutableActionHandle<void, void, void>) => {
      result.registerAfterHook(async () => {
        if (!vueRouter) {
          throw new Error('不应该执行到此处, 请联系开发人员')
        }
        return vueRouter.push({ name: 'vim.login' }).then(() => Promise.resolve())
      })
    })
  })
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreFireKickActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreFireKickActionHandle = lnpStoreFireKickActionHandle
  }
}

function finishInitializing(ctx: VimApplicationContext): void {
  if (!vueRouter) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }

  // Vue 应用使用 router。
  ctx.app.use(vueRouter)

  // 设置状态。
  status = 'initialized'
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 status 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.status = status
  }
}

function removeLnpStoreLoginActionListener(): void {
  lnpStoreLoginActionHandle()
  lnpStoreLoginActionHandle = () => {}
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreLoginActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLoginActionHandle = lnpStoreLoginActionHandle
  }
}

function removeLnpStoreLogoutActionListener(): void {
  lnpStoreLogoutActionHandle()
  lnpStoreLogoutActionHandle = () => {}
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreLogoutActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreLogoutActionHandle = lnpStoreLogoutActionHandle
  }
}

function removeLnpStoreFireKickActionListener(): void {
  lnpStoreFireKickActionHandle()
  lnpStoreFireKickActionHandle = () => {}
  if (import.meta.hot) {
    /*
     * 处于热模块替换环境时，将 lnpStoreFireKickActionHandle 保存到 hot.data 中。
     * 从而规避热模块替换时内部变量值丢失的问题。
     */
    import.meta.hot.data.lnpStoreFireKickActionHandle = lnpStoreFireKickActionHandle
  }
}

/**
 * 获取 Router。
 *
 * @returns Router。
 */
function vimRouter(): Router {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 router')
  }
  if (!vueRouter) {
    throw new Error('不应该执行到此处, 请联系开发人员')
  }
  return vueRouter
}

export default router
