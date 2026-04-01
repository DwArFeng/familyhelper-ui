// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import { type VimApplicationContext } from '@/vim/types.ts'
import {
  type LibrarySetting,
  type VimLibrary,
  type VimLibraryModule,
  type VisualizerInfo,
  type VisualizerSetting,
} from '@/library/types.ts'
import { defaultVisualizerKey } from '@/library/props.ts'

import { toKebabCase } from '@dwarfeng/familyhelper-ui-component-util/src/util/string.ts'

type Module = { default: VimLibraryModule }

/**
 * 状态。
 */
let status: 'initializing' | 'initialized' = 'initializing'

/**
 * Visualizer 信息（按模块 key 索引）。
 */
const libraryVisualizerInfos: Record<string, VisualizerInfo> = {}

/**
 * Library。
 */
const library: VimLibrary = {
  init,
  setting: setting(),
  defaultVisualizerInfo,
  visualizerInfoKeys,
  visualizerInfos,
  visualizerInfo,
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
  const rawModules: Record<string, Module> = import.meta.glob('./modules/*/index.ts', {
    eager: true,
  })

  // 定义 modules 对象。
  const modules: Record<string, Module> = {}

  // 遍历所有模块，解析单个模块，并将其存入 modules 对象。
  for (const moduleKey in rawModules) {
    /*
     * 获取模块名称。
     * 由于 import.meta.glob 返回的 key 是相对路径，故可使用正则表达式替换获取模块名称。
     */
    const moduleName: string = toKebabCase(
      moduleKey.replace(/^\.\/modules\/(\w+)\/index\.ts$/, '$1'),
    )
    // 将模块存入 modules 对象。
    modules[moduleName] = rawModules[moduleKey]
  }

  /*
   * 将 VisualizerSetting 转为 VisualizerInfo。
   */
  function mapVisualizerInfo(setting: VisualizerSetting): VisualizerInfo {
    return {
      visualizer: setting.visualizer,
      name: setting.name,
      description: setting.description,
      exampleDisplay: setting.exampleDisplay,
    }
  }

  // 定义 Promise 数组。
  const promises: Promise<void>[] = []

  // 遍历所有模块，对其初始化。
  for (const moduleName in modules) {
    // 获取模块。
    const vimLibraryModule: VimLibraryModule = modules[moduleName].default as VimLibraryModule
    // 初始化模块。
    const mayPromise = vimLibraryModule.init(ctx)
    // 判断 mayPromise 是否为 Promise，并执行对应操作。
    if (mayPromise instanceof Promise) {
      // 等待 mayPromise 完成后，将 Visualizer 信息存入 libraryVisualizerInfos 对象。
      mayPromise.then(() => {
        const maySetting = vimLibraryModule.provideVisualizerSetting()
        if (maySetting) {
          libraryVisualizerInfos[moduleName] = mapVisualizerInfo(maySetting)
        }
      })
      // 将 Promise 存入 Promise 数组。
      promises.push(mayPromise)
    } else {
      // 将 Visualizer 信息存入 libraryVisualizerInfos 对象。
      const maySetting = vimLibraryModule.provideVisualizerSetting()
      if (maySetting) {
        libraryVisualizerInfos[moduleName] = mapVisualizerInfo(maySetting)
      }
    }
  }

  // 等待所有 Promise 完成。
  await Promise.all(promises)

  // 设置状态为 initialized。
  status = 'initialized'
}

/**
 * 获取设置。
 *
 * @returns 设置。
 */
function setting(): LibrarySetting {
  return {
    defaultVisualizerKey,
  }
}

/**
 * 获取默认的 Visualizer 信息。
 *
 * @returns 默认的 Visualizer 信息。
 */
function defaultVisualizerInfo(): VisualizerInfo {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 defaultVisualizerInfo')
  }
  const info: VisualizerInfo | undefined = libraryVisualizerInfos[defaultVisualizerKey]
  if (!info) {
    throw new Error('找不到默认的 Visualizer')
  }
  return info
}

/**
 * 获取 Visualizer key 列表。
 *
 * @returns Visualizer key 列表。
 */
function visualizerInfoKeys(): Readonly<string[]> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 visualizerInfoKeys')
  }
  return Object.keys(libraryVisualizerInfos)
}

/**
 * 获取 Visualizer 信息列表。
 *
 * @returns Visualizer 信息列表。
 */
function visualizerInfos(): Readonly<VisualizerInfo[]> {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 visualizerInfos')
  }
  return Object.values(libraryVisualizerInfos)
}

/**
 * 根据指定的 key 获取 Visualizer 信息。
 *
 * @param key 指定的 key。
 */
function visualizerInfo(key: string): VisualizerInfo | null {
  if (status === 'initializing') {
    throw new Error('不能在 initializing 状态下获取 visualizerInfo')
  }
  return libraryVisualizerInfos[key] || null
}

export default library
