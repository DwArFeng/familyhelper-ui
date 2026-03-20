// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import {
  type DisplayInfo,
  type DisplaySetting,
  type NodeInfo,
  type NodeSetting,
  type NavigationSetting,
  type VimNavigation,
  type VimNavigationModule,
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
const _nodeRootKeys: string[] = []

/**
 * Navigation 节点信息。
 */
const _nodeInfos: Record<string, NodeInfo> = {}

/**
 * Navigation。
 */
const navigation: VimNavigation = {
  init,
  setting: setting(),
  nodeRootKeys,
  nodeInfos,
}

/**
 * 初始化。
 *
 * @param ctx VIM 应用上下文对象。
 */
async function init(ctx: VimApplicationContext): Promise<void> {
  // 检查状态。
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

  // 定义 NodeSetting 数组。
  const nodeSettings: NodeSetting[] = []

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
      // 等待 mayPromise 完成后，将 NodeSetting 存入 nodeSettings 数组。
      mayPromise.then(() => {
        nodeSettings.push(...vimNavigationModule.provideNodeSettings())
      })
      // 将 Promise 存入 Promise 数组。
      promises.push(mayPromise)
    } else {
      // 将 NodeSetting 存入 nodeSettings 数组。
      nodeSettings.push(...vimNavigationModule.provideNodeSettings())
    }
  }

  // 等待所有 Promise 完成。
  await Promise.all(promises)

  /*
   * 对于 nodeSetting 的 display，将每个 key 都变为 kebab 格式，值保持不变。
   */
  function mapDisplay(displaySetting: DisplaySetting): DisplayInfo {
    const displayInfo: DisplayInfo = { '': {} }
    for (const key in displaySetting) {
      displayInfo[toKebabCase(key)] = displaySetting[key]
    }
    return displayInfo
  }

  // 将 NodeSetting 转换为 NodeInfo，并存入 _nodeInfos 对象。
  for (const nodeSetting of nodeSettings) {
    if (_nodeInfos[nodeSetting.key]) {
      throw new Error(`导航节点 ${nodeSetting.key} 重复`)
    }
    _nodeInfos[nodeSetting.key] = {
      parentKey: nodeSetting.parentKey,
      childKeys: [],
      key: nodeSetting.key,
      index: nodeSetting.index,
      display: mapDisplay(nodeSetting.display),
      menu: nodeSetting.menu ?? { shown: false },
      ezNav: nodeSetting.ezNav ?? { shown: false },
      router: nodeSetting.router ?? { required: false },
      permission: nodeSetting.permission ?? { required: false },
    }
  }

  // 解析 NodeInfo 的 parentKey，并根据其值分类操作。
  for (const nodeInfo of Object.values(_nodeInfos)) {
    // 如果 nodeInfo.parentKey 存在，则将 nodeInfo.key 存入其父节点的 childKeys 数组。
    if (nodeInfo.parentKey) {
      _nodeInfos[nodeInfo.parentKey].childKeys.push(nodeInfo.key)
    }
    // 否则，将 nodeInfo.key 存入 _nodeRootKeys 数组。
    else {
      _nodeRootKeys.push(nodeInfo.key)
    }
  }

  // 对 _nodeInfos 对象的 childKeys 数组进行排序。
  for (const nodeInfo of Object.values(_nodeInfos)) {
    nodeInfo.childKeys.sort((a, b) => {
      return _nodeInfos[a].index - _nodeInfos[b].index
    })
  }

  // 设置状态。
  status = 'initialized'
}

/**
 * 获取设置。
 *
 * @returns 设置。
 */
function setting(): NavigationSetting {
  return {
    defaultNodeKey: defaultNavigationKey,
    ezNavEnabled,
    ezNavMaxActiveItem,
    ezNavRestoreWhenLogin,
  }
}

/**
 * 获取 Navigation 根节点键数组。
 *
 * @returns Navigation 根节点键数组。
 */
function nodeRootKeys(): Readonly<string>[] {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 nodeRootKeys')
  }
  return _nodeRootKeys
}

/**
 * 获取 Navigation 节点信息数组。
 */
function nodeInfos(): Readonly<Record<string, NodeInfo>> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 nodeInfos')
  }
  return _nodeInfos
}

export default navigation
