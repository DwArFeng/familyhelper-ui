import type { VimApplicationContext } from '@/vim/types.ts'
import type {
  NavigationNodeInfo,
  NavigationNodeSetting,
  NavigationSetting,
  RouterInfo,
  VimNavigation,
  VimNavigationModule,
} from '@/navigation/types.ts'
import {
  defaultNavigationKey,
  ezNavEnabled,
  ezNavMaxActiveItem,
  ezNavRestoreWhenLogin,
} from '@/navigation/props.ts'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

type Module = { default: VimNavigationModule }

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'

/**
 * Navigation 根节点键数组。
 */
const navigationNodeRootKeys: string[] = []

/**
 * Navigation 节点信息。
 */
const navigationNodeInfos: Record<string, NavigationNodeInfo> = {}

/**
 * Navigation。
 */
const navigation: VimNavigation = {
  init,
  setting: setting(),
  nodeRootKeys,
  nodeInfos,
  nodeInfo,
}

/**
 * 初始化。
 *
 * @param ctx VIM 应用上下文对象。
 */
async function init(ctx: VimApplicationContext): Promise<void> {
  // 检查状态。
  // noinspection DuplicatedCode
  if (status !== 'initializing') {
    throw new Error('只能在 initializing 状态下初始化')
  }

  // 动态获取 modules 目录下的所有模块。
  const rawModules: Record<string, Module> = import.meta.glob('./modules/*.ts', { eager: true })

  // 定义 modules 对象。
  const modules: Record<string, Module> = {}

  // 遍历所有模块，解析单个模块，并将其存入 modules 对象。
  for (const moduleKey in rawModules) {
    /*
     * 获取模块名称。
     * 由于 import.meta.glob 返回的 key 是相对路径，故可使用正则表达式替换获取模块名称。
     */
    const moduleName: string = toKebabCase(moduleKey.replace(/^\.\/modules\/(\w+)\.ts$/, '$1'))
    // 将模块存入 modules 对象。
    modules[moduleName] = rawModules[moduleKey]
  }

  // 定义 NavigationNodeSetting 数组。
  const navigationNodeSettings: NavigationNodeSetting[] = []

  // 定义 Promise 数组。
  const promises: Promise<void>[] = []

  // 遍历所有模块，对其初始化。
  for (const moduleName in modules) {
    // 获取模块。
    const vimNavigationModule: VimNavigationModule = modules[moduleName]
      .default as VimNavigationModule
    // 初始化模块。
    const mayPromise = vimNavigationModule.init(ctx)
    // 判断 mayPromise 是否为 Promise，并执行对应操作。
    if (mayPromise instanceof Promise) {
      // 等待 mayPromise 完成后，将 NavigationNodeSetting 存入 navigationNodeSettings 数组。
      mayPromise.then(() => {
        navigationNodeSettings.push(...vimNavigationModule.provideNavigationNodeSettings())
      })
      // 将 Promise 存入 Promise 数组。
      promises.push(mayPromise)
    } else {
      // 将 NavigationNodeSetting 存入 navigationNodeSettings 数组。
      navigationNodeSettings.push(...vimNavigationModule.provideNavigationNodeSettings())
    }
  }

  // 等待所有 Promise 完成。
  await Promise.all(promises)

  // 将 NavigationNodeSetting 转换为 NavigationNodeInfo，并存入 navigationNodeInfos 对象。
  for (const navigationNodeSetting of navigationNodeSettings) {
    let routerInfo: RouterInfo
    if (navigationNodeSetting.router) {
      routerInfo = {
        required: true,
        path: navigationNodeSetting.router.path,
        component: navigationNodeSetting.router.component,
      }
    } else {
      routerInfo = {
        required: false,
      }
    }
    if (navigationNodeInfos[navigationNodeSetting.key]) {
      throw new Error(`导航节点 ${navigationNodeSetting.key} 重复`)
    }
    navigationNodeInfos[navigationNodeSetting.key] = {
      parentKey: navigationNodeSetting.parentKey,
      childKeys: [],
      key: navigationNodeSetting.key,
      index: navigationNodeSetting.index,
      display: navigationNodeSetting.display ?? {},
      menu: navigationNodeSetting.menu ?? { shown: false },
      ezNav: navigationNodeSetting.ezNav ?? { shown: false },
      router: routerInfo,
      permission: navigationNodeSetting.permission ?? { required: false },
    }
  }

  // 解析 NavigationNodeInfo 的 parentKey，并根据其值分类操作。
  for (const navigationNodeInfo of Object.values(navigationNodeInfos)) {
    // 如果 navigationNodeInfo.parentKey 存在，则将 navigationNodeInfo.key 存入其父节点的 childKeys 数组。
    if (navigationNodeInfo.parentKey) {
      navigationNodeInfos[navigationNodeInfo.parentKey].childKeys.push(navigationNodeInfo.key)
    }
    // 否则，将 navigationNodeInfo.key 存入 navigationNodeRootKeys 数组。
    else {
      navigationNodeRootKeys.push(navigationNodeInfo.key)
    }
  }

  // 对 navigationNodeInfos 对象的 childKeys 数组进行排序。
  for (const navigationNodeInfo of Object.values(navigationNodeInfos)) {
    navigationNodeInfo.childKeys.sort((a, b) => {
      return navigationNodeInfos[a].index - navigationNodeInfos[b].index
    })
  }

  // 设置状态。
  status = 'initialized'
}

/**
 * 获取设置。
 *
 * @return 设置。
 */
function setting(): NavigationSetting {
  return {
    defaultNavigationKey,
    ezNavEnabled,
    ezNavMaxActiveItem,
    ezNavRestoreWhenLogin,
  }
}

/**
 * 获取 Navigation 根节点键数组。
 *
 * @return Navigation 根节点键数组。
 */
function nodeRootKeys(): Readonly<string>[] {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 nodeRootKeys')
  }
  return navigationNodeRootKeys
}

/**
 * 获取 Navigation 节点信息数组。
 */
function nodeInfos(): Readonly<NavigationNodeInfo[]> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 nodeInfos')
  }
  return Object.values(navigationNodeInfos)
}

/**
 * 获取 Navigation 节点信息。
 *
 * @param key 导航键。
 */
function nodeInfo(key: string): Readonly<NavigationNodeInfo> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 nodeInfo')
  }
  return navigationNodeInfos[key]
}

export default navigation
