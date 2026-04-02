// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { nextTick, watch } from 'vue'

import { type VimApplicationContext } from '@/vim/types.ts'

import { guardNotExistsErrorText, noGuardNameErrorText } from './texts.ts'

import { type VimRouter, type VimRouterLocation } from '@/router/types.ts'

import { type LnpStore } from '@/store/modules/lnp.ts'

import { type ExecutableActionHandle } from '@dwarfeng/familyhelper-ui-component-util/src/util/store.ts'
import { type JsonObject } from '@dwarfeng/familyhelper-ui-component-util/src/util/json.ts'

import {
  createRouter,
  createWebHashHistory,
  type NavigationGuardNext,
  type RouteLocationNormalizedGeneric,
  type Router,
  type RouteRecordRaw,
} from 'vue-router'

import guards from './guards.ts'

import { type PageErrorStore } from '@/store/modules/pageError.ts'

import { ready } from '@/util/store.ts'
import { type VisualizerStore } from '@/store/modules/visualizer.ts'
import { type NavigationStore } from '@/store/modules/navigation.ts'
import { type NodeInfo } from '@/navigation/types.ts'

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
const baseRoute: Readonly<RouteRecordRaw> = {
  name: '',
  path: '/',
  redirect: {
    name: 'vim',
  },
}

/**
 * VIM 布局路由表。
 *
 * 该路由表内的定义为初始值用于在动态导航加载完毕之前前提供通用路径匹配。
 * 在动态导航加载完毕之后，会使用实际的导航节点信息更新该路由表。
 */
const vimLayoutRoute: RouteRecordRaw = {
  name: 'vim.layout',
  path: '/vim/layout/:path*',
  component: () => import('@/views/vim/layout/Layout.vue'),
  children: [],
  meta: {
    guard: 'vim',
  },
}

/**
 * VIM 路由表。
 */
const vimRoutes: Readonly<RouteRecordRaw[]> = [
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
    initBaseRouter(ctx)
    finishInitializing(ctx)
  }, 1000000000)

  // 注册 Window load 钩子，在回调中添加有关数据的监听，并在相关数据变化时更新路由表。
  ctx.registerWindowLoadHook(() => {
    watchRelatedDataToRefreshVimLayoutRoutes(ctx)
  })

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

function initBaseRouter(ctx: VimApplicationContext): void {
  function doGuard(
    to: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedGeneric,
    next: NavigationGuardNext,
  ): void {
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
  }

  // 创建 router，并设置静态路由表。
  vueRouter = createRouter({
    history: createWebHashHistory(),
    routes: [baseRoute, vimLayoutRoute, ...vimRoutes],
  })

  // 添加路由守卫。
  vueRouter.beforeEach(doGuard)
}

function watchRelatedDataToRefreshVimLayoutRoutes(ctx: VimApplicationContext): void {
  function refreshVimLayoutRoutes(
    ctx: VimApplicationContext,
    navigationDefaultNodeKey: string,
    navigationNodeInfos: Readonly<Record<string, NodeInfo>>,
    visualizerVisualizerKey: string,
  ): void {
    if (!vueRouter) {
      throw new Error('不应该执行到此处, 请联系开发人员')
    }

    // 解析 VIM 布局路由表的重定向。
    vimLayoutRoute.redirect = { name: navigationDefaultNodeKey ?? '' }

    // 重置 vim.layout 路由表。
    vueRouter.removeRoute('vim.layout')
    vimLayoutRoute.path = '/vim/layout'
    vimLayoutRoute.children = []
    vueRouter.addRoute(vimLayoutRoute)

    // 遍历导航节点。
    for (const nodeInfo of Object.values(navigationNodeInfos)) {
      // 如果节点没有 router 信息，则跳过。
      if (!nodeInfo.router.required) {
        continue
      }

      type Meta = {
        guard: 'vim'
        permissionRequired: boolean
        permissionNode?: string
        ezNav: boolean
        visualizerKey?: string
        compreg: string
        componentParam?: JsonObject
      }

      // 构建元数据。
      if (!nodeInfo.router.component) {
        throw new Error('不应该执行到此处, 请联系开发人员')
      }
      let componentParam
      if (nodeInfo.router.component.param) {
        componentParam =
          nodeInfo.router.component.param[visualizerVisualizerKey] ??
          nodeInfo.router.component.param[''] ??
          {}
      } else {
        componentParam = {}
      }
      const meta: Meta = {
        guard: 'vim',
        permissionRequired: nodeInfo.permission.required,
        permissionNode: nodeInfo.permission.node,
        ezNav: nodeInfo.ezNav.shown,
        visualizerKey: visualizerVisualizerKey,
        compreg: nodeInfo.router.component.key,
        componentParam: componentParam,
      }

      // 构建 vim 子路由记录。
      const customCompregInfo = ctx.compreg().componentInfo(nodeInfo.router.component.key)
      const defaultCompregInfo = ctx.compreg().defaultComponentInfo()
      let component
      if (customCompregInfo) {
        component =
          customCompregInfo.component[visualizerVisualizerKey] ?? customCompregInfo.component['']
      } else {
        component = defaultCompregInfo.component['']
      }
      const vimChildRoute: RouteRecordRaw = {
        name: nodeInfo.key,
        path: '/vim/layout/' + (nodeInfo.router.path ?? ''),
        component: component,
        meta: meta,
      }

      // 将路由记录添加到 vim 路由表中。
      vueRouter.addRoute('vim.layout', vimChildRoute)
    }

    // 使用 router.replace 重新导航到当前路由，触发组件重新渲染。
    const currentRoute = vueRouter.currentRoute.value
    // 通过 nextTick 确保在下一个事件循环中执行路由替换。
    nextTick(() => {
      vueRouter!
        .replace({
          path: currentRoute.path,
          query: currentRoute.query,
        })
        .then(() => Promise.resolve())
    }).then(() => Promise.resolve())
  }

  const navigationStore = ctx.store().vueStore<'navigation', NavigationStore>('navigation')
  const visualizerStore = ctx.store().vueStore<'visualizer', VisualizerStore>('visualizer')

  watch(
    () => ({
      ready: ready,
      navigationDefaultNodeKey: navigationStore.defaultNodeKey,
      navigationNodeInfos: navigationStore.nodeInfos,
      visualizerVisualizerKey: visualizerStore.visualizerKey,
    }),
    (value) => {
      if (!value.ready) {
        return
      }
      refreshVimLayoutRoutes(
        ctx,
        value.navigationDefaultNodeKey,
        value.navigationNodeInfos,
        value.visualizerVisualizerKey,
      )
    },
    { deep: true, immediate: true },
  )
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
